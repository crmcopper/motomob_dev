import gql from "graphql-tag"

// ------------------------------------ All Queries -------------------------------------------------------//

export const FETCH_POSTS_QUERY__FRAGMENT = gql`
  fragment PostCounters on Post {
    likeCount
    commentCount
  }
`

export const FETCH_POSTS_QUERY = gql`
  query($cursor: String, $usertag: String, $limit: Int, $type: String) {
    getPosts(cursor: $cursor, usertag: $usertag, limit: $limit, type: $type) {
      posts {
        id
        body
        title
        createdAt
        username
        name
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        savedtag
        saveCount
        previewBody
        previewMedia
        tripName
      }
      cursor
    }
  }
`
export const FETCH_USER_POSTS_QUERY = gql`
  query($cursor: String, $userId: String, $limit: Int) {
    getUserPosts(cursor: $cursor, userId: $userId, limit: $limit) {
      posts {
        id
        body
        title
        createdAt
        username
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        savedtag
        saveCount
      }
      cursor
    }
  }
`

export const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      title
      createdAt
      name
      username
      avatarUrl
      userId
      userbikes
      likeCount
      pictureUrls
      userbikes
      postType
      location
      when
      days
      offRoadPercentage
      gpxFiles
      bikes {
        bikeId
        bikename
        thumbUrl
      }
      likes {
        username
      }
      commentCount
      postag
      savedtag
      saveCount
      tripName
    }
  }
`

export const FETCH_POST_COMMENTS_QUERY = gql`
  query($postId: ID!) {
    getPostComments(postId: $postId) {
      id
      replyToId
      postId
      username
      name
      avatarUrl
      userId
      userbikes
      createdAt
      body
      replies {
        id
        replyToId
        name
        username
        avatarUrl
        userId
        userbikes
        body
        likes {
          username
          id
          avatarUrl
        }
        likeCount
        dislikes {
          username
          id
          avatarUrl
        }
        dislikeCount
      }
      likes {
        username
        id
        avatarUrl
      }
      likeCount
      dislikes {
        username
        id
        avatarUrl
      }
      dislikeCount
    }
  }
`

export const FETCH_USER_QUERY = gql`
  query($userId: ID!) {
    getUser(userId: $userId) {
      id
      name
      username
      email
      avatarUrl
      followersCount
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followers {
        id
        username
        avatarUrl
      }
      following {
        id
        username
        avatarUrl
      }
      usertag
      status
      notificationFrequency
    }
  }
`
export const FETCH_USER_OWN_BIKES_QUERY = gql`
  query($userId: ID!) {
    getUserOwnBikes(userId: $userId) {
      id
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
    }
  }
`

export const FETCH_USER_FOLLOW_BIKES_QUERY = gql`
  query($userId: ID!) {
    getUserFollowBikes(userId: $userId) {
      id
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
    }
  }
`

export const FETCH_USER_TRIP_QUERY = gql`
  query($userId: ID!) {
    getUserTrips(userId: $userId) {
      id
      title
      createdAt
      username
      userId
      pictureUrls
      userbikes
      postType
    }
  }
