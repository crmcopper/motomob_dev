const { model, Schema } = require("mongoose")

const notificationSchema = new Schema({
  type: String, //POST,COMMENT, REPLY...
  link: String, //Details to show on user action
  createdAt: String,
  actionBy: String, //Who is create comment or post
  sendTo: String,   //Send notification to who's has a comment or post
  message: String,
  hasActioned: Boolean,
  //details of the user who performed the action
  userId: String, 
  avatarUrl: String, 
  userbikes: String,
  username: String,
  
})

module.exports = model("Notification", notificationSchema)
