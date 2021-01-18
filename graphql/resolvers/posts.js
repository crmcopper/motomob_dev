const { AuthenticationError, UserInputError } = require("apollo-server")
ObjectID = require("mongodb").ObjectID
const Post = require("../../models/Post")
const Link = require("../../models/Link")
const Comment = require("../../models/Comment")
const Notification = require("../../models/Notification")
const User = require("../../models/User")
const checkAuth = require("../../util/checkAuth")
const { FETCH_LIMIT } = require("../../util/config")
const { SAVE_POST, LIKE_POST } = require("../../util/user-messages")
const { validateForumPost, validateBasicPost, validateTripPost, validateBikePost, validateSearchForumPost } = require("../../util/validators")
const { log } = require("../../util/logger")
const Trip = require("../../models/Trip")
const DEFAULT_TRIP_COVER = "https://motomob-test.s3.eu-west-2.amazonaws.com/posts/dx68e-trip-default-cover.png"

const paginate = (array, page_size, page_number) => {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const getPattern = (usertag, type) => {
  let pattern = ""
  let data = {}

  if (type === "posts") {
    if (usertag) {
      pattern = "(?=.*" + usertag.split(" ").join(")|(?=.*") + ")"
    }

    data = { pattern: pattern, field: "title" }
  } else if (type === "bikes") {
    data = { pattern: usertag, field: "postag" }
  } else if (type === "trips") {
    data = { pattern: usertag, field: "location" }
  } else if (type === "userPosts" || type === "userTrips") {
    data = { pattern: usertag, field: "userId" }
  }

  return data
}

module.exports = {
  Query: {
    async searchPosts(_, { cursor, fieldmap, limit }) {
      console.log("searchPosts -> cursor", cursor)
      //If no cursor specified, it means it is for the first time; set the cursor to time now
      if (!cursor) {
        cursor = new ObjectID() /* new Date().toISOString() */
      }
      //create dynamic query based on incoming field
      let qy = []

      fieldmap.forEach(pair => {
        if (pair.pattern) {
          let qs = {}
          let pattern = pair.pattern

          //AND gate: (?=.*greece).*(?=.*dead). Here we're searching for greece AND dead in any order
          //OR gate: (?=.*greece)|(?=.*dead). Here we're searching for greece OR dead in any order
          let gate = pair.gate === "OR" ? "|" : ".*" //default is AND

          pattern.replace(/[\n\r\s\t]+/g, " ")
          pattern = "(?=.*" + pattern.split(" ").join(`)${gate}(?=.*`) + ")"
          qs[pair.field] = { $regex: pattern, $options: "i" }
          qy.push(qs)
        }
      })
      //  console.log(qy)
      //fetch more more than needed
      const posts = await Post.find({ $and: [{ _id: { $lte: cursor }, $and: qy }] })
        .limit(limit + 1)
        .sort({ _id: -1 }) //Select one more record
      //       .sort({ _id: -1 })

      //pop the last one out

      if (posts.length < limit) {
        cursor = "" //set the cursor to "" in case there are no posts left
      } else if (posts.length > limit) {
        //set the cursor on the limit + 1'th record
        const _post = posts.pop()
        cursor = _post.id
      } else {
        cursor = "" //set the cursor to "" in case there are no posts left
      }

      return { posts, cursor }
    },
    async getPosts(_, { cursor, usertag, limit = FETCH_LIMIT, type }) {
      //Select one more record
      limit = limit + 1
      if (type === "trips" && usertag.trim() === "") {
        throw new Error("Trip must not be empty")
      }
      //If no cursor specified, it means it is for the first time; set the cursor to time now
      if (!cursor) {
        cursor = new ObjectID()
      }

      let query = { _id: { $lte: cursor } }
      //OR gate: (?=.*greece)|(?=.*dead). Here we're searching for greece OR dead in any order
      let patternData = getPattern(usertag, type)
      let pattern = ""
      if (usertag) {
        usertag.replace(/[\n\r\s\t]+/g, " ")
        if (usertag.length > 0) {
          pattern = patternData.pattern
        }
      }

      query[patternData.field] = { $regex: pattern, $options: "i" }
      if (type === "userTrips") {
        query["postType"] = "TripPost"
      }

      //fetch more more than needed
      let posts = {}

      if (type === "userTrips") {
        posts = await Post.find(query).sort({ when: -1 }).limit(limit)
      } else {
        posts = await Post.find(query).sort({ _id: -1 }).limit(limit)
      }

      if (posts.length < limit) {
        cursor = "" //set the cursor to "" in case there are no posts left
      } else if (posts.length > 1) {
        //there are more records...
        //pop the last one out if the count is limit + 1

        const _post = posts.pop()

        //set the cursor on the limit + 1'th record
        cursor = _post.id
      }

      //text.replace(/[\n\r\s\t]+/g, ' ') - remove all extra spaces
      return { posts, cursor }
    },
    async getUserPosts(_, { cursor, userId, limit = FETCH_LIMIT }) {
      //If no cursor specified, it means it is for the first time; set the cursor to time now
      if (!cursor) {
        cursor = new ObjectID()
      }

      //fetch more more than needed
      const posts = await Post.find({ _id: { $lte: cursor }, userId: userId })
        .sort({ _id: -1 })
        .limit(limit + 1) //Select one more record

      if (posts.length < limit) {
        cursor = "" //set the cursor to "" in case there are no posts left
      } else {
        //there are more records...
        //pop the last one out if the count is limit + 1
        const _post = posts.pop()

        //set the cursor on the limit + 1'th record
        cursor = _post.id
      }

      //text.replace(/[\n\r\s\t]+/g, ' ') - remove all extra spaces
      return { posts, cursor }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId)
        if (post) {
          // Find the comments for the Post
          post.comments = await Comment.find({ postId }).sort({ _id: -1 }).limit(FETCH_LIMIT)

          return post
        } else {
          throw new Error("Post not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async searchForumPost(_, { bikename, location, title, quesType, cursor, limit = FETCH_LIMIT }) {
      const { valid, errors } = validateSearchForumPost(bikename, location, title, quesType)
      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }
      limit = limit + 1
      if (!cursor) {
        cursor = new ObjectID()
      }
      let criteria = { _id: { $lte: cursor } }

      if (bikename.length) {
        //WHen we're searching forum posts, we dont need the year of manufacture as the fixes to one year (bike) might still be relevant
        const pattern = "(^.*?" + bikename.join(".*?$)|(^.*?") + ".*?$)"
        criteria["postag"] = { $regex: pattern, $options: "i" }
      }

      if (location.length) {
        const pattern = "(^.*?" + location.join(".*?$)|(^.*?") + ".*?$)"
        criteria["postag"] = { $regex: pattern, $options: "i" }
      }
      if (title) {
        //        const pattern = title.replace(/ /g, ".*")
        const pattern = "(?=.*" + title.split(" ").join(").*(?=.*") + ")"
        criteria["title"] = { $regex: pattern, $options: "i" }
      }

      if (quesType === "bike") {
        criteria["postType"] = "BikeForumPost"
      } else {
        criteria["postType"] = "TripForumPost"
      }

      const posts = await Post.find(criteria).sort({ _id: -1 }).limit(limit)

      if (posts.length < limit) {
        cursor = ""
      } else {
        const _post = posts.pop()
        cursor = _post.id
      }
      return { posts, cursor }
    },
    async getMyQuestions(_, { userId, cursor, limit = FETCH_LIMIT }) {
      limit = limit + 1
      if (!cursor) {
        cursor = new ObjectID()
      }
      const posts = await Post.find({
        _id: { $lte: cursor },
        $and: [{ $or: [{ postType: "BikeForumPost" }, { postType: "TripForumPost" }] }, { userId: userId }]
      })
        .sort({ _id: -1 })
        .limit(limit)
      if (posts.length < limit) {
        cursor = ""
      } else {
        const _post = posts.pop()
        cursor = _post.id
      }
      return { posts, cursor }
    },
    async getUserTrips(_, { userId }) {
      try {
        var query = { userId: userId, postType: "TripPost" }
        const post = await Post.find(query).sort({ _id: -1 })
        if (post) {
          return post
        } else {
          throw new Error("Post not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async searchTrips(_, { tripName, multiple, userId }) {
      if (!tripName || tripName == "") {
        const query = { postType: "TripPost", userId: userId, "tripName": { $exists: true, $ne: null, $ne: "" } }
        return await Post.find(query)
      }
      try {
        const pattern = multiple ? "(^.*?" + tripName.split(",").join(".*?$)|(^.*?") + ".*?$)" : "(?=.*" + tripName.split(" ").join(").*(?=.*") + ")"
        const post = await Post.find({ postType: "TripPost", tripName: { $regex: pattern, $options: "i" } })

        if (post) {
          return post
        } else {
          throw new Error("post not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getOwnTrips(_, { pageNo = 1, userId, limit = FETCH_LIMIT }) {

      const trips = await Post.find({ userId: userId, postType: "TripPost", tripName: { $exists: true, $ne: null, $ne: "" } }, { tripName: 1, _id: 0 }).sort({ when: 1 })
      const allTrips = Object.values(trips.reduce((acc, cur) => Object.assign(acc, { [cur.tripName]: cur }), {}))
      const pageWiseTrips = paginate(allTrips, limit, pageNo)
      let totalPages = Math.ceil(allTrips.length / limit);

      let tripPosts = [];

      for (var i = 0; i < pageWiseTrips.length; i++) {
        let tripByName = await Post.find({ userId: userId, postType: "TripPost", tripName: pageWiseTrips[i].tripName }).sort({ when: 1 }).limit(limit)
        tripPosts.push({ tripName: pageWiseTrips[i].tripName, tripPosts: tripByName })
      }
      let nextPage;
      if (totalPages <= pageNo) {
        nextPage = null
      } else {
        nextPage = pageNo + 1
      }
      let returnData = { tripGroup: tripPosts, nextPage: nextPage, totalPages: totalPages }
      return returnData
    },
    async getPostsByTripName(_, { userId, limit = FETCH_LIMIT, tripName, pageNo }) {
      try {
        let withoutName = {
          userId: userId, postType: "TripPost",
          $or: [{ "tripName": { $exists: false } }, { "tripName": "" }, { "tripName": null }, { "tripName": undefined }]
        }
        let query = { postType: "TripPost", userId: userId, "tripName": tripName }

        let totalItem = await Post.find(tripName === "" ? withoutName : query, { tripName: 1 }).count()
        let totalPages = Math.ceil(totalItem / limit);
        let skips = pageNo > 1 ? ((pageNo - 1) * limit) : 0
        const posts = await Post.find(tripName === "" ? withoutName : query).sort({ when: 1 }).skip(skips).limit(limit)

        let nextPage;
        if (totalPages <= pageNo) {
          nextPage = null
        } else {
          nextPage = pageNo + 1
        }
        return { posts: posts, nextPage: nextPage, totalPages: totalPages }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getNextPrevTrip(_, { userId, tripName, postId, type = "" }) {
      try {
        let query = { postType: "TripPost", userId: userId, "tripName": tripName }
        const allTrips = await Post.find(query).sort({ when: 1 })
        let current = allTrips.findIndex(item => item.id === postId);
        let nextData = allTrips[current + 1]
        let prevData = allTrips[current - 1]
        let postData = null;
        if (type !== "" && type === "next") {
          postData = nextData
        } else if (type !== "" && type === "prev") {
          postData = prevData
        } else {
          postData = null
        }
        return {
          current: current + 1,
          total: allTrips.length,
          hasNext: nextData ? true : false,
          hasPrev: prevData ? true : false,
          postData: postData
        }

      } catch (err) {
        throw new Error(err)
      }
    },
  },
  Mutation: {
    async createForumPost(_,
      { postId, body, title, bikes, location, previewBody, previewMedia, embedPicture, username, name, userId, userbikes, avatarUrl, quesType, additionalTag },
      context
    ) {
      checkAuth(context)

      const { valid, errors } = validateForumPost(title, body, bikes, location, quesType)
      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }
      //if question type is bike then add postag for bike else add for location(trip)
      //set postType different based on quesType passed from param to avoid having all questions with same postType(ForumPost)
      let postag = username + " "
      let postType = ""
      if (quesType === "bike") {
        postType = "BikeForumPost"
        postag = bikes.map(bk => bk.bikename).join(" ") + " " + username + (additionalTag ? " # " + additionalTag : "")
      } else {
        postType = "TripForumPost"
        postag = location.join(" ") + " " + username + (additionalTag ? " # " + additionalTag : "")
      }

      let post = {}
      const postData = {
        body,
        title,
        postType,
        username,
        name,
        previewBody,
        previewMedia: previewMedia ? previewMedia : "",
        userId,
        userbikes,
        avatarUrl,
        likeCount: 0,
        commentCount: 0,
        isActive: true,
        bikes: bikes ? bikes : [],
        createdAt: new Date().toISOString(),
        location: location ? location : [],
        postag
      }

      if (postId) {
        post = await Post.findOneAndUpdate({ _id: postId }, postData, { new: true })
      } else {
        const newPost = new Post(postData)

        post = await newPost.save()
      }

      let description = body
        .replace(/<\/p>/g, "...")
        .replace(/<(.|\n)*?>/g, "")
        .slice(0, 280)
      if (description === "...") {
        description = ""
      }
      const linkData = {
        url: process.env.MOTOMOB_PREFIX + "/posts/" + post.id,
        title: title ? title : "MotoMob.Me: Bikers Only",
        description: description,
        type: "Post",
        createdAt: new Date().toISOString()
      }
      if (embedPicture != "") {
        linkData["imageUrl"] = embedPicture
      } else {
        linkData["imageUrl"] = process.env.DEFAULT_IMAGE_URL
      }
      await Link.update({ url: linkData.url }, linkData, { upsert: true })

      return post
    },
    async createCommonPost(
      _,
      {
        postType,
        postId,
        body,
        previewBody,
        previewMedia,
        title,
        bikes,
        location,
        username,
        name,
        userId,
        userbikes,
        avatarUrl,
        quesType,
        pictureUrls,
        embedPicture,
        when,
        days,
        offRoadPercentage,
        gpxFiles,
        additionalTag,
        tripName
      },
      context
    ) {
      checkAuth(context)
      //TODO: See if we can use Set or Array instead of a String for Usertag. What would be the best performance-wise?
      let postag
      if (postType === "BikePost") {
        postag = bikes.map(bk => bk.bikename).join(" ") + " " + username + (additionalTag ? " # " + additionalTag : "")
        const { valid, errors } = validateBikePost(title, body, bikes, postType)
        if (!valid) {
          throw new UserInputError("Errors", { errors })
        }
      } else if (postType === "TripPost") {
        postag =
          bikes.map(bk => bk.bikename).join(" ") + " " + location.map(loc => loc).join(" ") + " " + username + (additionalTag ? " # " + additionalTag : "")
        const { valid, errors } = validateTripPost(title, body, bikes, location, when, days, postType)
        if (!valid) {
          throw new UserInputError("Errors", { errors })
        }
      } else if (postType === "ForumPost") {
        if (quesType === "bike") {
          postType = "BikeForumPost"
          postag = bikes.map(bk => bk.bikename).join(" ") + " " + username
        } else {
          postType = "TripForumPost"
          postag = location.map(loc => loc).join(" ") + " " + username
        }
      } else if (postType === "BasicPost") {
        const { valid, errors } = validateBasicPost(title, body)
        if (!valid) {
          throw new UserInputError("Errors", { errors })
        }
        postag = username
      } else {
        throw new UserInputError("Errors", { postType: "Post type must be one of these BikePost, TripPost, ForumPost, BasicPost" })
      }

      let post = {}
      if (pictureUrls.length > 0) {
        if (pictureUrls[0].includes(process.env.FILE_STORE_PREFIX)) {
          previewMedia = pictureUrls[0]
        } else {
          previewMedia = process.env.FILE_STORE_PREFIX + pictureUrls[0]
        }
        previewMedia = "<img src=" + previewMedia + " />"
      }

      const postData = {
        body,
        previewBody,
        previewMedia: previewMedia ? previewMedia : "",
        title,
        postType,
        username,
        name,
        userId,
        userbikes,
        avatarUrl,
        bikes: bikes ? bikes : [],
        pictureUrls: pictureUrls ? pictureUrls.map(url => (url.includes("/posts/") ? url : process.env.FILE_STORE_PREFIX + url)) : [],
        createdAt: new Date().toISOString(),
        location: location ? location : [],
        when: when ? when : "",
        days: days ? days : 0,
        offRoadPercentage: offRoadPercentage ? offRoadPercentage : 0,
        gpxFiles: gpxFiles ? gpxFiles.map(url => (url.includes("/posts/") ? url : process.env.FILE_STORE_PREFIX + url)) : [],
        postag: postag,
        tripName: tripName ? tripName : "",
      }
      //TODO: why should we look at the url for bikes??
      if (postId) {
        post = await Post.findOneAndUpdate({ _id: postId }, postData, { new: true })
        log("Post is updated...", context, "info", "post")
      } else {
        //New post, initialise the counters. This is not needed during edit.
        postData.likeCount = 0
        postData.likes = []
        postData.commentCount = 0
        postData.saveCount = 0
        postData.savedTag = ""
        postData.isActive = true

        const newPost = new Post(postData)
        log("New Post Created...", context, "info", "post")
        post = await newPost.save()
        if (tripName && tripName !== "") {
          const newTrip = new Trip({
            saveCount: 0,
            tripName: tripName,
            isActive: true,
            userId: userId,
            coverUrl: DEFAULT_TRIP_COVER,
            createdAt: new Date().toISOString()
          })

          const trip = await newTrip.save()
          context.pubsub.publish("NEW_TRIP", {
            newTrip: trip
          })
        }
      }
      // Creating links for every post.
      // removing html tags in body
      let description = body
        .replace(/<\/p>/g, "...")
        .replace(/<(.|\n)*?>/g, "")
        .slice(0, 280)
      if (description === "...") {
        description = ""
      }
      const linkData = {
        url: process.env.MOTOMOB_PREFIX + "/posts/" + post.id,
        title: title ? title : "MotoMob.Me: Bikers Only",
        description: description,
        type: "Post",
        createdAt: new Date().toISOString()
      }
      if (pictureUrls[0]) {
        linkData["imageUrl"] = pictureUrls[0].includes("/posts/") ? pictureUrls[0] : process.env.FILE_STORE_PREFIX + pictureUrls[0]
      } else if (embedPicture != "") {
        linkData["imageUrl"] = embedPicture
      } else {
        linkData["imageUrl"] = process.env.DEFAULT_IMAGE_URL
      }
      await Link.update({ url: linkData.url }, linkData, { upsert: true })
      return post
    },

    async deletePost(_, { postId }, context) {
      const user = checkAuth(context)

      try {
        const post = await Post.findById(postId)
        const loggedInUser = await User.findById(user.id)
        //TODO: Added permissions for admin to delete posts. This should be replaced with procer ACLs. Temp Fix
        if (user.username === post.username || loggedInUser.admin === true) {
          await post.delete()
          log(`post is deleted - ${postId}`, context, "info", "post")
          //Delete assoicated comment
          await Comment.deleteMany({ postId: postId })
          // Delete assoicated link
          await Link.deleteOne({ url: process.env.MOTOMOB_PREFIX + "/posts/" + postId })
          return "Post deleted successfully"
        } else {
          throw new AuthenticationError("Action not allowed")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async likePost(_, { postId }, context) {
      const user = checkAuth(context)
      let isLike = false

      const userData = await User.findById(user.id)
      const post = await Post.findById(postId)
      if (post) {
        if (post.likes.find(like => like.username === userData.username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter(like => like.username !== userData.username)

          --post.likeCount
        } else {
          // Not liked, like post
          isLike = true

          post.likes.push({
            username: userData.username,
            id: userData.id,
            avatarUrl: userData.avatarUrl
          })

          ++post.likeCount
        }

        await post.save()

        //notification not save if post created user and liked user are same
        if (isLike && post.username !== userData.username) {
          let commentMessage = ""
          if (post.title) {
            commentMessage = `: <b>${post.title}</b>`
          }
          const notificationData = {
            type: "LikePost",
            link: "/posts/" + postId,
            actionBy: userData.name,
            sendTo: post.username,
            message: LIKE_POST + commentMessage,
            userId: userData.id,
            userbikes: userData.userbikes,
            avatarUrl: userData.avatarUrl,
            username: userData.username,
            hasActioned: false,
            createdAt: new Date().toISOString()
          }

          await new Notification(notificationData).save()
        }

        return post
      } else throw new UserInputError("Post not found")
    },
    async savePost(_, { postId }, context) {
      const { id } = checkAuth(context)
      const post = await Post.findById(postId)
      //this tage we have used for user saved or unsaved post. if user only save that time we have saved notification on saved on unsaved click

      let isSave = false
      const user = await User.findById(id)
      if (post) {
        let savedtag = post.savedtag
        if (post.savedtag) {
          if (!savedtag.includes(user.username)) {
            isSave = true
            savedtag = savedtag + " " + user.username
            // Saved
            if (post.saveCount) {
              post.saveCount += post.saveCount
            } else {
              post.saveCount = 1
            }
          } else {
            let filterSaveTag = savedtag
              .split(" ")
              .filter(newtag => newtag !== user.username)
              .join(" ")
            savedtag = filterSaveTag

            // UnSaved
            if (post.saveCount > 0) {
              post.saveCount = post.saveCount - 1
            } else {
              post.saveCount = 0
            }
          }
        } else {
          // Saved
          isSave = true
          savedtag = user.username
          post.saveCount = 1
        }

        post.savedtag = savedtag
        await post.save()

        //notification not save if post created user and saved user are same
        if (isSave && post.username !== user.username) {
          //if any user saved post than we have added notification

          let commentMessage = ""
          if (post.title) {
            commentMessage = `: <b>${post.title}</b>`
          }

          const notificationData = {
            type: "SavePost",
            link: "/posts/" + post.id,
            actionBy: user.name,
            sendTo: post.username,
            message: SAVE_POST + commentMessage,
            userId: user.id,
            userbikes: user.userbikes,
            avatarUrl: user.avatarUrl,
            username: user.username,
            hasActioned: false,
            createdAt: new Date().toISOString()
          }

          await new Notification(notificationData).save()
        }

        return post
      } else throw new UserInputError("Post not found")
    }
  }
  /*,
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST")
    }
  }*/
}