`

export const FETCH_BIKES_QUERY = gql`
  query($first: Int, $after: ID, $search: String) {
    getBikes(first: $first, after: $after, search: $search) {
      edges {
        node {
          id
          bikename
          description
          storyUrl
          isActive
          pictureUrls
          brand
          category
          thumbUrl
          prodStartYear
          prodEndYear
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

export const FETCH_BIKE_QUERY = gql`
  query($bikeId: ID!) {
    getBike(bikeId: $bikeId) {
      id
      bikename
      description
      storyUrl
      isActive
      pictureUrls
      brand
      category
      thumbUrl
      prodStartYear
      prodEndYear
      createdAt
    }
  }
`

export const FETCH_BIKE_BY_NAME_QUERY = gql`
  query($bikename: String, $multiple: Boolean) {
    getBikeByName(bikename: $bikename, multiple: $multiple) {
      id
      bikename
      thumbUrl
      prodStartYear
    }
  }
`


export const SEARCH_TRIP_BY_NAME_QUERY = gql`
  query($tripName: String, $multiple: Boolean,$userId: ID!) {
    searchTrips(tripName: $tripName, multiple: $multiple,userId: $userId) {
      id
      tripName
    }
  }
`
export const SEARCH_POST_QUERY = gql`
  query($fieldmap: [FieldMap], $limit: Int) {
    searchPosts(fieldmap: $fieldmap, limit: $limit) {
      cursor
      posts {
        id
        body
        title
        createdAt
        username
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        saveCount
        previewBody
      }
    }
  }
`

export const FETCH_CONTESTS_QUERY = gql`
  query getContests($isActive: Boolean,$contestsClosed:Boolean) {
    getContests(isActive: $isActive,contestsClosed:$contestsClosed) {
      id
      title
      sponsors {
        id
        name
        imageUrl
      }
      imageUrl
      closingDate
      isActive
      sponsor_description
      prize_description
      criteria_description
    }
  }
`

export const FETCH_CONTEST_QUERY = gql`
  query($contestId: ID!) {
    getContest(contestId: $contestId) {
      id
      title
      imageUrl
      photos {
        id
        username
        imageUrl
        thumbUrl
        avatarUrl
        name
        userId
        likes {
          username
          id
          avatarUrl
        }
      }
      sponsors {
        id
        name
        imageUrl
      }
      closingDate
      sponsor_description
      prize_description
      criteria_description
    }
  }
`

export const FETCH_USERS_QUERY = gql`
  query($username: String!) {
    getUsers(username: $username) {
      id
      email
      avatarUrl
      name
      username
      location
      followersCount
      bikes
      ownBikes {
        bikename
      }
    }
  }
`
export const SEARCH_FORUM_POST_QUERY = gql`
  query($bikename: [String], $location: [String], $title: String!, $quesType: String!, $cursor: String, $limit: Int) {
    searchForumPost(bikename: $bikename, location: $location, title: $title, quesType: $quesType, cursor: $cursor, limit: $limit) {
      posts {
        id
        body
        title
        createdAt
        username
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        saveCount
        savedtag
        previewBody
      }
      cursor
    }
  }
`
export const FETCH_MYQUESTIONS_QUERY = gql`
  query($userId: String!, $cursor: String, $limit: Int) {
    getMyQuestions(userId: $userId, cursor: $cursor, limit: $limit) {
      posts {
        id
        body
        title
        createdAt
        username
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        saveCount
        savedtag
        previewBody
      }
      cursor
    }
  }
`
export const FETCH_USER_TRIP_GROUP_QUERY = gql`
  query($pageNo: Int, $userId: String!, $limit: Int) {
    getOwnTrips(pageNo: $pageNo, userId: $userId, limit: $limit) {
     tripGroup{
        tripName
        tripPosts{
              id
              body
              title
              createdAt
              username
              name
              avatarUrl
              userId
              userbikes
              likeCount
              likes {
                username
              }
              commentCount
              postag
              postType
              pictureUrls
              bikes {
                bikeId
                bikename
                thumbUrl
              }
              location
              when
              days
              offRoadPercentage
              gpxFiles
              savedtag
              saveCount
              previewBody
              previewMedia
              tripName
        }
      }   
      nextPage
      totalPages
    }
  }
`
export const FETCH_TRIP_BY_NAME_QUERY = gql`
  query($cursor: String, $userId: String!, $limit: Int,$tripName:String!,$pageNo:Int) {
    getPostsByTripName(cursor: $cursor, userId: $userId, limit: $limit,tripName:$tripName,pageNo:$pageNo) {
      posts {
        id
        body
        title
        createdAt
        username
        name
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        savedtag
        saveCount
        previewBody
        previewMedia
        tripName
      }     
      nextPage
      totalPages
    }
  }
`

export const FECTH_TRIP_QUERY = gql`
  query($userId:String!,$tripName:String!) {
    getTripDetails(userId:$userId,tripName:$tripName) {
     id
     userId
     tripName
     coverUrl
     saveCount
     savedtag
    }
  }
`
export const FETCH_NEXT_PREV_TRIP = gql`
  query($userId: String!,$tripName: String!,$postId: ID!,$type:String!) {
    getNextPrevTrip(userId: $userId,tripName:$tripName,postId:$postId,type:$type) {
      postData{
        id
        body
        title
        createdAt
        username
        name
        avatarUrl
        userId
        userbikes
        likeCount
        likes {
          username
        }
        commentCount
        postag
        postType
        pictureUrls
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        location
        when
        days
        offRoadPercentage
        gpxFiles
        savedtag
        saveCount
        previewBody
        previewMedia
        tripName
      }   
      hasNext
      hasPrev
      current
      total
    }
  }
`
// ------------------------------------ All Mutations -------------------------------------------------------//
export const SIGN_UP_USER = gql`
  mutation signup(
    $name: String!
    $username: String!
    $email: String!
    $avatarUrl: String!
    $password: String
    $location: String!
    $ownBikes: [BikesInPost!]
    $access_token: String
    $provider: String
  ) {
    signup(
      registerInput: {
        name: $name
        username: $username
        email: $email
        avatarUrl: $avatarUrl
        password: $password
        location: $location
        ownBikes: $ownBikes
        access_token: $access_token
        provider: $provider
      }
    ) {
      id
      email
      name
      username
      avatarUrl
      admin
      createdAt
      token
      refreshToken
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
      }
      status
      googleId
      facebookId
    }
  }
`

export const SIGN_IN_USER = gql`
  mutation signin($username: String!, $password: String!) {
    signin(username: $username, password: $password) {
      id
      email
      name
      username
      avatarUrl
      admin
      createdAt
      token
      refreshToken
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
      }
      status
    }
  }
`

export const SIGN_IN_WITH_PROVIDER = gql`
  mutation signinWithProvider($access_token: String!, $provider: String!) {
    signinWithProvider(access_token: $access_token, provider: $provider) {
      id
      email
      name
      username
      avatarUrl
      admin
      createdAt
      token
      refreshToken
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
      }
      status
    }
  }
`

export const FORGOT_PASSWORD = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email) {
      email
    }
  }
`

export const EDIT_USER = gql`
  mutation editUser(
    $userId: ID!
    $name: String
    $email: String
    $username: String
    $avatarUrl: String
    $avatarFile: String
    $location: String
    $usertag: String
  ) {
    editUser(
      userId: $userId
      name: $name
      email: $email
      username: $username
      avatarUrl: $avatarUrl
      avatarFile: $avatarFile
      location: $location
      usertag: $usertag
    ) {
      email
      name
      username
      avatarUrl
      admin
      usertag
      bikes
      location
    }
  }
`

export const DELETE_USER_BIKE = gql`
  mutation deleteUserBike($userId: ID!, $bikeId: String!, $type: String!) {
    deleteUserBike(userId: $userId, bikeId: $bikeId, type: $type) {
      id
      email
      name
      username
      avatarUrl
      admin
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
    }
  }
`

export const ADD_BIKES = gql`
  mutation addBikes($bikes: [BikesInPost], $type: String!) {
    addBikes(bikes: $bikes, type: $type) {
      id
      email
      name
      username
      avatarUrl
      admin
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
    }
  }
`

export const CREATE_COMMENT_MUTATION = gql`
  mutation($postId: ID!, $body: String!, $replyToId: String, $avatarUrl: String!, $userbikes: String!, $username: String!, $userId: String!, $name: String!) {
    createComment(
      postId: $postId
      body: $body
      replyToId: $replyToId
      avatarUrl: $avatarUrl
      userbikes: $userbikes
      username: $username
      userId: $userId
      name: $name
    ) {
      comment {
        id
        replyToId
        postId
        avatarUrl
        userbikes
        username
        name
        userId
        createdAt
        body
      }

      post {
        id
        body
        title
        createdAt
        username
        avatarUrl
        userId
        userbikes
        likeCount
        pictureUrls
        userbikes
        postType
        location
        when
        days
        offRoadPercentage
        gpxFiles
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        likes {
          username
        }
        commentCount
        postag
        savedtag
        saveCount
      }
    }
  }
`
export const UPDATE_COMMENT_MUTATION = gql`
  mutation($postId: ID!, $body: String!, $commentId: String!) {
    updateComment(postId: $postId, body: $body, commentId: $commentId) {
      id
      replyToId
      postId
      avatarUrl
      userbikes
      username
      userId
      createdAt
      body
      replies {
        id
        replyToId
        username
        avatarUrl
        userId
        userbikes
        body
        likes {
          username
          id
          avatarUrl
        }
        likeCount
        dislikes {
          username
          id
          avatarUrl
        }
        dislikeCount
      }
    }
  }
`

export const CREATE_COMMON_POST_MUTATION = gql`
  mutation createCommonPost(
    $postId: ID
    $postType: String!
    $title: String!
    $previewBody: String!
    $previewMedia: String
    $bikes: [BikesInPost]
    $body: String!
    $avatarUrl: String!
    $username: String!
    $name: String!
    $userId: String!
    $userbikes: String!
    $pictureUrls: [String]
    $embedPicture: String!
    $location: [String!]
    $when: String
    $days: Int
    $offRoadPercentage: Int
    $gpxFiles: [String!]
    $quesType: String
    $additionalTag: String,
    $tripName:String
  ) {
    createCommonPost(
      postId: $postId
      postType: $postType
      title: $title
      bikes: $bikes
      previewBody: $previewBody
      previewMedia: $previewMedia
      body: $body
      avatarUrl: $avatarUrl
      username: $username
      name: $name
      userId: $userId
      userbikes: $userbikes
      pictureUrls: $pictureUrls
      embedPicture: $embedPicture
      location: $location
      when: $when
      days: $days
      offRoadPercentage: $offRoadPercentage
      gpxFiles: $gpxFiles
      quesType: $quesType
      additionalTag: $additionalTag,
      tripName:$tripName
    ) {
      id
      body
      title
      createdAt
      username
      name
      avatarUrl
      userId
      userbikes
      likeCount
      likes {
        username
      }
      commentCount
      postag
      postType
      pictureUrls
      bikes {
        bikeId
        bikename
        thumbUrl
      }
      location
      when
      days
      offRoadPercentage
      gpxFiles
      tripName
    }
  }
`

export const CREATE_POST_MUTATION = gql`
  mutation createPost(
    $postId: ID
    $title: String!
    $body: String!
    $bikes: [BikesInPost]
    $pictureUrls: [String]
    $location: [String]
    $when: String
    $days: Int
    $offRoadPercentage: Int
    $gpxFiles: [String]
    $avatarUrl: String!
    $userbikes: String!
    $username: String!
    $userId: String!
  ) {
    createPost(
      postId: $postId
      title: $title
      body: $body
      bikes: $bikes
      pictureUrls: $pictureUrls
      location: $location
      when: $when
      days: $days
      offRoadPercentage: $offRoadPercentage
      gpxFiles: $gpxFiles
      avatarUrl: $avatarUrl
      userbikes: $userbikes
      username: $username
      userId: $userId
    ) {
      id
      body
      title
      createdAt
      username
      avatarUrl
      userId
      userbikes
      likeCount
      likes {
        username
      }
      commentCount
      postag
      postType
      pictureUrls
      bikes {
        bikeId
        bikename
        thumbUrl
      }
      location
      when
      days
      offRoadPercentage
      gpxFiles
    }
  }
`

export const CREATE_FORUM_POST_MUTATION = gql`
  mutation createForumPost(
    $postId: ID
    $title: String!
    $body: String!
    $bikes: [BikesInPost]
    $previewBody: String!
    $previewMedia: String
    $embedPicture: String
    $location: [String]
    $avatarUrl: String!
    $userbikes: String
    $username: String!
    $name: String!
    $userId: String!
    $quesType: String!
    $additionalTag: String
  ) {
    createForumPost(
      postId: $postId
      title: $title
      body: $body
      bikes: $bikes
      location: $location
      previewBody: $previewBody
      previewMedia: $previewMedia
      embedPicture: $embedPicture
      avatarUrl: $avatarUrl
      userbikes: $userbikes
      username: $username
      name: $name
      userId: $userId
      quesType: $quesType
      additionalTag: $additionalTag
    ) {
      id
      body
      title
      createdAt
      username
      name
      avatarUrl
      userId
      userbikes
      likeCount
      likes {
        username
      }
      commentCount
      postag
      postType
      pictureUrls
      bikes {
        bikeId
        bikename
        thumbUrl
      }
      location
      when
      days
      offRoadPercentage
      gpxFiles
    }
  }
`

export const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`

export const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($commentId: ID!, $replyToId: ID) {
    deleteComment(commentId: $commentId, replyToId: $replyToId) {
      comment {
        id
        replyToId
        postId
        avatarUrl
        userbikes
        username
        userId
        createdAt
        body
        replies {
          id
          replyToId
          username
          avatarUrl
          userId
          userbikes
          body
          likes {
            username
            id
            avatarUrl
          }
          likeCount
          dislikes {
            username
            id
            avatarUrl
          }
          dislikeCount
        }
      }
      post {
        id
        body
        title
        createdAt
        username
        avatarUrl
        userId
        userbikes
        likeCount
        pictureUrls
        userbikes
        postType
        location
        when
        days
        offRoadPercentage
        gpxFiles
        bikes {
          bikeId
          bikename
          thumbUrl
        }
        likes {
          username
        }
        commentCount
        postag
        savedtag
        saveCount
      }
    }
  }
`

export const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      body
      title
      name
      createdAt
      username
      previewBody
      avatarUrl
      userId
      userbikes
      likeCount
      pictureUrls
      userbikes
      postType
      location
      when
      days
      offRoadPercentage
      gpxFiles
      bikes {
        bikeId
        bikename
        thumbUrl
      }
      likes {
        username
        id
      }
      commentCount
      postag
      savedtag
      saveCount
      tripName
      previewMedia
    }
  }
`
export const LIKE_COMMENT_MUTATION = gql`
  mutation likeComment($commentId: ID!, $postId: ID!) {
    likeComment(commentId: $commentId, postId: $postId) {
      id
      replyToId
      postId
      username
      avatarUrl
      userId
      userbikes
      createdAt
      body
      replies {
        id
        replyToId
        username
        avatarUrl
        userId
        userbikes
        body
        likes {
          username
          id
          avatarUrl
        }
        likeCount
        dislikes {
          username
          id
          avatarUrl
        }
        dislikeCount
      }
      likes {
        username
        id
        avatarUrl
      }
      likeCount
      dislikes {
        username
        id
        avatarUrl
      }
      dislikeCount
    }
  }
`

export const DISLIKE_COMMENT_MUTATION = gql`
  mutation dislikeComment($commentId: ID!, $postId: ID!) {
    dislikeComment(commentId: $commentId, postId: $postId) {
      id
      replyToId
      postId
      username
      avatarUrl
      userId
      userbikes
      createdAt
      body
      replies {
        id
        replyToId
        username
        avatarUrl
        userId
        userbikes
        body
        likes {
          username
          id
          avatarUrl
        }
        likeCount
        dislikes {
          username
          id
          avatarUrl
        }
        dislikeCount
      }
      likes {
        username
        id
        avatarUrl
      }
      likeCount
      dislikes {
        username
        id
        avatarUrl
      }
      dislikeCount
    }
  }
`

export const CREATE_BIKE = gql`
  mutation createBike(
    $bikename: String!
    $description: String!
    $brand: String!
    $category: [String!]!
    $storyUrl: String
    $isActive: Boolean!
    $pictureUrls: [String]
    $thumbUrl: String
    $prodStartYear: String
    $prodEndYear: String
  ) {
    createBike(
      bikename: $bikename
      description: $description
      brand: $brand
      isActive: $isActive
      category: $category
      storyUrl: $storyUrl
      pictureUrls: $pictureUrls
      thumbUrl: $thumbUrl
      prodStartYear: $prodStartYear
      prodEndYear: $prodEndYear
    ) {
      id
      bikename
    }
  }
`

export const EDIT_BIKE = gql`
  mutation editBike(
    $bikeId: ID!
    $bikename: String!
    $description: String!
    $brand: String!
    $category: [String!]!
    $isActive: Boolean!
    $storyUrl: String
    $pictureUrls: [String]
    $thumbUrl: String
    $thumbFile: String
    $prodStartYear: String
    $prodEndYear: String
  ) {
    editBike(
      bikeId: $bikeId
      bikename: $bikename
      description: $description
      brand: $brand
      isActive: $isActive
      category: $category
      storyUrl: $storyUrl
      pictureUrls: $pictureUrls
      thumbUrl: $thumbUrl
      thumbFile: $thumbFile
      prodStartYear: $prodStartYear
      prodEndYear: $prodEndYear
    ) {
      bikename
      description
      brand
      category
      isActive
      storyUrl
      pictureUrls
      thumbUrl
      prodStartYear
      prodEndYear
    }
  }
`

export const CREATE_CONTEST_MUTATION = gql`
  mutation createContest(
    $id: String
    $title: String!
    $sponsors: [SponsorsContest]
    $imageUrl: String!
    $closingDate: String!
    $isActive: Boolean!
    $sponsor_description: String!
    $prize_description: String!
    $criteria_description: String!
  ) {
    createContest(
      id: $id
      title: $title
      sponsors: $sponsors
      imageUrl: $imageUrl
      closingDate: $closingDate
      isActive: $isActive
      sponsor_description: $sponsor_description
      prize_description: $prize_description
      criteria_description: $criteria_description
    ) {
      id
      title
      createdAt
      sponsors {
        id
        name
        imageUrl
      }
      imageUrl
      closingDate
      isActive
      sponsor_description
      prize_description
      criteria_description
    }
  }
`

export const ADD_CONTEST_PHOTO = gql`
  mutation addPhotoToContest(
    $contestId: ID!
    $imageUrl: String!
    $thumbUrl: String!
    $bikeId: String!
    $bikename: String!
    $bikethumbUrl: String!
    $userId: String!
    $username: String!
    $name: String!
    $avatarUrl: String!
  ) {
    addPhotoToContest(
      contestId: $contestId
      imageUrl: $imageUrl
      thumbUrl: $thumbUrl
      bikeId: $bikeId
      bikename: $bikename
      bikethumbUrl: $bikethumbUrl
      userId: $userId
      username: $username
      name: $name
      avatarUrl: $avatarUrl
    ) {
      username
      userId
      name
      avatarUrl
      imageUrl
      thumbUrl
      bikeId
      bikename
      bikethumbUrl
    }
  }
`
export const ADD_PREVIEW_PHOTO_CONTEST = gql`
  mutation addPreviewPhotoToContest($contestId: ID!, $imageUrl: String!, $thumbUrl: String!) {
    addPreviewPhotoToContest(contestId: $contestId, imageUrl: $imageUrl, thumbUrl: $thumbUrl) {
      username
      imageUrl
      thumbUrl
    }
  }
`

export const DELETE_PHOTO_CONTEST_IMAGE = gql`
  mutation deletePhotoContestImage($contestId: ID!, $imageUrl: String!) {
    deletePhotoContestImage(contestId: $contestId, imageUrl: $imageUrl) {
      username
      imageUrl
    }
  }
`

export const S3_SIGN_MUTATION = gql`
  mutation s3Sign($files: [filesForS3Signature!]) {
    s3Sign(files: $files) {
      filename
      signedRequest
      url
    }
  }
`

export const FOLLOW_BIKE_MUTATION = gql`
  mutation followBike($bikes: [BikesInPost]) {
    followBike(bikes: $bikes) {
      id
      email
      name
      username
      avatarUrl
      admin
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
    }
  }
`

export const CREATE_SHARED_LINK_MUTATION = gql`
  mutation createSharedLink($url: String!, $title: String!, $description: String!, $type: String!, $imageUrl: String) {
    createSharedLink(url: $url, title: $title, description: $description, type: $type, imageUrl: $imageUrl) {
      url
      imageUrl
      title
      description
      type
    }
  }
`

export const CREATE_FEEDBACK_MUTATION = gql`
  mutation createFeedback($pageLink: String!, $description: String!) {
    createFeedback(pageLink: $pageLink, description: $description) {
      pageLink
      description
      username
    }
  }
`
export const CONFIRM_EMAIL_MUTATION = gql`
  mutation confirmEmail($token: String!) {
    confirmEmail(token: $token) {
      id
      email
      name
      username
      avatarUrl
      admin
      createdAt
      token
      refreshToken
      usertag
      bikes
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
      }
      status
    }
  }
`
export const RESET_PASSWORD_MUTATION = gql`
  mutation resetPassword($token: String!, $email: String!, $password: String!) {
    resetPassword(token: $token, email: $email, password: $password) {
      id
    }
  }
`
export const SAVE_POST = gql`
  mutation savePost($postId: ID!) {
    savePost(postId: $postId) {
      id
      body
      title
      createdAt
      name
      username
      avatarUrl
      userId
      userbikes
      likeCount
      pictureUrls
      userbikes
      postType
      location
      when
      days
      offRoadPercentage
      gpxFiles
      bikes {
        bikeId
        bikename
        thumbUrl
      }
      likes {
        username
      }
      commentCount
      postag
      savedtag
      saveCount
      tripName
      previewBody
      previewMedia
    }
  }
`
export const SAVE_FOLLOW = gql`
  mutation followUser($userId: String!, $username: String!, $avatarUrl: String!) {
    followUser(userId: $userId, username: $username, avatarUrl: $avatarUrl) {
      id
      name
      username
      email
      avatarUrl
      followersCount
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followers {
        id
        username
        avatarUrl
      }
      following {
        id
        username
        avatarUrl
      }
      usertag
      status
    }
  }
`
export const RESEND_EMAIL = gql`
  mutation resendEmail($userId: ID!) {
    resendEmail(userId: $userId)
  }
`
export const LIKE_UNLIKE_PHOTO_CONTEST_IMAGE = gql`
  mutation likeUnlikePhotoContestImage($contestId: ID!, $imageUrl: String!, $thumbUrl: String!) {
    likeUnlikePhotoContestImage(contestId: $contestId, imageUrl: $imageUrl, thumbUrl: $thumbUrl) {
      username
      imageUrl
      thumbUrl
    }
  }
`
export const CREATE_NOTIFICATION = gql`
  mutation createNotification(
    $notificationId: ID
    $type: String!
    $actionBy: String!
    $sendTo: String!
    $message: String!
    $userId: String!
    $avatarUrl: String!
    $userbikes: String!
    $username: String!
    $isCheck: String!
  ) {
    createNotification(
      notificationId: $notificationId
      type: $type
      actionBy: $actionBy
      sendTo: $sendTo
      message: $message
      userId: $userId
      avatarUrl: $avatarUrl
      userbikes: $userbikes
      username: $username
      isCheck: $isCheck
    ) {
      notificationId
      type
      actionBy
      sendTo
      message
      userId
      avatarUrl
      userbikes
      username
      isCheck
    }
  }
`

export const REFRESH_TOKEN = gql`
  mutation($refreshToken: String!) {
    refreshAccessToken(refreshToken: $refreshToken)
  }
`

export const FETCH_USER_NOTIFICATIONS = gql`
  query($username: String!) {
    getUserNotifications(username: $username) {
      notifications {
        id
        type
        link
        actionBy
        sendTo
        message
        userId
        avatarUrl
        userbikes
        username
        hasActioned
        createdAt
      }
      notificationsTotal
    }
  }
`

export const FETCH_USER_ALL_NOTIFICATIONS = gql`
  query($cursor: String, $usertag: String, $limit: Int) {
    getUserAllNotifications(cursor: $cursor, usertag: $usertag, limit: $limit) {
      notifications {
        id
        type
        link
        actionBy
        sendTo
        message
        userId
        avatarUrl
        userbikes
        username
        hasActioned
        createdAt
      }
      cursor
    }
  }
`

export const READ_NOTIFICATION = gql`
  mutation readNotification($notificationId: ID!) {
    readNotification(notificationId: $notificationId) 
  }
`
export const READ_ALL_NOTIFICATION = gql`
  mutation readAllNotification($username: String!) {
    readAllNotification(username: $username) {
      notifications {
        id
        type
        link
        actionBy
        sendTo
        message
        userId
        avatarUrl
        userbikes
        username
        hasActioned
        createdAt
      }
      notificationsTotal
    }
  }
`

export const SAVE_NOTIFICATION_FREQUENCY = gql`
  mutation saveNotificationFrequency($frequency: String!) {
    saveNotificationFrequency(frequency: $frequency) {
      id
      name
      username
      email
      avatarUrl
      followersCount
      location
      ownBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followBikes {
        bikeId
        bikename
        thumbUrl
        prodStartYear
      }
      followers {
        id
        username
        avatarUrl
      }
      following {
        id
        username
        avatarUrl
      }
      usertag
      status
      notificationFrequency
    }
  }
`

export const CREATE_SPONSOR_MUTATION = gql`
  mutation($id: String, $name: String!, $description: String!, $imageUrl: String!, $isActive: Boolean!) {
    createSponsor(id: $id, name: $name, description: $description, imageUrl: $imageUrl, isActive: $isActive) {
      id
      name
      description
      imageUrl
      isActive
    }
  }
`

export const FETCH_ALL_SPONSOR_QUERY = gql`
  query getAllSponsors($isActive: Boolean) {
    getAllSponsors(isActive: $isActive) {
      id
      name
      description
      imageUrl
      isActive
    }
  }
`

export const TOGGLEACTIVE_SPONSOR_MUTATION = gql`
  mutation activeDeactiveSponsor($id: String!) {
    activeDeactiveSponsor(id: $id) {
      id
      name
      description
      imageUrl
      isActive
    }
  }
`
export const TOGGLEACTIVE_CONTEST_MUTATION = gql`
  mutation activeDeactiveContest($id: String!) {
    activeDeactiveContest(id: $id) {
      id
      title
      createdAt
      sponsors {
        id
        name
        imageUrl
      }
      imageUrl
      closingDate
      isActive
      sponsor_description
      prize_description
      criteria_description
    }
  }
`
export const ADD_UPDATE_TRIP_DETAILS = gql`
  mutation createAndUpdateTrip($tripName:String!,$coverUrl:String,$isActive:Boolean,$userId:String!,$saveCount:Int) {
    createAndUpdateTrip(tripName:$tripName,coverUrl:$coverUrl,isActive:$isActive,userId:$userId,saveCount:$saveCount) {
      id
      tripName
      isActive
      coverUrl
      userId
      createdAt
      saveCount
    }
  }
`
export const SAVE_TRIP = gql`
  mutation saveTrip($tripName: String!) {
    saveTrip(tripName: $tripName) {
      id
      tripName
      isActive
      coverUrl
      userId
      createdAt
      saveCount
      savedtag
    }
  }
`
