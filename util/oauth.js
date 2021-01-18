let passport = require("passport")
let FacebookTokenStrategy = require("passport-facebook-token")
let GoogleTokenStrategy = require("passport-google-token")

const FacebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) =>
  done(null, {
    accessToken,
    refreshToken,
    profile
  })

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET
    },
    FacebookTokenStrategyCallback
  )
)

// GOOGLE STRATEGY
const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) =>
  done(null, {
    accessToken,
    refreshToken,
    profile
  })

passport.use(
  new GoogleTokenStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    GoogleTokenStrategyCallback
  )
)

const authenticateFacebook = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate("facebook-token", { session: false }, (err, data, info) => {
      if (err) resolve(false)
      resolve({ data, info })
    })(req, res)
  })

const authenticateGoogle = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate("google-token", { session: false }, (err, data, info) => {
      if (err) resolve(false)
      resolve({ data, info })
    })(req, res)
  })

module.exports = {
  authenticateFacebook,
  authenticateGoogle
}
