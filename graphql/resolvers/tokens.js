const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { UserInputError } = require("apollo-server")

const { validateSignUpInput, validateSignInInput, getBikesStringForAvatar, validateForgotPassword, validateResetPassword } = require("../../util/validators")
const {
  ERROR_USER_EMAIL_NOT_FOUND,
  INFO_USER_PASSWORD,
  ERROR_USER_EMAIL_NOT_VERIFIED,
  ERROR_USER_EMAIL_INCORRECT,
  URL_SIGN_UP_PENDING,
  ERROR_USER_INCORRECT
} = require("../../util/user-messages")
const User = require("../../models/User")
const Token = require("../../models/Token")
const checkAuth = require("../../util/checkAuth")
const { FROM_EMAIL } = require("../../util/config")
const mail = require("../../util/mail")
const { log } = require("../../util/logger")
const { parseCookies } = require("../../util/cookieParser")
const { authenticateGoogle, authenticateFacebook } = require("../../util/oauth")
let moment = require("moment")

//Not sending in the user object as during a tiken refresh, we have a different structure. making it explicit.
function generateToken(userid, username) {
  return jwt.sign(
    {
      // Storing typical values that are used during mutations
      id: userid,
      username: username
      //  email: user.email,
      //avatarUrl: user.avatarUrl
    },
    process.env.TOKEN_SECRET_KEY,
    { expiresIn: "15m" }
  )
}
//This toke used for forgot password and when user register
function generateTemporaryToken(user) {
  return jwt.sign(
    {
      // Storing typical values that are used during mutations
      id: user.id,
      username: user.username,
      email: user.email
      //avatarUrl: user.avatarUrl
    },
    process.env.TOKEN_SECRET_KEY,
    { expiresIn: "1d" }
  )
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      // Storing typical values that are used during mutations
      username: user.username
    },
    process.env.REFRESH_TOKEN_SECRET_KEY
    //Never expires; we need to handle this manually. This token is invalidated when a user logsOff
  )
}

/**
 * Generic function to validate a provder token and extract user details and return user
 */
async function checkProviderToken(context, provider) {
  let userdataInProvider = {}
  if (provider === "facebook") {
    userdataInProvider.provider = "facebook"
    let data = await authenticateFacebook(context.req, context.res)
    if (data.data) {
      //extract User information from provider
      userdataInProvider.email = data.data.profile.emails[0].value
      userdataInProvider.facebookId = data.data.profile.id
      userdataInProvider.name = data.data.profile.displayName
      if (data.data.profile.emails[0].value) {
        userdataInProvider.user = await User.findOne({ email: data.data.profile.emails[0].value })
      } else {
        userdataInProvider.user = await User.findOne({ facebookId: data.data.profile.id })
      }
    } else {
      throw new Error("Invalid facebook token!!!")
    }
  } else if (provider === "google") {
    userdataInProvider.provider = "google"
    let data = await authenticateGoogle(context.req, context.res)

    if (data.data) {
      //extract User information from provider
      userdataInProvider.email = data.data.profile.emails[0].value
      userdataInProvider.name = data.data.profile.displayName
      userdataInProvider.googleId = data.data.profile.id
      userdataInProvider.user = await User.findOne({ email: data.data.profile.emails[0].value })
    } else {
      throw new Error("Invalid google token!!!")
    }
  } else {
    throw new Error("Unsupported provider!!!")
  }

  return userdataInProvider
}

