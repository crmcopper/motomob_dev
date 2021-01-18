const { AuthenticationError } = require("apollo-server")

const checkAuth = require("../../util/checkAuth")
const Comment = require("../../models/Comment")
const Post = require("../../models/Post")
const Notification = require("../../models/Notification")
const User = require("../../models/User")
const { FETCH_LIMIT } = require("../../util/config")
const { REPLY_COMMENT, COMMENT_POST, ANSWER_POST, REPLY_ANSWER } = require("../../util/user-messages")
const { log } = require("../../util/logger")

async function listNestedComments(comments) {
  if (comments.length < 2) {
    //Less than 2 comments, there is no nesting
    return comments
  }

  const nestedComments = []
  const tempC = []
  //If we get a reply first before the initial comment, place in a tem array and then parse again
  comments.forEach(comment => {
    if (!comment.replyToId) {
      nestedComments.push(comment)
    } else {
      //find the comment
      const parentComment = nestedComments.find(parent => parent.id === comment.replyToId)
      if (parentComment) {
        //parent found
        parentComment.replies.push(comment) //add the reply comment
      } else {
        //parent not found, yet. is this possible?
        tempC.push(comment)
      }
    }
  })

  //run through the ones that didn't find a parent in the initial run
  tempC.forEach(comment => {
    const parentComment = nestedComments.find(parent => parent.id === comment.replyToId)
    parentComment.replies.push(comment) //add the reply comment
  })

  return nestedComments
}

