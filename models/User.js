const { model, Schema } = require("mongoose")
const bikeSubSchema = new Schema(
  {
    // bikes subschema content
    bikeId: String,
    bikename: String,
    thumbUrl: String,
    prodStartYear: String
  },
  { _id: false } //Tell Mongo to not create Ids for subdocuments (default is true)
)

const userSubSchema = new Schema(
  {
    // user subschema content
    username: String,
    id: String,
    avatarUrl: String,
    followersCount: Number
  },
  { _id: false } //Tell Mongo to not create Ids for subdocuments (default is true)
)

const userSchema = new Schema({
  name: String,
  username: String,
  avatarUrl: String,
  password: String,
  email: String,
  createdAt: String,
  location: String,
  gender: String,
  admin: Boolean,
  usertag: String,
  bikes: String, //Used to showcase the User's bikes in posts. This is derived from ownBikes
  ownBikes: [bikeSubSchema],
  followBikes: [bikeSubSchema],
  createdAt: String,
  followers: [userSubSchema], //The users who follow me?
  followersCount: Number,
  following: [userSubSchema], //Who do I follow?
  notificationFrequency: String, //weekly,daily,off
  /*pending, normal, blocked, .... Could be anything, really. The front end will 
  look up this value and route to a specific page based on this status */
  status: String,
  // For OAuth sign in
  googleId: String,
  facebookId: String
})

module.exports = model("User", userSchema)
