const { AuthenticationError, UserInputError } = require("apollo-server")

const Trip = require("../../models/Trip")
const User = require("../../models/User")
const checkAuth = require("../../util/checkAuth")
const DEFAULT_TRIP_COVER = "https://motomob-test.s3.eu-west-2.amazonaws.com/posts/dx68e-trip-default-cover.png"

module.exports = {
  Query: {
    async getTripDetails(_, { userId, tripName }) {
      try {
        let trip = await Trip.find({ userId: userId, tripName: tripName })
        if (trip) {
          return trip
        } else {
          throw new Error("Trip not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    },
  },
  Mutation: {
    async createAndUpdateTrip(_, { tripName, coverUrl, isActive, userId, saveCount }, context) {
      const user = checkAuth(context)
      const checktripName = await Trip.find({ tripName: tripName, userId: userId })
      if (checktripName) {// if already then return 
        const update = {
          coverUrl: coverUrl,
          saveCount: saveCount
        }
        await Trip.findOneAndUpdate({ tripName: tripName }, update)
        const check = await Trip.findOne({ tripName })

        return check
      }

      //Provide prefixes of Amazon S3
      const newTrip = new Trip({
        saveCount,
        tripName,
        isActive,
        userId,
        coverUrl: coverUrl,
        createdAt: new Date().toISOString()
      })

      const trip = await newTrip.save()
      context.pubsub.publish("NEW_TRIP", {
        newTrip: trip
      })
      return trip
    },
    async saveTrip(_, { tripName }, context) {
      const { id } = checkAuth(context)
      const trip = await Trip.findOne({ tripName })
      //this tage we have used for user saved or unsaved trip. if user only save that time we have saved notification on saved on unsaved click

      let isSave = false
      const user = await User.findById(id)
      if (trip) {
        let savedtag = trip.savedtag
        if (trip.savedtag) {
          if (!savedtag.includes(user.username)) {
            isSave = true
            savedtag = savedtag + " " + user.username
            // Saved
            if (trip.saveCount) {
              trip.saveCount += trip.saveCount
            } else {
              trip.saveCount = 1
            }
          } else {
            let filterSaveTag = savedtag
              .split(" ")
              .filter(newtag => newtag !== user.username)
              .join(" ")
            savedtag = filterSaveTag

            // UnSaved
            if (trip.saveCount > 0) {
              trip.saveCount = trip.saveCount - 1
            } else {
              trip.saveCount = 0
            }
          }
        } else {
          // Saved
          isSave = true
          savedtag = user.username
          trip.saveCount = 1
        }
        trip.savedtag = savedtag
        await trip.save()
        return trip
      } else {
        //Provide prefixes of Amazon S3
        const newTrip = new Trip({
          savedtag: user.username,
          saveCount: 1,
          tripName,
          coverUrl: DEFAULT_TRIP_COVER,
          userId: user.id,
          createdAt: new Date().toISOString()
        })

        const trip = await newTrip.save()
        context.pubsub.publish("NEW_TRIP", {
          newTrip: trip
        })
        return newTrip
      }
    }
  }
}