module.exports = {
  Query: {
    async getPostComments(_, { postId }) {
      try {
        // Find the comments for the Post
        //TODO: Need to sort  .sort({ createdAt: -1 })
        const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).limit(FETCH_LIMIT)
        let listcomments = listNestedComments(comments)

        return listcomments
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createComment(_, { postId, replyToId, body, username, userId, userbikes, avatarUrl, name }, context) {
      const { id } = checkAuth(context)
      if (body.trim() === "") {
        throw new Error("Comment body must not be empty")
      }
      try {
        const newComment = new Comment({
          body,
          postId,
          replyToId,
          username,
          userId,
          userbikes,
          avatarUrl,
          name,
          createdAt: new Date().toISOString()
        })

        const comment = await newComment.save()

        //Upadate the count in Post table
        //TODO: Do we need to make this call Async from the front end?
        const post = await Post.findById(postId)
        ++post.commentCount
        log(`Comment is added on post ${postId}`, context, "info", "comment")
        await post.save()

        //notification not save if post created user and commented user are same
        // if (!replyToId) {
        //Save notification when user create comment
        let sendTo = ""
        // if we have replyToId then send notification to owner of comment otherwise send notification to owner of post
        if (replyToId) {
          const parentComment = await Comment.findById(replyToId)
          sendTo = parentComment.username
        } else if (post.username !== username && !replyToId) {
          sendTo = post.username
        }
        //If comment owner replied in his comment they don't get notification
        if (sendTo !== username) {
          const user = await User.findById(id)
          let commentMessage = ""

          if (replyToId) {
            if (post.postType !== "BikeForumPost" && post.postType !== "TripForumPost") commentMessage = REPLY_COMMENT
            else commentMessage = REPLY_ANSWER
          } else {
            if (post.postType !== "BikeForumPost" && post.postType !== "TripForumPost") commentMessage = COMMENT_POST
            else commentMessage = ANSWER_POST
          }

          if (post.title) {
            commentMessage += `: <b>${post.title}</b>`
          }

          const notificationData = {
            type: "CommentPost",
            link: "/posts/" + post.id,
            actionBy: user.name,
            sendTo: sendTo,
            message: commentMessage,
            userId: user.id,
            userbikes: user.userbikes,
            avatarUrl: user.avatarUrl,
            username: user.username,
            hasActioned: false,
            createdAt: new Date().toISOString()
          }

          await new Notification(notificationData).save()
        }
        //}

        return { comment, post }
      } catch (err) {
        throw new Error(err)
      }
    },
    async deleteComment(_, { commentId, replyToId }, context) {
      const user = checkAuth(context)
      try {
        const getComment = await Comment.find({
          $or: [{ _id: commentId }, { replyToId: commentId }]
        })
        if (getComment.length) {
          await Comment.deleteMany({
            $or: [{ _id: commentId }, { replyToId: commentId }]
          })
          const post = await Post.findById(getComment[0].postId)
          post.commentCount = post.commentCount - getComment.length
          log(`Comment is deleted from post ${post._id}`, context, "info", "comment")
          await post.save()

          const comments = await Comment.find({ postId: getComment[0].postId }).sort({ createdAt: -1 }).limit(FETCH_LIMIT)
          let listcomments = listNestedComments(comments)

          return { comment: listcomments, post }
        } else {
          throw new AuthenticationError("No commnets found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async updateComment(_, { postId, body, commentId }, context) {
      const user = checkAuth(context)
      if (body.trim() === "") {
        throw new Error("Comment body must not be empty")
      }
      try {
        let updatedCommnet = await Comment.findOneAndUpdate({ _id: commentId }, { body })
        if (updatedCommnet) {
          const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).limit(FETCH_LIMIT)
          let listcomments = listNestedComments(comments)
          return listcomments
        } else {
          throw new AuthenticationError("No commnets found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async likeComment(_, { commentId, postId }, context) {
      const { id } = checkAuth(context)
      const user = await User.findById(id)
      if (user) {
        const comment = await Comment.findById(commentId)
        if (comment) {
          if (comment.likes.find(like => like.username === user.username)) {
            // Comment already likes, unlike it
            comment.likes = comment.likes.filter(like => like.username !== user.username)

            let commentCount = 0

            if (comment.likeCount && comment.likeCount > 0) {
              commentCount = --comment.likeCount
            }
            comment.likeCount = commentCount
          } else {
            //  like comment
            let commentCount = 1

            if (comment.likeCount) {
              commentCount = ++comment.likeCount
            }
            comment.likes.push({
              username: user.username,
              id: user.id,
              avatarUrl: user.avatarUrl
            })

            comment.likeCount = commentCount
          }

          if (comment.dislikes && comment.dislikes.find(like => like.username === user.username)) {
            // Comment already dislikes, like it
            comment.dislikes = comment.dislikes.filter(like => like.username !== user.username)

            if (comment.dislikeCount && comment.dislikeCount > 0) {
              comment.dislikeCount = --comment.dislikeCount
            }
          }

          await comment.save()

          const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).limit(FETCH_LIMIT)
          let listcomments = listNestedComments(comments)

          return listcomments
          //return comment
        } else throw new UserInputError("Comment not found")
      } else {
        throw new AuthenticationError("User not found")
      }
    },
    async dislikeComment(_, { commentId, postId }, context) {
      const { id } = checkAuth(context)
      const user = await User.findById(id)
      if (user) {
        const comment = await Comment.findById(commentId)

        if (comment) {
          if (comment.dislikes.find(dislike => dislike.username === user.username)) {
            // Comment already likes, unlike it
            comment.dislikes = comment.dislikes.filter(dislike => dislike.username !== user.username)

            let commentCount = 0

            if (comment.dislikeCount && comment.dislikeCount > 0) {
              commentCount = --comment.dislikeCount
            }
            comment.dislikeCount = commentCount
          } else {
            //  like comment
            let commentCount = 1

            if (comment.dislikeCount) {
              commentCount = ++comment.dislikeCount
            }
            comment.dislikes.push({
              username: user.username,
              id: user.id,
              avatarUrl: user.avatarUrl
            })

            comment.dislikeCount = commentCount
          }

          if (comment.likes && comment.likes.find(like => like.username === user.username)) {
            // Comment already dislikes, like it
            comment.likes = comment.likes.filter(like => like.username !== user.username)

            if (comment.likeCount && comment.likeCount > 0) {
              comment.likeCount = --comment.likeCount
            }
          }

          await comment.save()

          const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).limit(FETCH_LIMIT)
          let listcomments = listNestedComments(comments)

          return listcomments
        } else throw new UserInputError("Comment not found")
      } else {
        throw new AuthenticationError("User not found")
      }
    }
  }
}
