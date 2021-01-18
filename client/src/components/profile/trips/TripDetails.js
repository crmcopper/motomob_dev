import React, { useCallback, useContext, useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { FETCH_TRIP_BY_NAME_QUERY, FETCH_USER_QUERY } from "../../../common/gql_api_def"
import { fetchLimit, } from "../../../util/Constants"
import { Dimmer, Loader, Card, Icon, } from "semantic-ui-react"
import Navigation from "../../../layout/Navigation"
import { AuthContext } from "../../../context/auth"
import DisplayTripCard from "../../post/DisplayTripCard"
import { useInfiniteScroll } from "../../../util/hooks"
import TripCover from "./TripCover"

function TripDetails(props) {
  const [postConnection, setPostConnection] = useState([])
  const [nextPage, setNextPage] = useState(null)
  const [isFetching, setIsFetching] = useInfiniteScroll()
  const tripName = props.match.params.tripName
  const userId = props.match.params.userId
 
  const { data: { getUser: user = [] } = {} } = useQuery(FETCH_USER_QUERY, {
    variables: { userId: userId }
  })

  const { loading, data, fetchMore } = useQuery(FETCH_TRIP_BY_NAME_QUERY, {
    variables: { pageNo: 1, userId: userId, limit: fetchLimit, tripName: tripName },
    fetchPolicy: "no-cache",
    onCompleted: data => {
      let postData = data.getPostsByTripName
      setNextPage(postData.nextPage)
      setPostConnection(postData.posts)
    }
  })

  const deletePost = id => {
    let data = postConnection
    let filterdata = data.filter(item => item.id !== id)
    setPostConnection(filterdata)
  }

  //subsequent pulls of data on scroll
  useEffect(() => {
    if (nextPage && isFetching) {
      fetchMore({
        query: FETCH_TRIP_BY_NAME_QUERY,
        variables: { pageNo: nextPage, userId: userId, limit: fetchLimit, tripName: tripName },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          let _updatedData = fetchMoreResult.getPostsByTripName
          let updatedPosts = [...postConnection, ..._updatedData.posts]
          setNextPage(_updatedData.nextPage)
          setPostConnection(updatedPosts)
        }
      })
    }
  }, [isFetching])

  return (
    <Navigation>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          <>
            <TripCover tripName={tripName} UserDetails={user} />
            <div className="timeline">
              <ul className="timelineCard">
                {postConnection.map((post, i) => (
                  <li key={i}><Icon name="circle" /><div><p>{post.when}</p></div>
                    <Card fluid className="post-view fixed-view" >
                      <DisplayTripCard post={post} parentAction={"trips"} deletePost={deletePost} />
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )
      }
    </Navigation >
  )
}

export default TripDetails