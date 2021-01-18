const { model, Schema } = require("mongoose")

const feedbackSchema = new Schema({
  pageLink: String,
  description: String,
  username: String
})

module.exports = model("Feedback", feedbackSchema)