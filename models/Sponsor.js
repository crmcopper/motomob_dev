const { model, Schema } = require("mongoose")

const sponsorSchema = new Schema({
  name: String,
  description: String,
  imageUrl: String,
  isActive: Boolean,
})

module.exports = model("Sponsor", sponsorSchema)
