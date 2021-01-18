import React, { useState, useEffect } from "react"
import { Button, Form, Grid, Dimmer, Loader } from "semantic-ui-react"
import { useHistory, useLocation } from "react-router-dom"
import { FETCH_POSTS_QUERY } from "../../common/gql_api_def"
import { useInfiniteScroll, usePrevValue } from "../../util/hooks"
import { fetchLimit } from "../../util/Constants"
import { useLazyQuery } from "@apollo/client"
import ListPosts from "../../components/post/ListPosts"
import qs from "query-string"

const SearchTrip = () => {
  const [searchValue, setSearchValue] = useState("")
  const [tripname, setTripname] = useState()
  const history = useHistory()
  const location = useLocation()
  const [errors, setErrors] = useState(false)
  const prevTripname = usePrevValue(tripname)
  const [postConnection, setPostConnection] = useState({})
  const [isFetching, setIsFetching] = useInfiniteScroll()

  let returnData = ""

  const [searchTripLasy, { loading, data, error, fetchMore }] = useLazyQuery(FETCH_POSTS_QUERY, {
    variables: { cursor: "", usertag: searchValue, limit: fetchLimit, type: "trips" },
    onCompleted: data => {
      if (searchValue) {
        history.push(`/search/2?location=${encodeURIComponent(searchValue)}`)
      } else {
        history.push(`/search/2`)
      }
      setSearchValue(searchValue)
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].message)
    }
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
        variables: { cursor: postConnection.cursor, usertag: searchValue, limit: fetchLimit, type: "trips" },
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

  useEffect(() => {
    if (location) {
      const locationSearchTerm = qs.parse(location.search)

      setSearchValue(decodeURIComponent(locationSearchTerm.location || ""))
      setTripname(decodeURIComponent(locationSearchTerm.location || ""))
      let locationName = locationSearchTerm.location
      if (locationName) {
        searchTripLasy({
          variables: { cursor: "", usertag: locationName, limit: fetchLimit, type: "trips" }
        })
      }
    }
  }, [location])

  const onSearchTrip = () => {
    if (prevTripname !== searchValue) {
      if (searchValue) {
        history.push(`/search/2?location=${encodeURIComponent(searchValue)}`)
      } else {
        history.push(`/search/2`)
      }

      if (searchValue) {
        searchTripLasy({
          variables: { cursor: "", usertag: searchValue, limit: fetchLimit, type: "trips" }
        })
      }
      setTripname(searchValue)
    }
  }
  returnData = (
    <>
      <Form onSubmit={onSearchTrip}>
        <div className="search-bar">
          <Form.Input
            placeholder="Type a location..."
            name="ridername"
            type="text"
            value={searchValue}
            autoFocus
            onChange={e => {
              setSearchValue(e.target.value)
            }}
          />
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/search-input.svg" alt="Search" width="16" height="16" />
          </span>
        </div>
        {errors && (
          <div className="ui error message" style={{ display: "block" }}>
            <ul className="list">
              <li>{errors}</li>
            </ul>
          </div>
        )}
        <Grid>
          <Grid.Column textAlign="center">
            <Button type="submit" color="red" disabled={searchValue ? false : true}>
              Search
            </Button>
          </Grid.Column>
        </Grid>
      </Form>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : postConnection && postConnection.posts ? (
        <ListPosts posts={postConnection.posts} parentAction={"searchTrips"} />
      ) : searchValue && postConnection.posts ? (
        <h1 className="text-center">hmm... we could not find the trips you were searching for. refine the search, maybe?</h1>
      ) : (
              ""
            )}
    </>
  )

  return returnData
}

export default SearchTrip
