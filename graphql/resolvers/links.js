const Link = require("../../models/Link")

module.exports = {
  Query: {
    async getLinks(_, {}) {
      return await Link.find({}).lean()
    },
    async getLink(_, { url }) {
      try {
        const linkD = await Link.findOne({ url }).lean()
        return linkD
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  Mutation: {
    async createSharedLink(_, { url, title, description, imageUrl, type }, __) {
      //In case a numpty wants to share a post that has no pics, use a default
      if (!imageUrl) {
        //Remember - same URL used in server.js
        imageUrl = process.env.DEFAULT_IMAGE_URL
      }

      //All we're doing here is ensuring there is exactly one inistance of a url that is shared
      const linkD = await Link.findOne({ url })
      if (linkD) {
        //link exists return it, no update (let's not complicate it :-)
        return linkD
      }

      //Ok, no link...create one
      const newLink = new Link({
        url,
        title,
        imageUrl,
        description,
        type,
        createdAt: new Date().toISOString()
      })

      const link = await newLink.save()
      return link
    }
  }
}
