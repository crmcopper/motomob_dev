import React, { useState, useEffect } from "react"
import DisplayTripCard from "../../post/DisplayTripCard"
import { Icon, Card } from "semantic-ui-react"
import { FETCH_TRIP_BY_NAME_QUERY } from "../../../common/gql_api_def"
import { fetchLimit } from "../../../util/Constants";
import { useQuery } from "@apollo/client"
import { useInfiniteScroll } from "../../../util/hooks";

const SimpleTripList = ({ parentAction, userId }) => {
  const [postData, setPostData] = useState([])
  const [nextPage, setNextPage] = useState(null)
  const [isFetching, setIsFetching] = useInfiniteScroll()

  const { loading, data, fetchMore } = useQuery(FETCH_TRIP_BY_NAME_QUERY, {
    variables: { pageNo: 1, userId: userId, limit: fetchLimit, tripName: "" },
    fetchPolicy: "no-cache",
    onCompleted: data => {
      let postData = data.getPostsByTripName
      setNextPage(postData.nextPage)
      setPostData(postData.posts)
    }
  })

  //subsequent pulls of data on scroll
  useEffect(() => {
    if (nextPage && isFetching) {
      fetchMore({
        query: FETCH_TRIP_BY_NAME_QUERY,
        variables: { pageNo: nextPage, userId: userId, limit: fetchLimit, tripName: "" },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          let _updatedData = fetchMoreResult.getPostsByTripName
          let updatedPosts = [...postData, ..._updatedData.posts]
          setNextPage(_updatedData.nextPage)
          setPostData(updatedPosts)
        }
      })
    }
  }, [isFetching])

  const deletePost = id => {
    let data = postData
    let filterdata = data.filter(item => item.id !== id)
    setPostData(filterdata)
  }
  return (
    postData.length > 0 && postData.map((post, i) => (
      <li key={i}>
        <Icon name="circle" />
        <div>
          <p>{post.when}</p>
          <h3></h3>
        </div>
        <Card fluid className="post-view fixed-view" >
          <DisplayTripCard post={post} parentAction={parentAction} deletePost={deletePost} />
        </Card>
      </li>
    )
    ))
}

export default SimpleTripList