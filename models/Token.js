const { model, Schema } = require("mongoose")

const tokenSchema = new Schema({
  userid: String,
  username: String,
  refreshToken: String
})

module.exports = model("Token", tokenSchema)
