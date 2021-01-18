const { AuthenticationError,UserInputError } = require("apollo-server")

const checkAuth = require("../../util/checkAuth")
const User = require("../../models/User")
const { FETCH_LIMIT } = require("../../util/config")
const { REPLY_COMMENT, COMMENT_POST, ANSWER_POST, REPLY_ANSWER } = require("../../util/user-messages")
const { log } = require("../../util/logger")
const Sponsor = require("../../models/Sponsor")
const Contest = require("../../models/Contest")
module.exports = {
 Query: {
    async getAllSponsors(_, {isActive}, context) {
      let sponsorsList;
      if(isActive){
        sponsorsList = await Sponsor.find({isActive:isActive})
      }else{
        sponsorsList = await Sponsor.find()
      }
      return sponsorsList
    }
  },
  Mutation: {
    async createSponsor(_, {id,name,description,imageUrl,isActive}, context) {
      const newSponsor = new Sponsor({
          name,
          description,
          imageUrl,
          isActive
      })
      if(id){
        let updateData = {
          "name":name,
          "description":description,
          "imageUrl":imageUrl,
          "isActive":isActive
        }
        const newSponsorData = await Sponsor.findOneAndUpdate({ _id: id }, updateData)
        let sponsorDetail= await Sponsor.findOne({ _id: id })

        // update sponsor name/image in contest subschema
        await Contest.updateMany({"sponsors.id":id},{$set:{"sponsors.$.name":name,"sponsors.$.imageUrl":imageUrl}})

        return sponsorDetail
      }else{
        const newSponsorData = await newSponsor.save()
        return newSponsorData
      }
    },
    async activeDeactiveSponsor(_, {id}, context) {
      if(id){
        var checkExistInContest = await Contest.find({
          'sponsors.id':id,
        })
        if(checkExistInContest.length > 0){
          let errors = {
            "exist_in_contest":"you can not active/deactive sponsor, please remove from contest and then try."
          }
          throw new UserInputError("Errors", { errors })
        }
        
        let sponsorDetail= await Sponsor.findOne({ _id: id })
        sponsorDetail.isActive = !sponsorDetail.isActive;
        await Sponsor.findOneAndUpdate({ _id: id }, sponsorDetail)
        let allData= await Sponsor.find()
        return allData
      }
    },
  }
}
 