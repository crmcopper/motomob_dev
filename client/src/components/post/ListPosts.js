import React, { useContext, useState, useEffect } from "react"
import { Card, Grid } from "semantic-ui-react"
import { Link } from "react-router-dom"
import DisplayPostCard from "./DisplayPostCard"
import { AuthContext } from "../../context/auth"
import { BTN_TEXT_SIGN_UP, BTN_TEXT_SIGN_IN, URL_SIGN_IN, URL_SIGN_UP } from "../../util/user-messages"

function ListPosts({ posts, parentAction }) {
  const { user } = useContext(AuthContext)
  const [usePosts, setUsePosts] = useState({})

  const deletePost = id => {
    setUsePosts(posts.filter(row => row.id !== id))
  }
  useEffect(() => {
    setUsePosts(posts)
  }, [posts])

  return (
    <>
      {!user && parentAction === "home" && (
        <Grid>
          <Grid.Column textAlign="center" className="user-button">
            <Link className="ui red button" to={URL_SIGN_UP}>
              {BTN_TEXT_SIGN_UP}
            </Link>
            <Link
              className="ui red white-addon button"
              to={{
                pathname: `${URL_SIGN_IN}`,
                state: { redirectUrl: window.location.pathname }
              }}
            >
              {BTN_TEXT_SIGN_IN}
            </Link>
          </Grid.Column>
        </Grid>
      )}
      {usePosts && usePosts.length > 0 ? (
        usePosts.map(post => (
          <Card fluid className="post-view fixed-view" key={post.id}>
            <DisplayPostCard post={post} parentAction={parentAction} deletePost={deletePost} />
          </Card>
        ))
      ) : (
          <h3>still waiting for a post...</h3>
        )}
    </>
  )
}

export default ListPosts
