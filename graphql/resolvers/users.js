const { UserInputError } = require("apollo-server")
const { validateSignUpInput, getBikesStringForAvatar } = require("../../util/validators")
const { FETCH_LIMIT } = require("../../util/config")
const { FOLLOW_USER } = require("../../util/user-messages")
const User = require("../../models/User")
const Notification = require("../../models/Notification")
const checkAuth = require("../../util/checkAuth")

module.exports = {
  Query: {
    async getUsers(_, { username }) {
      try {
        //       const pattern = username.replace(/ /g, ".*")
        const users = await User.find({
          $or: [{ username: { $regex: username, $options: "i" } }, { name: { $regex: username, $options: "i" } }],
          status: "normal"
        }).limit(FETCH_LIMIT)
        return users
      } catch (err) {
        throw new Error(err)
      }
    },
    async getUser(_, { userId }) {
      try {
        const user = await User.findById(userId)
        if (user) {
          return user
        } else {
          throw new Error("User not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getUserOwnBikes(_, { userId }) {
      try {
        const user = await User.findById(userId)
        if (user) {
          return user
        } else {
          throw new Error("User not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getUserFollowBikes(_, { userId }) {
      try {
        const user = await User.findById(userId)
        if (user) {
          return user
        } else {
          throw new Error("User not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async editUser(_, { userId, name, avatarUrl, avatarFile, email, username, location, usertag }, context) {
      checkAuth(context)
      const { errors, valid } = validateSignUpInput(name, username, email, "password", location, "", "") //ignore password

      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }
      const user = await User.findById(userId)

      let checkUsername = await User.findOne({ username })
      if (checkUsername && username !== user.username) {
        throw new UserInputError("User name is taken", {
          errors: {
            username: "This User name is taken"
          }
        })
      }

      let checkEmail = await User.findOne({ email })
      if (checkEmail && email !== user.email) {
        throw new UserInputError("Email is taken", {
          errors: {
            email: "This email is taken"
          }
        })
      }
      try {
        let update = {
          name,
          email,
          username,
          location,
          usertag
        }

        if (avatarFile) {
          update.avatarUrl = avatarUrl
        }

        //Let's assign the update opeation to the update object, esle we get back null for fields not updated
        const editUserData = await User.findOneAndUpdate({ _id: userId }, update, { new: true })

        return editUserData
      } catch (err) {
        throw new Error(err)
      }
    },
    async addBikes(_, { bikes, type }, context) {
      const userInContext = checkAuth(context)
      const user = await User.findById(userInContext.id)

      let update = {}
      if (type == "Own") {
        const combinedBikes = [...user.ownBikes, ...bikes]
        const userBikes = getBikesStringForAvatar(combinedBikes)

        update = {
          ownBikes: combinedBikes,
          bikes: userBikes
        }
      } else {
        const combinedBikes = [...user.followBikes, ...bikes]
        update = {
          followBikes: combinedBikes
        }
      }

      try {
        await User.findOneAndUpdate({ _id: userInContext.id }, update, { new: true })
        return await User.findById(userInContext.id)
      } catch (err) {
        throw new Error(err)
      }
    },
    async deleteUserBike(_, { userId, bikeId, type }, context) {
      checkAuth(context)
      const user = await User.findById(userId)

      if (type == "follow") {
        user.followBikes.map((followBike, key) => {
          if (followBike.bikeId == bikeId) {
            user.followBikes.splice(key, 1)
          }
        })
      } else {
        user.ownBikes.map((ownBike, key) => {
          if (ownBike.bikeId == bikeId) {
            //If only one bike is present, you cannot delete
            if (user.ownBikes.length === 1) {
              return //We cannot remove all bikes. We've got to have at least one Bike
            } else {
              user.ownBikes.splice(key, 1)
              //If an owned bike is removed, check if the bikeString needs to be altered
              user.bikes = getBikesStringForAvatar(user.ownBikes)
            }
          }
        })
      }

      const update = {
        ownBikes: user.ownBikes,
        followBikes: user.followBikes,
        bikes: user.bikes
      }

      try {
        await User.findOneAndUpdate({ _id: userId }, update), { new: true }
        return await User.findById(userId)
      } catch (err) {
        throw new Error(err)
      }
    },
    async followUser(_, { userId, username, avatarUrl }, context) {
      const userInContext = checkAuth(context)

      //this tage we have used for user follow or unfollow profile. if user only follow that time we have saved notification on follow

      let isFollow = false

      //TODO: We can certainly streamline the User fragment/snapshot that is used in many places (userId, username, avatarUrl, ...)

      // When a user clicks on follow
      // 1. Add the current user in the target user's followers list
      let _followingUser = {}
      _followingUser.id = userInContext.id
      _followingUser.avatarUrl = userInContext.avatarUrl
      _followingUser.username = userInContext.username

      // 2. Update the current user: following (target) (reverse of 1)
      let _followedUser = {}
      _followedUser.id = userId
      _followedUser.avatarUrl = avatarUrl
      _followedUser.username = username

      try {
        //Update the target user's followers array

        const getFollowedUserData = await User.findOne({ _id: userId })

        if (getFollowedUserData.followers.find(user => user.id === userInContext.id)) {
          let newCount = 0

          //TODO: Wrong use of ternary operator. Change below anti-patterns
          getFollowedUserData.followersCount && getFollowedUserData.followersCount > 0 ? (newCount = --getFollowedUserData.followersCount) : (newCount = 0)

          getFollowedUserData.followersCount = newCount

          let newFollowedUser = getFollowedUserData.followers.filter(user => user.id !== userInContext.id)

          getFollowedUserData.followers = newFollowedUser

          await User.findOneAndUpdate({ _id: userId }, getFollowedUserData, { new: true })

          await User.findOneAndUpdate({ _id: userInContext.id }, { $pull: { following: { id: userId } } }, { new: true })
        } else {
          isFollow = true

          let newCount = 0

          getFollowedUserData.followersCount ? (newCount = ++getFollowedUserData.followersCount) : (newCount = 1)

          getFollowedUserData.followersCount = newCount
          getFollowedUserData.followers.push(_followingUser)

          await User.findOneAndUpdate({ _id: userId }, getFollowedUserData, { new: true })

          await User.findOneAndUpdate({ _id: userInContext.id }, { $push: { following: _followedUser } }, { new: true })
        }

        //notification not save when follow user
        if (isFollow) {
          //if any user saved post than we have added notification
          const user = await User.findById(userInContext.id)

          const notificationData = {
            type: "Follow",
            link: "/profile/" + user.id,
            actionBy: user.name,
            sendTo: username,
            message: FOLLOW_USER,
            userId: user.id,
            userbikes: user.userbikes,
            avatarUrl: user.avatarUrl,
            username: user.username,
            hasActioned: false,
            createdAt: new Date().toISOString()
          }

          await new Notification(notificationData).save()
        }

        return getFollowedUserData
      } catch (err) {
        throw new Error(err)
      }
    },
    //async followBike(_, { bikeId, bikename, thumbUrl }, context) {
    async followBike(_, { bikes }, context) {
      const userInContext = checkAuth(context)
      const user = await User.findById(userInContext.id)

      try {
        // check if user has already followed the bike(i.e. bikeId present in followedBikes array) then remove else add to array
        let updatedUser = {}
        if (user.followBikes.find(bike => bike.bikeId === bikes[0].bikeId)) {
          updatedUser = await User.findOneAndUpdate({ _id: userInContext.id }, { $pull: { followBikes: { bikeId: bikes[0].bikeId } } }, { new: true })
        } else {
          let _followedBike = bikes[0]
          updatedUser = await User.findOneAndUpdate({ _id: userInContext.id }, { $push: { followBikes: _followedBike } }, { new: true })
        }
        return updatedUser
      } catch (err) {
        throw new Error(err)
      }
    },
    async saveNotificationFrequency(_, { frequency }, context) {
      const { id } = checkAuth(context)

      const user = await User.findById(id)
      try {
        if (user) {
          ;(user.notificationFrequency = frequency), await User.findOneAndUpdate({ _id: id }, user, { new: true })
        } else {
          throw new Error("User not found")
        }

        return user
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
