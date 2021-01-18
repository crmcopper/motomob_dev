import React from "react"
import { useQuery } from "@apollo/client"
import { Grid } from "semantic-ui-react"
import PostDetails from "../components/post/PostDetails"
import CreateComment from "../components/comment/CreateComment"
import ListComments from "../components/comment/ListComments"
import { FETCH_POST_COMMENTS_QUERY, FETCH_POST_QUERY } from "../common/gql_api_def"
import Navigation from "../layout/Navigation"
import { Dimmer, Loader, Tab } from "semantic-ui-react"

function SinglePost(props) {
  const postId = props.match.params.postId

  const { loading: loadingPost, data: { getPost: post } = {} } = useQuery(FETCH_POST_QUERY, {
    variables: { postId }
  })

  const { loading: loadingComments, data: { getPostComments: comments = [] } = {} } = useQuery(FETCH_POST_COMMENTS_QUERY, {
    variables: { postId }
  })
  const bikesPanes = [
    {
      menuItem: "Most recent",
      render: () => <Tab.Pane attached={false}>Most recent</Tab.Pane>
    },
    {
      menuItem: "Most useful",
      render: () => <Tab.Pane attached={false}>Most useful</Tab.Pane>
    }
  ]
  let postMarkup
  if (loadingPost || loadingComments) {
    postMarkup = (
      <Navigation>
        <Dimmer active>
          <Loader />
        </Dimmer>
      </Navigation>
    )
  } else {
    postMarkup = (
      <Navigation>
        {post ? (
          <Grid.Row>
            <PostDetails post={post} />
          </Grid.Row>
        ) : (
          <h4>hmm... we didn't find what you were looking for. try search, maybe? </h4>
        )}
        <Grid.Row>
          {post && (
            <>
              <CreateComment postType={post.postType} postId={postId} comments={comments} />
              {(post.postType === "BikeForumPost" || post.postType === "TripForumPost") && (
                <div className="tab-center forum-tab">
                  <div className="ui">
                    <Tab menu={{ borderless: true, attached: false, tabular: false }} className="borderless" panes={bikesPanes} />
                  </div>
                </div>
              )}
              <ListComments postType={post.postType} postId={postId} comments={comments} />
            </>
          )}
        </Grid.Row>
      </Navigation>
    )
  }
  return postMarkup
}

export default SinglePost
