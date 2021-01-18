import React, { useState, useEffect } from "react"
import DisplayTripCard from "../../post/DisplayTripCard"
import { Icon, Card } from "semantic-ui-react"
import TripSlide from "./TripSlide";
import { FETCH_USER_TRIP_GROUP_QUERY } from "../../../common/gql_api_def"
import { fetchLimit } from "../../../util/Constants";
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom";
import { useInfiniteScroll } from "../../../util/hooks";
import { Dimmer, Loader, } from "semantic-ui-react"
import SimpleTripList from "./SimpleTripList";

const TripList = ({ parentAction, userId }) => {
  const [tripData, setTripData] = useState([])
  const [postData, setPostData] = useState([])
  const [nextPage, setNextPage] = useState(null)
  const [isFetching, setIsFetching] = useInfiniteScroll()

  const { loading, data, fetchMore } = useQuery(FETCH_USER_TRIP_GROUP_QUERY, {
    variables: { userId: userId, limit: fetchLimit },
    fetchPolicy: "no-cache",
    onCompleted: result => {
      let tripData = result.getOwnTrips
      setNextPage(tripData.nextPage)
      setTripData(tripData.tripGroup)
    }
  })

  //subsequent pulls of data on scroll
  useEffect(() => {
    if (nextPage && isFetching) {
      fetchMore({
        query: FETCH_USER_TRIP_GROUP_QUERY,
        variables: { pageNo: nextPage, userId: userId, limit: fetchLimit },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          let _updatedData = fetchMoreResult.getOwnTrips
          let updatedTrips = [...tripData, ..._updatedData.tripGroup]
          setNextPage(_updatedData.nextPage)
          setTripData(updatedTrips)
        }
      })
    }
  }, [isFetching])

  const deletePost = (id) => {
    fetchMore({
      query: FETCH_USER_TRIP_GROUP_QUERY,
      variables: { pageNo: 1, userId: userId, limit: fetchLimit },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        let _updatedData = fetchMoreResult.getOwnTrips
        setNextPage(_updatedData.nextPage)
        setTripData(_updatedData.tripGroup)
      }
    })
  }
  return (
    loading ? (
      <Dimmer active>
        <Loader />
      </Dimmer>
    ) : (
        <div className="timeline">
          <ul className="timelineCard">
            {tripData.length > 0 && tripData.map((trip, i) => (
              <li key={i}>
                <Icon name="circle" />
                <div>
                  <p>{trip.tripPosts[0].when}</p>
                  <Link to={"/trips/" + userId + "/" + trip.tripName} >
                    <h3>{trip.tripName}</h3>
                  </Link>
                </div>
                {trip.tripPosts.length > 1 ?
                  <TripSlide post={trip.tripPosts} tripName={trip.tripName} parentAction={parentAction} deletePost={deletePost} />
                  :
                  <Card fluid className="post-view fixed-view" >
                    <DisplayTripCard post={trip.tripPosts[0]} parentAction={parentAction} deletePost={deletePost} />
                  </Card>
                }
              </li>
            ))}
            <SimpleTripList parentAction={parentAction} userId={userId} />
          </ul>
        </div>
      )
  )
}

export default TripList
