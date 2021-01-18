import React, { useContext, useState, useEffect } from "react"
import { useQuery } from "@apollo/client"
import { Header, Card, Form, Dimmer, Loader, Button } from "semantic-ui-react"
import Avatar from "../../src/components/util/Avatar"
import { AuthContext } from "../context/auth"
import { FETCH_POSTS_QUERY } from "../common/gql_api_def"
import ListPosts from "../components/post/ListPosts"
import Navigation from "../layout/Navigation"
import { useInfiniteScroll } from "../util/hooks"
import { URL_SIGN_UP } from "../util/user-messages"
import { Link } from "react-router-dom"
import { fetchLimit } from "../util/Constants"
import BasicPostModel from "../components/post/BasicPostModel"

function Home() {
  const { user } = useContext(AuthContext)

  //We want to render only as many times as needed; create an object instead of individual fields
  const [postConnection, setPostConnection] = useState({})
  const [isFetching, setIsFetching] = useInfiniteScroll()

  const usertag = user?.usertag || ""
  const { loading, data, error, fetchMore } = useQuery(FETCH_POSTS_QUERY, {
    variables: { cursor: "", usertag, limit: fetchLimit, type: "posts" }
  })

  const [showSharePost, setShowSharePost] = React.useState(false)
  const onClickSharePost = () => {
    setShowSharePost(!showSharePost)
  }

  // this.setState((prevState) => ({ visible: !prevState.visible }))

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
        variables: {
          cursor: postConnection.cursor,
          usertag,
          limit: fetchLimit,
          type: "posts"
        },
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

  //TODO: User Avatar to be shown here after fix of MD-53 Users data from context is lost after page reloading
  return (
    <Navigation>
      {!user && (
        <Card fluid className="beta-welcome-message">
          <Card.Content>
            <Card.Header>Welcome to MotoMob!</Card.Header>
            <Card.Description className="text-center">
              You can read more about us{" "}
              <a target="_blank" href="/about.html">
                here
              </a>
            </Card.Description>
          </Card.Content>
        </Card>
      )}
      {user && (
        <Card fluid className="share-post">
          <Header as="h4" image onClick={onClickSharePost} className="pointer">
            <Avatar src="/assets/images/bike-4.png" alt="" />
            <Header.Content>
              <Form id="sharepostInput">
                <Form.Group inline>
                  <div className="borderless">{`Hey ${user.username}, are you riding today?`}</div>
                  <Button type="submit" className="post-btn">
                    Share
                  </Button>
                </Form.Group>
              </Form>
            </Header.Content>
          </Header>
          <div className="text-center">
            <Link to="/post/create" className="btn-story">
              <img src="/assets/images/icons/bike-story.svg" alt="Bike Story" width="28" height="28" className="align-middle" />
              Bike Story
            </Link>
            <Link to="/post/create/1" className="btn-story">
              <img src="/assets/images/icons/trip-story.svg" alt="Trip Story" width="24" height="24" className="align-middle" />
              Trip Story
            </Link>
          </div>
        </Card>
      )}

      {user && showSharePost && (
        <>
          {/* <CommonPost post={null} postNewType={"BasicPost"} onClickSharePost={onClickSharePost} /> */}
          <BasicPostModel title="Edit" onClickSharePost={onClickSharePost} postNewType={"BasicPost"} addNewPost={true} setShowSharePost={setShowSharePost} />
        </>
      )}

      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
        <ListPosts posts={postConnection.posts} parentAction={"home"} />
      )}
    </Navigation>
  )
}

export default Home
