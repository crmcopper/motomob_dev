const { model, Schema } = require("mongoose")

const bikeSubSchema = new Schema(
  {
    // bikes subschema content
    bikeId: String,
    bikename: String,
    thumbUrl: String
  },
  { _id: false } //Tell Mongo to not create Ids for subdocuments (default is true)
)

const userSubSchema = new Schema(
  {
    // user subschema content
    username: String,
    id: String,
    avatarUrl: String,
    followersCount: Number //not mandatory
  },
  { _id: false } //Tell Mongo to not create Ids for subdocuments (default is true)
)

const postSchema = new Schema({
  //OtherPost
  body: String,
  previewBody: String, // This field will contained clean text and replace all CLRF to ...
  previewMedia: String, // This field will contained media link that is going to display on post feed. (Not complusoary field.)
  // Storing user information in the post so that when a post is displayed, the poster's details are visible.
  // Username, UserId are unique - no issues
  // AvatarUrl is a reference and if changed, will be picked up from AWS
  //TODO Userbikes is currently static and needs to be made dynamic (Client/serverside load? DynamoDB?)
  username: String,
  name: String,
  userId: String,
  avatarUrl: String,
  userbikes: String,
  //TODO save user's subschema in savedtag
  savedtag: String, //Add a username here when a user clicks on the star icon
  createdAt: String,
  //TODO: The likes (amd other emoticons might need to move out too)
  likes: [userSubSchema],
  likeCount: Number,
  commentCount: Number,
  saveCount: Number,
  title: String,
  postType: String, //TripPost, BikePost, BikeForumPost,TripForumPost Post
  isActive: Boolean, //Maybe to archive?
  postag: String,
  //Forum Post (Search against BikeIds, Locations, & other...)

  //Bike Post
  bikes: [bikeSubSchema],

  pictureUrls: [String],

  //Trip Post
  location: [String],
  when: String,
  days: String,
  offRoadPercentage: String,
  gpxFiles: [String], //TODO: Assess where this is stored and retrieved
  tripName: String
})

module.exports = model("Post", postSchema)
