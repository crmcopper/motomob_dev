const { model, Schema } = require("mongoose")

const photoSubSchema = new Schema(
  {
    username: String,
    imageUrl: String,
    thumbUrl: String,
    bikeId: String,
    bikename: String,
    bikethumbUrl: String,
    likes: [Object],
    name:String,
    avatarUrl:String,
    userId:String,
  }
)
const sponsorSubSchema = new Schema(
  {
    id: String,
    name: String,
    imageUrl: String,
  }
)

const contestSchema = new Schema({
  title: String,
  createdAt: String,
  sponsors: [sponsorSubSchema],
  imageUrl: String,
  closingDate: String,
  isActive: Boolean,
  photos: [photoSubSchema],
  sponsor_description: String,
  prize_description: String,
  criteria_description: String,
})

module.exports = model("Contest", contestSchema)
