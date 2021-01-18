const Contest = require("../../models/Contest")
const checkAuth = require("../../util/checkAuth")
const Link = require("../../models/Link")
const mongoose = require("mongoose")

module.exports = {
  Query: {
    async getContests(_, { isActive, contestsClosed = false }, context) {
      try {
        let contests;
        if (isActive) {
          let dateToday = new Date().toISOString();
          contests = await Contest.find({ closingDate: contestsClosed ? { $lt: dateToday } : { $gte: dateToday }, isActive: isActive })
        } else {
          contests = await Contest.find()
        }
       
        return contests
      } catch (err) {
        throw new Error(err)
      }
    },
    async getContest(_, { contestId }) {
      try {
        const contest = await Contest.findById(contestId)
        if (contest) {
          if (contest.photos.length) {
            contest.photos.reverse()
          }
          return contest
        } else {
          throw new Error("Contest not found")
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  Mutation: {
    async createContest(_, { id, title, sponsors, imageUrl, isActive, closingDate, sponsor_description, prize_description, criteria_description }, context) {
      if (id != "") {
        let updateData = {
          "title": title,
          "sponsors": sponsors,
          "imageUrl": imageUrl,
          "closingDate": closingDate,
          "isActive": isActive,
          "sponsor_description": sponsor_description,
          "prize_description": prize_description,
          "criteria_description": criteria_description,
        }

        await Contest.findOneAndUpdate({ _id: id }, updateData)
        let allData = await Contest.find()
        return allData
      } else {
        const newContest = new Contest({
          title: title,
          createdAt: new Date().toISOString(),
          sponsors: sponsors,
          imageUrl: imageUrl,
          closingDate: closingDate,
          isActive: isActive,
          sponsor_description: sponsor_description,
          prize_description: prize_description,
          criteria_description: criteria_description,
        })
        await newContest.save()
        let allData = await Contest.find()
        return allData
      }


    },
    async activeDeactiveContest(_, { id }, context) {
      if (id) {
        let contestDetail = await Contest.findOne({ _id: id })
        contestDetail.isActive = !contestDetail.isActive;
        await Contest.findOneAndUpdate({ _id: id }, contestDetail)
        let allData = await Contest.find()
        return allData
      }
    },
    async addPhotoToContest(_, { contestId, imageUrl, thumbUrl, bikeId, bikename, bikethumbUrl, userId, username, name, avatarUrl }, context) {
      const photoObject = {
        _id: new mongoose.mongo.ObjectId(),
        username: username,
        userId: userId,
        name: name,
        avatarUrl: avatarUrl,
        imageUrl: imageUrl,
        thumbUrl: thumbUrl,
        bikeId: bikeId,
        bikename: bikename,
        bikethumbUrl: bikethumbUrl
      }

      try {
        const Contests = await Contest.findOneAndUpdate({ _id: contestId }, { $push: { photos: photoObject } })
        const description = "Some static text we need to change this"
        const linkData = {
          url: process.env.MOTOMOB_PREFIX + "/photo-contests/" + Contest.id / +"image=" + photoObject._id,
          title: Contest.title,
          imageUrl: imageUrl,
          description: description,
          type: "Contest",
          createdAt: new Date().toISOString()
        }
        await Link.update({ url: linkData.url }, linkData, { upsert: true })
        return photoObject
      } catch (err) {
        throw new Error(err)
      }
    },
    async addPreviewPhotoToContest(_, { contestId, imageUrl, thumbUrl }, context) {
      const { username } = checkAuth(context)
      let contest = await Contest.findById(contestId)
      if (contest) {
        if (contest.photos.length) {
          for (let fil_cont of contest.photos) {
            if (fil_cont.username == username && fil_cont.imageUrl == imageUrl) {
              fil_cont.thumbUrl = thumbUrl
            }
          }

          await Contest.findOneAndUpdate({ _id: contestId }, { photos: contest.photos })

          return {
            contestId,
            username,
            imageUrl,
            thumbUrl
          }
        } else {
          throw new Error("Photos not found")
        }
      } else {
        throw new Error("Contest not found")
      }
    },
    async deletePhotoContestImage(_, { contestId, imageUrl }, context) {
      const { username } = checkAuth(context)
      let contest = await Contest.findById(contestId)
      if (contest) {
        if (contest.photos.length) {
          let allPhotos = []
          for (let image of contest.photos) {
            if (image.username == username && image.imageUrl == imageUrl) {
            } else {
              allPhotos.push(image)
            }
          }
          await Contest.findOneAndUpdate({ _id: contestId }, { photos: allPhotos })
          return {
            contestId,
            username,
            imageUrl
          }
        } else {
          throw new Error("Photos not found")
        }
      } else {
        throw new Error("Contest not found")
      }
    },
    async likeUnlikePhotoContestImage(_, { contestId, imageUrl, thumbUrl }, context) {
      const user = checkAuth(context)
      let contest = await Contest.findById(contestId)
      if (contest) {
        if (contest.photos.length) {
          for (let image of contest.photos) {
            if (image.imageUrl === imageUrl && image.thumbUrl === thumbUrl) {
              if (image.likes) {
                if (image.likes.find(like => like.username === user.username)) {
                  image.likes = image.likes.filter(like => like.username !== user.username)
                } else {
                  image.likes.push({
                    username: user.username,
                    id: user.id,
                    avatarUrl: user.avatarUrl
                  })
                }
              } else {
                image.likes = []
                image.likes.push({
                  username: user.username,
                  id: user.id,
                  avatarUrl: user.avatarUrl
                })
              }
            }
          }
          await Contest.findOneAndUpdate({ _id: contestId }, { photos: contest.photos })
          return {
            username: user.username,
            contestId,
            imageUrl,
            thumbUrl
          }
        } else {
          throw new Error("Photos not found")
        }
      } else {
        throw new Error("Contest not found")
      }
    }
  }
}
