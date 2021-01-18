//This collection stores the links that require (dynamic) meta-tags used for sharing

const { model, Schema } = require("mongoose")

const linkSchema = new Schema({
  url: String,
  title: String,
  description: String,
  imageUrl: String,
  type: String
})

module.exports = model("Link", linkSchema)
