const { model, Schema } = require("mongoose")

const bikeSchema = new Schema({
  bikename: String,
  pictureUrls: [String],
  thumbUrl: String,
  description: String,
  isActive: Boolean,
  prodStartYear: String,
  prodEndYear: String,
  storyUrl: String,
  category: [String],
  brand: String,
  createdAt: String
})

module.exports = model("Bike", bikeSchema)
