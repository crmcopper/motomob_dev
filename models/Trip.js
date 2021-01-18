const { model, Schema } = require("mongoose")

const tripSchema = new Schema({
  tripName: String,
  coverUrl: String,
  isActive: Boolean,
  userId: String,
  createdAt: String,
  savedtag: String,
  saveCount: Number,
})

module.exports = model("Trip", tripSchema)
