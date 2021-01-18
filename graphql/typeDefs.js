const { gql } = require("apollo-server")
//TODO: Create Fragments for User (Registration, Login, Profile)
//TODO: Create Fragments for Post (Bike, Trip, etc)
module.exports = gql`
  input RegisterInput {
    username: String!
    name: String!
    avatarUrl: String!
    password: String
    location: String!
    email: String!
    ownBikes: [BikesInPost!]
    provider: String
    access_token: String
  }

  input BikesInPost {
    bikeId: String
    bikename: String
    thumbUrl: String
    prodStartYear: String
  }
  input SponsorsContest {
    id: String
    name: String
    imageUrl: String
  }

  input filesForS3Signature {
    name: String
    type: String
  }

  type Bike {
    id: ID!
    bikeId: String
    bikename: String!
    description: String
    storyUrl: String
    isActive: Boolean
    pictureUrls: [String]
    brand: String
    category: [String!]
    thumbUrl: String
    prodStartYear: String
    prodEndYear: String
    createdAt: String
  }

  type Post {
    id: ID!
    body: String!
    previewBody: String
    previewMedia: String
    createdAt: String!
    username: String!
    name: String
    userId: String!
    userbikes: String!
    avatarUrl: String!
    comments: [Comment]
    likes: [Like]
    likeCount: Int!
    commentCount: Int!
    title: String!
    postType: String!
    isActive: Boolean
    postag: String
    bikes: [Bike]
    pictureUrls: [String]
    location: [String]
    when: String
    days: Int
    offRoadPercentage: Int
    gpxFiles: [String]
    savedtag: String
    saveCount: Int
    tripName:String
  }

  type Comment {
    id: ID!
    postId: String!
    replyToId: String
    createdAt: String!
    username: String!
    name: String
    userId: String!
    userbikes: String!
    avatarUrl: String!
    body: String!
    replies: [Comment]
    likes: [User]
    likeCount: Int
    dislikes: [Comment]
    dislikeCount: Int
  }

  type Notification {
    id: ID!
    link: String!
    type: String!
    createdAt: String!
    actionBy: String!
    sendTo: String!
    message: String!
    userId: String!
    avatarUrl: String!
    userbikes: String
    username: String!
    hasActioned: Boolean!
  }

  type CommentAndPost {
    comment: Comment
    post: Post
  }

  type NotificationsAndNotificationTotal {
    notifications: [Notification]
    notificationsTotal: Int
  }

  type DeleteCommentAndPost {
    comment: [Comment]
    post: Post
  }

  type Like {
    id: ID!
    createdAt: String!
    username: String!
    avatarUrl: String!
  }
  type Sponsor {
    id: ID!
    name: String!
    description: String!
    imageUrl: String!
    isActive: Boolean!
  }

  type User {
    id: ID!
    name: String
    username: String
    email: String!
    avatarUrl: String
    token: String!
    refreshToken: String!
    usertag: String
    admin: Boolean
    ownBikes: [Bike]
    followBikes: [Bike]
    location: String
    createdAt: String!
    bikes: String
    followers: [User]
    followersCount: Int
    followUsers: [User]
    following: [User]
    status: String
    notificationFrequency: String
    googleId: String
    facebookId: String
  }

  type Contest {
    id: ID
    title: String!
    createdAt: String!
    sponsors: [SponsorsContestType]
    imageUrl: String!
    closingDate: String!
    isActive: Boolean!
    photos: [Photo]
    sponsor_description: String
    prize_description: String
    criteria_description: String
  }

  type Photo {
    id: ID!
    username: String!
    imageUrl: String!
    thumbUrl: String!
    bikeId: String!
    bikename: String!
    bikethumbUrl: String!
    likes: [User]
    userId: String
    name: String
    avatarUrl: String
  }
  type SponsorsContestType {
    id: ID
    name: String
    imageUrl: String
  }

  type S3SignedDocs {
    filename: String
    signedRequest: String!
    url: String!
  }

  type pageInfo {
    hasNextPage: Boolean!
    endCursor: String!
    startCursor: String!
  }

  type BikeEdge {
    node: Bike
    cursor: String
  }

  type BikeConnection {
    edges: [BikeEdge]
    pageInfo: pageInfo
  }

  type PostConnection {
    posts: [Post]
    cursor: String
  }

  type NotificationConnection {
    notifications: [Notification]
    cursor: String
  }

  type UserPostEdge {
    node: Post
    cursor: String
  }

  type UserPostConnection {
    edges: [UserPostEdge]
    pageInfo: pageInfo
  }

  type ForumPostEdge {
    node: Post
    cursor: String
  }

  type ForumPostConnection {
    edges: [UserPostEdge]
    pageInfo: pageInfo
  }

  type Link {
    url: String
    title: String
    description: String
    imageUrl: String
    type: String
  }

  type Feedback {
    pageLink: String
    description: String
    username: String
  }

  input FieldMap {
    field: String
    pattern: String
    gate: String
  }

  type Token {
    token: String
  }
  
  type Group {
    tripName: String
    tripPosts:[Post]
  }
  type TripGroupConnection{  
    tripGroup:[Group]
    nextPage: Int
    totalPages: Int
  }
  type TripPostConnection {
    posts: [Post]
    nextPage: Int
    totalPages: Int
  }
  type Trip {
    id: ID
    tripName: String
    coverUrl: String
    isActive: Boolean
    userId: String
    createdAt: String
    saveCount:Int
    savedtag: String,
  }
  type nextPrevPost{
    current:Int
    total:Int
    hasNext: Boolean
    hasPrev: Boolean
    postData:Post   
  }

  type Query {
    getPosts(cursor: String, usertag: String, limit: Int, type: String): PostConnection
    searchPosts(cursor: String, fieldmap: [FieldMap], limit: Int, type: String): PostConnection
    getUserPosts(cursor: String, userId: String, limit: Int): PostConnection
    searchForumPost(bikename: [String], location: [String], title: String, quesType: String!, cursor: String, limit: Int): PostConnection
    getMyQuestions(userId: String!, cursor: String, limit: Int): PostConnection
    getPost(postId: ID!): Post
    getBikes(first: Int, after: ID, search: String): BikeConnection!
    getBike(bikeId: ID!): Bike
    getBikeByName(bikename: String, multiple: Boolean): [Bike]
    getComments: [Comment]
    getComment(commentId: ID!): Comment
    getPostComments(postId: ID!): [Comment]
    getUserComments(username: String!): [Comment]
    getUsers(username: String!): [User]
    getUser(userId: ID!): User
    getUserOwnBikes(userId: ID!): User
    getUserFollowBikes(userId: ID!): User
    getUserTrips(userId: ID!): [Post]
    getContests(isActive: Boolean,contestsClosed: Boolean): [Contest]
    getContest(contestId: ID!): Contest
    getLink(url: String!): Link
    getLinks: [Link]

    getUserNotifications(username: String!): NotificationsAndNotificationTotal
    
    getUserAllNotifications(cursor: String, usertag: String, limit: Int): NotificationConnection
    getAllSponsors(isActive: Boolean): [Sponsor]
        
    searchTrips(tripName: String, multiple: Boolean,userId: ID!): [Post]
    getOwnTrips(pageNo: Int, userId: String!, limit: Int): TripGroupConnection
    getPostsByTripName(cursor: String, userId: String!, limit: Int,tripName:String!,pageNo:Int): TripPostConnection
    getTripDetails(userId: String!,tripName: String!):[Trip]
    getNextPrevTrip(userId: String!,tripName: String!,postId: ID!,type:String!): nextPrevPost
 
  }

  type Mutation {
    createAndUpdateTrip(tripName:String!,coverUrl:String,isActive:Boolean,userId:String!,saveCount:Int): Trip!
    saveTrip(tripName: String!): Trip
    createCommonPost(
      postId: ID
      postType: String!
      title: String!
      bikes: [BikesInPost]
      body: String!
      previewBody: String!
      previewMedia: String
      avatarUrl: String!
      username: String!
      name: String!
      userId: String!
      userbikes: String!
      pictureUrls: [String]
      embedPicture: String!
      location: [String!]
      when: String
      days: Int
      offRoadPercentage: Int
      gpxFiles: [String!]
      when: String
      quesType: String
      additionalTag: String
      tripName:String
    ): Post!
    signup(registerInput: RegisterInput): User!
    confirmEmail(token: String!): User!
    signin(username: String!, password: String!): User!
    signinWithProvider(access_token: String!, provider: String!): User!
    forgotPassword(email: String!): User!
    resetPassword(email: String!, password: String!, token: String!): User!
    editUser(userId: ID!, name: String, avatarUrl: String, avatarFile: String, email: String, username: String, location: String, usertag: String): User
    addBikes(bikes: [BikesInPost], type: String!): User!
    deleteUserBike(userId: ID!, bikeId: String!, type: String!): User!
    followBike(bikes: [BikesInPost]): User!
    savePost(postId: ID): Post!
    createPost(
      postId: ID
      title: String!
      bikes: [BikesInPost]
      body: String!
      pictureUrls: [String]
      location: [String]
      when: String
      days: Int
      offRoadPercentage: Int
      gpxFiles: [String]
      username: String!
      userId: String!
      userbikes: String!
      avatarUrl: String!
    ): Post!
    createForumPost(
      postId: ID
      title: String!
      bikes: [BikesInPost]
      body: String!
      location: [String]
      previewBody: String!
      previewMedia: String
      embedPicture: String
      username: String!
      name: String!
      userId: String!
      userbikes: String
      avatarUrl: String!
      quesType: String!
      additionalTag: String
    ): Post!

    deletePost(postId: ID!): String!
    createComment(
      postId: ID!
      body: String!
      replyToId: String
      username: String!
      userId: String!
      userbikes: String!
      avatarUrl: String!
      name: String!
    ): CommentAndPost!
    createSponsor(id: String, name: String!, description: String!, imageUrl: String!, isActive: Boolean!): Sponsor!
    activeDeactiveSponsor(id: String!): [Sponsor]
    activeDeactiveContest(id: String!): [Contest]
    deleteComment(commentId: ID!, replyToId: ID): DeleteCommentAndPost
    updateComment(postId: ID!, body: String!, commentId: String!): [Comment]
    likePost(postId: ID!): Post!
    likeComment(commentId: ID, postId: ID): [Comment]
    dislikeComment(commentId: ID, postId: ID): [Comment]
    createBike(
      bikename: String!
      description: String!
      brand: String!
      category: [String!]!
      storyUrl: String
      pictureUrls: [String]
      isActive: Boolean!
      thumbUrl: String
      prodStartYear: String
      prodEndYear: String
    ): Bike!

    editBike(
      bikeId: ID!
      bikename: String!
      description: String!
      brand: String!
      category: [String!]!
      isActive: Boolean!
      storyUrl: String
      pictureUrls: [String]
      thumbUrl: String
      thumbFile: String
      prodStartYear: String
      prodEndYear: String
    ): Bike!

    createContest(
      id: String
      title: String!
      sponsors: [SponsorsContest]
      imageUrl: String!
      closingDate: String!
      isActive: Boolean!
      sponsor_description: String!
      prize_description: String!
      criteria_description: String!
    ): [Contest]
    addPhotoToContest(
      contestId: ID!
      imageUrl: String!
      thumbUrl: String!
      bikeId: String!
      bikename: String!
      bikethumbUrl: String!
      userId: String!
      username: String!
      name: String!
      avatarUrl: String!
    ): Photo
    addPreviewPhotoToContest(contestId: ID!, imageUrl: String!, thumbUrl: String!): Photo
    deletePhotoContestImage(contestId: ID!, imageUrl: String!): Photo
    likeUnlikePhotoContestImage(contestId: ID!, imageUrl: String!, thumbUrl: String!): Photo
    s3Sign(files: [filesForS3Signature!]): [S3SignedDocs]
    followUser(userId: String!, username: String!, avatarUrl: String!): User!
    createSharedLink(url: String!, title: String!, imageUrl: String, description: String!, type: String!): Link
    createFeedback(pageLink: String!, description: String!): Feedback!
    resendEmail(userId: ID): String!

    readNotification(notificationId: ID!): Int
    readAllNotification(username: String!): NotificationsAndNotificationTotal
    refreshAccessToken(refreshToken: String): String
    extendAccessToken(refre: String): Token
    test(me: String): String
    saveNotificationFrequency(frequency: String): User!
    
  }

  type Subscription {
    newPost: Post!
    newBike: Bike!
  }
`
