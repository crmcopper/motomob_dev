const Feedback = require("../../models/Feedback")
const checkAuth = require("../../util/checkAuth")

module.exports = {
  Mutation: {
    async createFeedback(_, { pageLink, description }, context) {
      const user = checkAuth(context)
     
      const feedback = new Feedback({
        pageLink,
        description,
        username: user.username
      })

      const bug = await feedback.save()
      return bug
    }
  }
}