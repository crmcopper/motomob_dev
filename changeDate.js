require("dotenv").config()
var mongoose = require("mongoose")
const Post = require("./models/Post")
var moment = require("moment")
;(async () => {
  await mongoose.connect(process.env.MONGOURL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
  console.log("create new connection into db....")
  try {
    return new Promise(async (resolve, _) => {
      const posts = await Post.find({ postType: "TripPost" }).sort({ _id: -1 })
      console.log("total posts", posts.length)
      for (let index = 0; index < posts.length; index++) {
        console.log("posts[index]", posts[index].when)
        let postId = posts[index]._id
        let postData = posts[index]
        postData.when = moment(posts[index].when).format("YYYY-MM-DD")
        console.log("postData", postData.when)
        console.log("postId", postId)

        await Post.findOneAndUpdate({ _id: postId }, postData, { new: true })
      }
      return resolve()
    })
  } catch (err) {
    console.log(err)
  }

  console.log("Closing db connection....")
  await mongoose.connection.close()
  return
})()
