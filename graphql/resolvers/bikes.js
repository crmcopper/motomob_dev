const { validateEditBike } = require("../../util/validators")
const { UserInputError } = require("apollo-server")


const Bike = require("../../models/Bike")
const checkAuth = require("../../util/checkAuth")
const Link = require("../../models/Link")
const { FETCH_LIMIT } = require("../../util/config")

module.exports = {
  Query: {
    async getBikes(_, { first, after, search }) {
      //set default fetch limit
      if (!first) {
        first = FETCH_LIMIT
      }
      let criteria = after
        ? {
            _id: {
              $lt: Buffer.from(after, "base64").toString("ascii")
            }
          }
        : {}
      if (search) {
        //   const pattern = search.replace(/ /g, ".*")
        const pattern = "(?=.*" + search.split(" ").join(").*(?=.*") + ")"
        criteria["bikename"] = { $regex: pattern, $options: "i" }
        //   console.log("getBikes -> pattern", pattern)
      }
      try {
        // find bike with name and limit which fullfills criteria and return pageinfo with hasNextPage flag
        let bikes = await Bike.find(criteria)
          .sort({ _id: -1 })
          .limit(first + 1)
          .exec()
        const hasNextPage = bikes.length > first - 1
        if (hasNextPage) {
          bikes = bikes.slice(0, bikes.length - 1)
        }
        const edges = bikes.map(r => {
          return {
            cursor: Buffer.from(r.id).toString("base64"),
            node: r
          }
        })
        return {
          pageInfo: {
            hasNextPage,
            endCursor: Buffer.from(bikes[bikes.length - 1].id).toString("base64"),
            startCursor: Buffer.from(bikes[0].id).toString("base64")
          },
          edges: edges
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getBike(_, { bikeId }) {
      try {
        const bike = await Bike.findById(bikeId)
        if (bike) {
          return bike
        } else {
          throw new Error("Bike not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getBikeByName(_, { bikename, multiple }) {
      if (!bikename) {
        return await Bike.find().limit(FETCH_LIMIT)
      }

      try {
        //handle any number of characters in between
        //        const pattern = bikename.replace(/ /g, ".*")
        // const pattern = "(^.*?" + bikename.join(".*?$)|(^.*?") + ".*?$)"
        const pattern = multiple ? "(^.*?" + bikename.split(",").join(".*?$)|(^.*?") + ".*?$)" : "(?=.*" + bikename.split(" ").join(").*(?=.*") + ")"
        const bike = await Bike.find({ bikename: { $regex: pattern, $options: "i" } }).limit(FETCH_LIMIT)
        //  console.log("getBikeByName -> pattern", pattern)

        if (bike) {
          return bike
        } else {
          throw new Error("Bike not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createBike(_, { bikename, pictureUrls, description, storyUrl, isActive, brand, category, prodStartYear, prodEndYear, thumbUrl }, context) {
      const user = checkAuth(context)
      const { errors, valid } = validateEditBike(bikename)

      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }

      const checkBikename = await Bike.findOne({ bikename })

      if (checkBikename) {
        throw new UserInputError("Bikename is taken", {
          errors: {
            bikename: "This Bikename is taken"
          }
        })
      }

      //Provide prefixes of Amazon S3
      const newBike = new Bike({
        bikename,
        pictureUrls: pictureUrls.map(url => process.env.FILE_STORE_PREFIX + url),
        description,
        isActive,
        storyUrl,
        brand,
        category,
        prodStartYear,
        prodEndYear,
        thumbUrl: process.env.FILE_STORE_PREFIX + thumbUrl,
        createdAt: new Date().toISOString()
      })

      const bike = await newBike.save()
      const linkData = {
        url: process.env.MOTOMOB_PREFIX + "/bikes/" + bike.id,
        title: bike.bikename,
        imageUrl: process.env.FILE_STORE_PREFIX + thumbUrl,
        description: description,
        type: "Bikes",
        createdAt: new Date().toISOString()
      }
      await Link.update({ url: linkData.url }, linkData, { upsert: true })

      context.pubsub.publish("NEW_BIKE", {
        newBike: bike
      })

      return bike
    },
    async editBike(
      _,
      { bikeId, bikename, pictureUrls, description, isActive, storyUrl, brand, category, prodStartYear, prodEndYear, thumbUrl, thumbFile },
      context
    ) {
      const user = checkAuth(context)
      const { errors, valid } = validateEditBike(bikename)

      if (!valid) {
        throw new UserInputError("Errors", { errors })
      }

      const bike = await Bike.findById(bikeId)
      const checkBikename = await Bike.findOne({ bikename })

      if (checkBikename && bikename !== bike.bikename) {
        throw new UserInputError("Bikename is taken", {
          errors: {
            bikename: "This Bikename is taken"
          }
        })
      }

      try {
        const update = {
          bikename: bikename,
          description: description,
          isActive: isActive,
          storyUrl: storyUrl,
          brand: brand,
          category: category,
          prodStartYear: prodStartYear,
          prodEndYear: prodEndYear
        }

        if (!!pictureUrls.length) {
          update.pictureUrls = pictureUrls.map(url => process.env.FILE_STORE_PREFIX + url)
        }

        if (thumbFile) {
          update.thumbUrl = process.env.FILE_STORE_PREFIX + thumbUrl
        }

        await Bike.findOneAndUpdate({ _id: bikeId }, update)
        const linkData = {
          url: process.env.MOTOMOB_PREFIX + "/bikes/" + bike.id,
          title: update.bikename,
          imageUrl: process.env.FILE_STORE_PREFIX + thumbUrl,
          description: update.description,
          type: "Bikes",
          createdAt: new Date().toISOString()
        }
        await Link.update({ url: linkData.url }, linkData, { upsert: true })
        return update
      } catch (err) {
        throw new Error(err)
      }
    }
  } /*,
  Subscription: {
    newBike: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_BIKE")
    }
  }*/
}
