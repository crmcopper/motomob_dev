const postsResolvers = require("./posts")
const usersResolvers = require("./users")
const notificationsResolvers = require("./notifications")
const commentsResolvers = require("./comments")
const bikesResolvers = require("./bikes")
const searchTagsResolvers = require("./searchTags")
const contestsResolvers = require("./contests")
const s3Resolvers = require("./s3")
const linksResolvers = require("./links")
const feedbackResolvers = require("./feedbacks")
const tokensResolvers = require("./tokens")
const sponsorsResolvers = require("./sponsors")
const tripsResolvers = require("./trips")

module.exports = {
  /*Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => (1 ? 13 : -13) //TODO: FIX this!! (parent) => parent.comments.length
  }, */
  Query: {
    ...postsResolvers.Query,
    ...bikesResolvers.Query,
    ...searchTagsResolvers.Query,
    ...usersResolvers.Query,
    ...commentsResolvers.Query,
    ...contestsResolvers.Query,
    ...linksResolvers.Query,
    ...notificationsResolvers.Query,
    ...tokensResolvers.Query,
    ...sponsorsResolvers.Query,
    ...tripsResolvers.Query,

  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...bikesResolvers.Mutation,
    ...contestsResolvers.Mutation,
    ...s3Resolvers.Mutation,
    ...linksResolvers.Mutation,
    ...feedbackResolvers.Mutation,
    ...notificationsResolvers.Mutation,
    ...tokensResolvers.Mutation,
    ...sponsorsResolvers.Mutation,
    ...tripsResolvers.Mutation,
  },
  Subscription: {
    ...postsResolvers.Subscription,
    ...bikesResolvers.Subscription,
    ...notificationsResolvers.Subscription,
  }
}
