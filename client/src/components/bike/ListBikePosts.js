import React, { useState, useContext, useEffect } from "react"
import { useQuery } from "@apollo/client"
import { FETCH_POSTS_QUERY } from "../../common/gql_api_def"
import { AuthContext } from "../../context/auth"
import { Dimmer, Loader } from "semantic-ui-react"
import { useInfiniteScroll } from "../../util/hooks"
import { fetchLimit } from "../../util/Constants"
import ListPosts from "../../components/post/ListPosts"

const ListBikePosts = ({ bike }) => {
  //We want to render only as many times as needed; create an object instead of individual fields
  const [postConnection, setPostConnection] = useState({})
  const [isFetching, setIsFetching] = useInfiniteScroll()

  const usertag = bike.bikename
  const { loading, data, fetchMore } = useQuery(FETCH_POSTS_QUERY, {
    variables: { cursor: "", usertag, limit: fetchLimit, type: "bikes" }
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
        variables: { cursor: postConnection.cursor, usertag, limit: fetchLimit, type: "bikes" },
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


  return (
    <>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          <ListPosts posts={postConnection.posts} parentAction={"bikes"} />
        )}
    </>
  )
}

export default ListBikePosts