module.exports = {
  Query: {},
  Mutation: {
    async signin(_, { username, password }, context) {
      const user = await User.findOne({ $or: [{ username: username }, { email: username }] })

      const { errors, valid } = validateSignInInput(username, password, user)
      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }
      //const user = await User.findOne({ username })
      if (!user) {
        log(ERROR_USER_EMAIL_INCORRECT, context, "error", "user")
        errors.general = ERROR_USER_EMAIL_INCORRECT
        throw new UserInputError(ERROR_USER_EMAIL_INCORRECT, { errors })
      }

      const match = await bcrypt.compare(password, user.password)
      //   console.log('match', match)
      if (!match) {
        if (user && (user.googleId || user.facebookId)) {
          log(ERROR_USER_INCORRECT, context, "error", "user")
          errors.general = ERROR_USER_INCORRECT
          throw new UserInputError(ERROR_USER_INCORRECT, { errors })
        } else {
          log(ERROR_USER_INCORRECT, context, "error", "user")
          errors.general = ERROR_USER_INCORRECT
          throw new UserInputError(ERROR_USER_INCORRECT, { errors })
        }
      }
      //If the user is not OK to sign in (for whatever reason), return here with reason
      if (user.status === "pending") {
        log(ERROR_USER_EMAIL_NOT_VERIFIED, context, "info", "user")
        errors.general = `Please confirm your email address`
        let userId = user.id
        let userEmail = user.email
        throw new UserInputError("User not Authorised to proceed", { errors, userId, userEmail })
      } else if (user.status === "blocked") {
        // fillup later...
      } else {
        //normal
        //all OK
      }

      const token = generateToken(user.id, user.username)
      const refreshToken = generateRefreshToken(user)

      //Add the refresh token to the DB
      await Token.update({ username }, { userid: user.id, refreshToken, createdAt: new Date().toISOString() }, { upsert: true })

      return {
        ...user._doc,
        id: user._id,
        token,
        refreshToken
      }
    },
    async signinWithProvider(_, { access_token, provider }, context) {
      context.req.body.access_token = access_token
      const userdataInProvider = await checkProviderToken(context, provider)
      const user = userdataInProvider.user

      if (user) {
        if (user.status === "pending") {
          log(ERROR_USER_EMAIL_NOT_VERIFIED, context, "info", "user")

          //If the email of provider is same as the user email, change status to normal and proceed!
          await User.findOneAndUpdate({ _id: user.id }, { status: "normal" }, { new: true })
        } else if (user.status !== "normal") {
          throw new UserInputError("User not Authorised to proceed", { errors, userId, userEmail })
        }

        //Status is normal
        const token = generateToken(user.id, user.username)
        const refreshToken = generateRefreshToken(user)
        //Add the refresh token to the DB
        await Token.update({ username: user.username }, { userid: user.id, refreshToken, createdAt: new Date().toISOString() }, { upsert: true })
        return {
          ...user._doc,
          id: user._id,
          token,
          refreshToken
        }
      } else {
        throw new UserInputError("USER_NOT_FOUND", {
          access_token: access_token,
          email: userdataInProvider.email,
          name: userdataInProvider.displayName,
          provider
        })
      }
    },
    async signup(_, { registerInput: { name, username, avatarUrl, email, password, location, ownBikes, provider, access_token } }, context) {
      // Validate user data
      let status = "pending"

      const { valid, errors } = validateSignUpInput(name, username, email, password, location, ownBikes, provider)

      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }

      context.req.body.access_token = access_token
      let userdataInProvider = {}

      if (provider) {
        userdataInProvider = await checkProviderToken(context, provider)

        if (userdataInProvider.email) {
          status = "normal"
        }
      }

      // Make sure user doesnt already exist
      let userName = await User.findOne({ username })

      // Make sure email doesnt already exist
      userEmail = await User.findOne({ email })

      if (userName && userEmail) {
        throw new UserInputError("Email and User name are taken", {
          errors: {
            email: "This email is taken",
            username: "This User name is taken"
          }
        })
      } else if (userEmail) {
        throw new UserInputError("Email is taken", {
          errors: {
            email: "This email is taken"
          }
        })
      } else if (userName) {
        throw new UserInputError("User name is taken", {
          errors: {
            username: "This User name is taken"
          }
        })
      }

      // hash password and create an auth token
      if (password) {
        password = await bcrypt.hash(password, 12)
      }

      const newUser = new User({
        email,
        name,
        avatarUrl,
        username,
        password,
        ownBikes,
        bikes: getBikesStringForAvatar(ownBikes),
        location,
        usertag: "",
        notificationFrequency: "daily",
        //When a new user is created, s/he cannot log in immediately; they have email confirmation to ack.
        status,
        createdAt: new Date().toISOString()
      })

      const userData = await newUser.save()
      if (userData) {
        log("New User Created!!!", context, "info", "user")
        userData.avatarUrl = process.env.FILE_STORE_PREFIX + "users/" + userData.id
        userData.googleId = userdataInProvider.googleId
        userData.facebookId = userdataInProvider.facebookId
        //Let's update the avatar url with userid
        await User.findOneAndUpdate({ _id: userData.id }, userData, { new: true })
      }
      //generate token and send mail
      let token = generateTemporaryToken(newUser)

      const url = `${process.env.MOTOMOB_PREFIX}${URL_SIGN_UP_PENDING}/${token}`

      //TODO: Move this to email-templates and use Pug
      //Send confirmation email if user enter manually email
      //If we are getting email address from fb and google then don't send confirmtion mail
      if (!userdataInProvider.email) {
        //   console.log('send mail')
        mail.send(
          newUser.email,
          "Welcome to MotoMob. Please confirm your email address.",
          _,
          ` Hello ${name}, 
            <p>
            We are super excited to have you join MotoMob. Please confirm your email address by clicking on the link below, or copying the link to your favourite browser. <b>This token is valid for 24 hours<b>.
            <p>
            <a href="${url}">${url}</a>
            <p>
            We look forward to seeing your awesome posts… 
            <p>
            Thank you!
            <p>
            MotoMob Team
          `
        )

        //send mail to system owner for user track
        mail.send(
          FROM_EMAIL,
          "New user has registered in motomob",
          _,
          ` Hello , 
          <p>
          name : ${name}
          provider : ${provider}
         
          email: ${email}
          <p>
          Thank you!
          <p>
        `
        )
      }

      token = generateToken(userData.id, userData.username)
      const refreshToken = generateRefreshToken(userData)

      if (provider) {
        //Add the refresh token to the DB
        await Token.update({ username: userData.username }, { userid: userData.id, refreshToken, createdAt: new Date().toISOString() }, { upsert: true })
      }
      return {
        ...userData._doc,
        id: userData._id,
        token,
        refreshToken
      }
    },
    async confirmEmail(_, { token }) {
      const user = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
      const updatedUser = await User.findOneAndUpdate({ _id: user.id }, { status: "normal" }, { new: true })

      //User not found
      if (!updatedUser) {
        throw new UserInputError("Expired token", {
          errors: {
            reason: "Expired token"
          }
        })
      }

      newToken = generateToken(updatedUser.id, updatedUser.username)
      const refreshToken = generateRefreshToken(user)

      //Add the refresh token to the DB
      await Token.update({ username: user.username }, { userid: user.id, refreshToken, createdAt: new Date().toISOString() }, { upsert: true })

      //Send welcome email
      mail.send(
        updatedUser.email,
        "Welcome to MotoMob! We look forward to reading your stories...",
        _,
        ` Hello ${updatedUser.name},
          <p>
          We are super excited to welcome you to MotoMob! 
          <p>
          MotoMob is designed to enhance our lifestyle as motorcyclists. We would love for you to share your experiences on MotoMob: motorbike travels, experiences in owning bikes, technical expertise, photos, videos, etc. 
          <p>
          As you start to use MotoMob, you will see that some features are not yet complete. We are working at breakneck speed to get them completed. 
          We thank you for your patience and support as we continue to expand the platform. You can see what we are working on here: <a href="https://www.motomob.me/roadmap.html">https://www.motomob.me/roadmap.html</a>
          <p>
          With your help, MotoMob can become the most useful tool for bikers around the world! 
          <p>
          Thank you!
          <p>
          MotoMob Team
        `
      )

      return {
        ...updatedUser._doc,
        id: updatedUser._id,
        token: newToken,
        refreshToken
      }
    },
    async resendEmail(_, { userId }) {
      //Sign in was successful, but user is in "pending" and has requested for an email resend
      const user = await User.findById(userId)
      if (user.status === "pending") {
        //generate token and send mail
        const token = generateTemporaryToken(user)
        const url = `${process.env.MOTOMOB_PREFIX}${URL_SIGN_UP_PENDING}/${token}`

        //Send confirmation email
        mail.send(
          user.email,
          "Welcome to MotoMob. Please confirm your email address.",
          _,
          ` Hello ${user.name}, 
          <p>
          We are super excited to have you join MotoMob. Please confirm your email address by clicking on the link below, or copy/pasting the link in your favourite browser. <b>This token is valid for 24 hours<b>.
          <p>
          <a href="${url}">${url}</a>
          <p>
          We look forward to seeing your awesome posts… 
          <p>
          Thank you!
          <p>
          MotoMob Team
        `
        )
      }

      return `Email sent to ${user.email}`
    },
    async refreshAccessToken(_, { refreshToken }, context) {
      if (!refreshToken) {
        const errors = "Please log in again"
        throw new UserInputError("Invalid refresh token", { errors })
      }

      //extract user from refreshtoken
      const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY)
      //Find the refreshtoken
      let userFromTok = await Token.findOne({ username: user.username })
      //TODO: What to do if the token stored is different from the one sent?
      if (!userFromTok) {
        const errors = "Please log in again"
        throw new UserInputError("User logged out. Invalid refresh token", { errors })
      }

      //All OK .... carry on
      token = generateToken(userFromTok.userid, userFromTok.username)

      return token
    },
    async forgotPassword(_, { email }, context) {
      const { errors, valid } = validateForgotPassword(email)
      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }

      //const user = await User.findOne({ username })
      const user = await User.findOne({ email: email })

      if (!user) {
        log(ERROR_USER_EMAIL_NOT_FOUND, context, "error", "user")
        errors.email = ERROR_USER_EMAIL_NOT_FOUND
        throw new UserInputError(ERROR_USER_EMAIL_NOT_FOUND, { errors })
      }

      //If the user is not OK to sign in (for whatever reason), return here with reason
      if (user.status === "pending") {
        log(ERROR_USER_EMAIL_INCORRECT, context, "error", "user")
        errors.email = ERROR_USER_EMAIL_INCORRECT
        let userId = user.id
        let userEmail = user.email
        throw new UserInputError("User not Authorised to proceed", { errors, userId, userEmail })
      } else if (user.status === "blocked") {
      } else {
        //user status normal
        //generate token and send forgot password mail
        const token = generateTemporaryToken(user)

        const url = `${process.env.MOTOMOB_PREFIX}/reset-password/${token}`

        //TODO: Move this to email-templates and use Pug
        //Send forgot password email
        mail.send(
          user.email,
          "Reset password",
          _,
          ` Hello ${user.name}, 
          <p>
          Please reset your password by clicking on the link below, or copying the link to your favourite browser. <b>This token is valid for 24 hours<b>.
          <p>
          <a href="${url}">${url}</a>
          <p>
          Thank you!
          <p>
          MotoMob Team
        `
        )
      }

      return user
    },
    async resetPassword(_, { email, password, token }, context) {
      const userData = jwt.verify(token, process.env.TOKEN_SECRET_KEY)

      const { errors, valid } = validateResetPassword(userData.email, email, password)
      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }

      const user = await User.findOne({ email: userData.email })

      if (!user) {
        log(ERROR_USER_EMAIL_NOT_FOUND, context, "error", "user")
        errors.general = ERROR_USER_EMAIL_NOT_FOUND
        throw new UserInputError(ERROR_USER_EMAIL_NOT_FOUND, { errors })
      }

      //If the user is not OK to sign in (for whatever reason), return here with reason
      if (user.status === "normal") {
        log(INFO_USER_PASSWORD, context, "info", "user")
        password = await bcrypt.hash(password, 12)
        const updatedUser = await User.findOneAndUpdate({ email: user.email }, { password: password }, { new: true })

        if (updatedUser) {
          return updatedUser
        }
      }
    }
  }
}
