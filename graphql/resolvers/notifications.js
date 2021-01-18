const { AuthenticationError, UserInputError } = require("apollo-server")
const checkAuth = require("../../util/checkAuth")
const Notification = require("../../models/Notification")
const { NOTIFICATION_FETCH_LIMIT, FETCH_LIMIT } = require("../../util/config")
const { subscribe } = require("graphql")

module.exports = {
  Query: {
    async getUserNotifications(_, { username }) {
      try {
        const notifications = await Notification.find({ sendTo: { $regex: "(?=.*" + username.split(" ").join(")|(?=.*") + ")", $options: "i" } })
          .sort({ _id: -1 })
          .limit(NOTIFICATION_FETCH_LIMIT)

        const notificationsTotal = await Notification.find({
          sendTo: { $regex: "(?=.*" + username.split(" ").join(")|(?=.*") + ")", $options: "i" },
          hasActioned: false
        }).count()
        return { notifications, notificationsTotal }
      } catch (err) {
        console.log(err)
      }
    },
    async getUserAllNotifications(_, { cursor, usertag, limit = FETCH_LIMIT }) {
      //Select one more record
      limit = limit + 1
      //If no cursor specified, it means it is for the first time; set the cursor to time now
      if (!cursor) {
        cursor = new ObjectID()
      }

      let query = { _id: { $lte: cursor } }
      //OR gate: (?=.*greece)|(?=.*dead). Here we're searching for greece OR dead in any order

      query["sendTo"] = { $regex: "(?=.*" + usertag.split(" ").join(")|(?=.*") + ")", $options: "i" }

      //fetch more more than needed
      let notifications = {}

      notifications = await Notification.find(query).sort({ _id: -1 }).limit(limit)

      if (notifications.length < limit) {
        cursor = "" //set the cursor to "" in case there are no posts left
      } else if (notifications.length > 1) {
        //there are more records...
        //pop the last one out if the count is limit + 1

        const _notification = notifications.pop()

        //set the cursor on the limit + 1'th record
        cursor = _notification.id
      }
      return { notifications, cursor }
    }
  },
  Mutation: {
    async readNotification(_, { notificationId }, context) {
      const { username } = checkAuth(context)

      const notification = await Notification.findById(notificationId)

      if (notification) {
        notification.hasActioned = true

        await notification.save()
        const notificationsTotal = await Notification.find({
          sendTo: { $regex: "(?=.*" + username.split(" ").join(")|(?=.*") + ")", $options: "i" },
          hasActioned: false
        }).count()
        return notificationsTotal
      } else throw new UserInputError("Notification not found")
    },
    async readAllNotification(_, { username }, context) {
      const logedInUser = checkAuth(context)
      if (logedInUser.username === username) {
        const filter = { sendTo: username }
        const updateData = {
          hasActioned: true
        }
        const notification = await Notification.updateMany(filter, updateData)

        if (notification) {
          const notifications = await Notification.find({ sendTo: { $regex: "(?=.*" + username.split(" ").join(")|(?=.*") + ")", $options: "i" } })
            .sort({ _id: -1 })
            .limit(NOTIFICATION_FETCH_LIMIT)

          const notificationsTotal = await Notification.find({
            sendTo: { $regex: "(?=.*" + username.split(" ").join(")|(?=.*") + ")", $options: "i" },
            hasActioned: false
          }).count()
          return { notifications, notificationsTotal }
        } else throw new UserInputError("Notifications not found")
      } else {
        throw new UserInputError("User not found")
      }
    }
  }
  // Subscription:{
  //   async createNotification(_, { type, link, actionBy, sendTo, message, userId, avatarUrl, userbikes, username, hasActioned }, context) {
  //     console.log('type',type)
  //     const user = checkAuth(context)
  //     try {

  //       const notification = await new Notification({
  //         type,
  //         link,
  //         actionBy,
  //         sendTo,
  //         message,
  //         userId,
  //         userbikes,
  //         avatarUrl,
  //         username,
  //         hasActioned,
  //         createdAt: new Date().toISOString()
  //       }).save()
  //       console.log('notification',notification)
  //       return  notification
  //     } catch (err) {
  //       throw new Error(err)
  //     }
  //   },
  // }
}
