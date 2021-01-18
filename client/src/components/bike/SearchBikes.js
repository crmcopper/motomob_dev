import React, { useState, useEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { Button, Form, Grid } from "semantic-ui-react"
import qs from "query-string"

import { useInfiniteScroll, usePrevValue } from "../../util/hooks"
import { useLazyQuery } from "@apollo/client"
import { FETCH_BIKES_QUERY } from "../../common/gql_api_def"
import { fetchLimit } from "../../util/Constants"
import ListBikes from "./ListBikes"
import FeaturedBikes from "../../pages/static/FeaturedBikes"

export const SearchBikes = ({ }) => {
  const history = useHistory()
  const location = useLocation()
  const [bikename, setBikename] = useState()
  const [tempName, setTempName] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [isFetching, setIsFetching] = useInfiniteScroll()
  const [bikesData, setBikesData] = useState([])
  const [paginateObj, setPaginateObj] = useState({})
  const [completedFlag, setCompletedFlag] = useState(false)
  const prevBikename = usePrevValue(bikename)

  const [getBikesLazy, { loading, data, error, fetchMore }] = useLazyQuery(FETCH_BIKES_QUERY, {
    variables: { first: fetchLimit, after: null, search: bikename },
    onCompleted: () => {
      setCompletedFlag(true)
    }
  })

  useEffect(() => {
    if (paginateObj.hasNextPage && isFetching && !loading) {
      if (bikename && bikename.length > 0) {
        fetchMore({
          query: FETCH_BIKES_QUERY,
          variables: {
            first: fetchLimit,
            after: paginateObj.endCursor,
            search: bikename
          },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            let endCursor = fetchMoreResult && fetchMoreResult.getBikes.pageInfo.endCursor
            let hasNextPage = fetchMoreResult && fetchMoreResult.getBikes.pageInfo.hasNextPage
            setPaginateObj({ first: fetchLimit, endCursor, hasNextPage })
            let latestBikeData = (fetchMoreResult.getBikes.edges || []).map(edge => {
              return edge.node
            })
            setBikesData(prevBikesData => [...prevBikesData, ...latestBikeData])
          }
        })
      }
    }
  }, [isFetching])

  useEffect(() => {
    if (data) {
      let latestBikeData = (data.getBikes.edges || []).map(edge => {
        return edge.node
      })
      let endCursor = data && data.getBikes.pageInfo.endCursor
      let hasNextPage = data && data.getBikes.pageInfo.hasNextPage

      setIsFetching(false)
      setPaginateObj({ first: fetchLimit, endCursor, hasNextPage })
      setBikesData(latestBikeData)
      setTempName(searchValue)
    }
  }, [data])

  // OnLoad Initial Page
  useEffect(() => {
    if (location && location.search) {
      const bikeSearchTerm = qs.parse(location.search)
      const decodedTerm = decodeURIComponent(bikeSearchTerm.bike || "")
      getBikesLazy({
        variables: {
          first: fetchLimit,
          after: paginateObj.endCursor,
          search: decodedTerm
        }
      })
      setSearchValue(decodedTerm)
      setBikename(decodedTerm)
      setTempName(decodedTerm)
    }
  }, [])

  const searchBike = () => {
    if (prevBikename !== searchValue) {
      setBikesData([])
      setPaginateObj({ first: fetchLimit })
      if (searchValue) {
        //    console.log(encodeURIComponent(searchValue))

        history.push(`/search/0?bike=${encodeURIComponent(searchValue)}`)
      } else {
        history.push(`/search/0`)
      }

      if (searchValue) {
        getBikesLazy({
          variables: {
            first: fetchLimit,
            after: null,
            search: searchValue
          }
        })
      }
      setBikename(searchValue)
      setTempName(searchValue)
    }
  }

  return (
    <div>
      <Form onSubmit={searchBike}>
        <div className="search-bar">
          <Form.Input
            placeholder="Type a bike name..."
            name="bikename"
            type="text"
            autoFocus
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value)
            }}
          />
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/search-input.svg" alt="Search" width="16" height="16" />
          </span>
        </div>
        <Grid>
          <Grid.Column textAlign="center">
            <Button type="submit" color="red" disabled={searchValue ? false : true}>
              Search
            </Button>
          </Grid.Column>
        </Grid>
      </Form>
      {!loading && tempName.length == 0 ? (
        <FeaturedBikes />
      ) : !loading && bikesData.length == 0 && tempName.length > 0 ? (
        <h1 className="text-center">hmm... we could not find the bike you were searching for. refine the search, maybe?</h1>
      ) : (
            <ListBikes bikes={bikesData} loading={loading} isFetching={isFetching} />
          )}
    </div>
  )
}
