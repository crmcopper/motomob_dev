import React, { useContext } from "react"
import Navigation from "../layout/Navigation"
import { Card, Container, Grid, Dimmer, Loader } from "semantic-ui-react"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import { FETCH_POST_QUERY } from "../common/gql_api_def"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../context/auth"
import CommonPost from "../components/post/CommonPost"
import { GA_Track } from "../util/google-analytics"

const EditPost = props => {
  GA_Track(window.location.href)
  const postId = props.match.params.postId
  const { user } = useContext(AuthContext)
  const { loading: loadingPost, data: { getPost: post } = {} } = useQuery(FETCH_POST_QUERY, {
    variables: { postId }
  })

  return (
    <Navigation createpost>
      {loadingPost ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
        user &&
        post &&
        user.id === post.userId && (
          <>
            <Container>
              <Grid>
                <Grid.Row className="post-container">
                  <Card fluid className="post-view create-post-new">
                    <CommonPost postType={post?.postType} post={post} />
                  </Card>
                </Grid.Row>
              </Grid>
            </Container>
          </>
        )
      )}
    </Navigation>
  )
}

export default EditPost
