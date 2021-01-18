import React, { useContext, useEffect, useState } from "react"
import { Header, Tab, Dimmer, Loader, Button } from "semantic-ui-react"
import { useQuery } from "@apollo/client"
import Navigation from "../layout/Navigation"
import Avatar from "../components/util/Avatar"
import { AuthContext } from "../context/auth"
import { FETCH_POSTS_QUERY, FETCH_USER_QUERY, SAVE_FOLLOW } from "../common/gql_api_def"
import ListPosts from "../components/post/ListPosts"
import FollowBikes from "../components/profile/bikes/FollowBikes"
import OwnBikes from "../components/profile/bikes/OwnBikes"
import UserTrips from "../components/profile/trips/UserTrips"
import { ComingSoonCard } from "./static/ComingSoon"
import { images, fetchLimit } from "../util/Constants"
import { useInfiniteScroll } from "../util/hooks"
import { Link, useHistory } from "react-router-dom"
import { useMutation } from "@apollo/client"

//import UserBikes, { bikesPanes } from "../components/profile/UserBikes"

const Profile = props => {
  const userId = props.match.params.userId
  const history = useHistory()

  const tab = props.match.params.tab ? props.match.params.tab : 0
  const [tabIndex, setTabIndex] = useState(0)
  const [childTabIndex, setChildTabIndex] = useState(0)

  const [follow, setFollow] = useState(false)

  const changeTab = (e, { activeIndex }) => {
    setTabIndex(activeIndex)
    setChildTabIndex(0)
    let path = `/profile/${userId}/${activeIndex}`
    history.push(path)
  }

  const changeChildTab = (e, { activeIndex }) => {
    setChildTabIndex(activeIndex)
  }

  useEffect(() => {
    setTabIndex(tab)
  }, [tab])

  const { user: loggedInUser } = useContext(AuthContext)
  const { data: { getUser: user = [] } = {} } = useQuery(FETCH_USER_QUERY, {
    variables: { userId }
  })

  useEffect(() => {
    //---on page load we have checked user already followed or not
    if (user.followers) {
      const item = user.followers.find(item => item.id === loggedInUser.id)
      if (item !== undefined && Object.keys(item).length > 0) {
        setFollow(true)
      }
    } else setFollow(false)
  }, [user])

  //We want to render only as many times as needed; create an object instead of individual fields
  const [postConnection, setPostConnection] = useState({})
  const [isFetching, setIsFetching] = useInfiniteScroll()

  const { loading, data, error, fetchMore } = useQuery(FETCH_POSTS_QUERY, {
    variables: { cursor: "", usertag: userId, limit: fetchLimit, type: "userPosts" }
  })

  //Initial pull
  useEffect(() => {
    if (data) {
      setPostConnection(data.getPosts)
    }
  }, [data])

  //subsequent pulls of data
  useEffect(() => {
    if (postConnection.cursor && isFetching) {
      fetchMore({
        query: FETCH_POSTS_QUERY,
        variables: { cursor: postConnection.cursor, usertag: userId, limit: fetchLimit, type: "userPosts" },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          // Since we have a postConnection object of which one element is replaced (Cursor) and the other
          // extended (posts), lets create a temporary object to set. Rememeber: every setstate rerenders!
          let _updatedPostConnection = fetchMoreResult.getPosts
          _updatedPostConnection.posts = [...postConnection.posts, ..._updatedPostConnection.posts]

          setPostConnection(_updatedPostConnection)
        }
      })
    }
  }, [isFetching])

  const [saveFollow] = useMutation(SAVE_FOLLOW, {
    variables: { userId: user.id, username: user.username, avatarUrl: user.avatarUrl },
    update(store, { data }) {
      const userData = store.readQuery({
        query: FETCH_USER_QUERY,
        variables: { userId: userId }
      })

      let newUserData = data.followUser

      store.writeQuery({
        query: FETCH_USER_QUERY,
        variables: { userId: userId },
        data: newUserData
      })
    }
  })
  function onFollow() {
    setFollow(!follow)
    saveFollow()
  }
  const bikesPanes = [
    {
      menuItem: "own",
      render: () => (
        <Tab.Pane attached={false}>
          <OwnBikes userId={userId} username={user.username} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "follow",
      render: () => (
        <Tab.Pane attached={false}>
          <FollowBikes userId={userId} username={user.username} />
        </Tab.Pane>
      )
    }
  ]

  const tripsPanes = [
    {
      menuItem: "my trips",
      render: () => <UserTrips username={user.username} userId={userId} />
    },
    {
      menuItem: "saved trips",
      render: () => (
        <Tab.Pane attached={false}>
          <ComingSoonCard src={images[Math.floor(Math.random() * (images.length - 1))]} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "locations I follow",
      render: () => (
        <Tab.Pane attached={false}>
          <ComingSoonCard src={images[Math.floor(Math.random() * (images.length - 1))]} />
        </Tab.Pane>
      )
    }
  ]
  const panes = [
    {
      menuItem: {
        key: "posts",
        icon: (
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/post.svg" className="gray-color" alt="Posts" width="18" height="20" />
            <img src="/assets/images/icons/post.svg" className="red-color" alt="Posts" width="18" height="20" />
          </span>
        ),
        content: "Posts"
      },
      render: () => (
        <Tab.Pane>
          {loading ? (
            <Dimmer active>
              <Loader />
            </Dimmer>
          ) : (
              <ListPosts posts={postConnection.posts} parentAction={"user"} />
            )}
        </Tab.Pane>
      )
    },
    {
      menuItem: {
        key: "bikes",
        icon: (
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/bikes.svg" className="gray-color" alt="My bikes" width="24" height="20" />
            <img src="/assets/images/icons/bikes.svg" className="red-color" alt="My bikes" width="24" height="20" />
          </span>
        ),
        content: "Bikes"
      },
      render: () => (
        <Tab.Pane>
          <Tab menu={{ borderless: true, attached: false, tabular: false }} className="borderless" panes={bikesPanes} activeIndex={childTabIndex} onTabChange={changeChildTab} />
        </Tab.Pane>
      )
    },
    {
      menuItem: {
        key: "mytrips",
        icon: (
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/trips.svg" className="gray-color" alt="My trips" width="20" height="20" />
            <img src="/assets/images/icons/trips.svg" className="red-color" alt="My trips" width="20" height="20" />
          </span>
        ),
        content: "Trips"
      },
      render: () => (
        <Tab.Pane>
          <Tab menu={{ borderless: true, attached: false, tabular: false }} className="borderless" panes={tripsPanes} activeIndex={childTabIndex} onTabChange={changeChildTab} />
        </Tab.Pane>
      )
    }
  ]

  return (
    <Navigation>
      {user && (
        <Header image className="profile-header">
          <Avatar profileUser={user} />
          <Header.Content>
            {user.name}
            <Header.Subheader>
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/atsign.svg" className="gray-color" alt="@" width="20" height="20" />
                <img src="/assets/images/icons/atsign.svg" className="red-color" alt="@" width="20" height="28" />
                <span className="counter">{user.username}</span>
              </span>
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/followers.svg" className="gray-color" alt="Followers" width="20" height="20" />
                <img src="/assets/images/icons/followers.svg" className="red-color" alt="Followers" width="20" height="20" />
                <span className="counter">{user.followersCount ? user.followersCount : 0} Followers</span>
              </span>
              {user.location && (
                <span className="svg-icon">
                  <img src="/assets/images/icons/gray/location.svg" className="gray-color" alt="Location" width="11" height="16" />
                  <img src="/assets/images/icons/location.svg" className="red-color" alt="Location" width="11" height="16" />
                  <span className="counter">{user.location}</span>
                </span>
              )}
            </Header.Subheader>
            {loggedInUser && loggedInUser.id !== userId ? (
              <>
                {follow ? (
                  <Button color="red" onClick={() => onFollow()}>
                    <img src="/assets/images/icons/gray/unfollow-user.svg" alt="Unfollow" width="16" height="16" />
                    <span className="align-middle">Unfollow</span>
                  </Button>
                ) : (
                    <Button color="red" onClick={() => onFollow()}>
                      <img src="/assets/images/icons/gray/follow-user.svg" alt="Follow" width="16" height="16" />
                      <span className="align-middle">Follow</span>
                    </Button>
                  )}
              </>
            ) : (
                ""
              )}

            {loggedInUser && loggedInUser.id === userId ? (
              <Link to={`/edit-profile/${userId}`} className="cancel-btn">
                <Button color="red">
                  <img src="/assets/images/icons/edit.svg" alt="Edit" width="16" height="16" />
                  <span className="align-middle">Edit profile</span>
                </Button>
              </Link>
            ) : (
                ""
              )}
            {/* {loggedInUser && loggedInUser.id === userId ? <EditProfile user={loggedInUser} /> : ""} */}
          </Header.Content>
        </Header>
      )}
      <Tab
        menu={{ secondary: true, pointing: true, activeIndex: "mytrips" }}
        activeIndex={tabIndex}
        panes={panes}
        onTabChange={changeTab}
        className="tab-center"
      />
    </Navigation>
  )
}

export default Profile
