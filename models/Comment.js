const { model, Schema } = require("mongoose")

const userSubSchema = new Schema(
  {
    // user subschema content
    username: String,
    id: String,
    avatarUrl: String,
    followersCount: Number //not mandatory
  },
  { _id: false } //Tell Mongo to not create Ids for subdocuments (default is true)
)

const commentSchema = new Schema({
  body: String,
  postId: String,
  replyToId: String,
  // Storing user information in the post so that when a post is displayed, the poster's details are visible.
  // Username, UserId are unique - no issues
  //TODO
  // AvatarUrl is a reference and if changed, will be picked up from AWS
  // Userbikes is currently static and needs to be made dynamic (Client/serverside load? DynamoDB?)
  name: String,
  username: String,
  userId: String,
  avatarUrl: String,
  userbikes: String,
  createdAt: String,
  replies: [Object],
  likes: [userSubSchema],
  likeCount: Number,
  dislikes: [userSubSchema],
  dislikeCount: Number
})

module.exports = model("Comment", commentSchema)
