import React, { useState, useEffect } from "react"
import { Button, Form, Dimmer, Loader, Grid } from "semantic-ui-react"
import { FETCH_USERS_QUERY } from "../../common/gql_api_def"
import { useHistory, useLocation } from "react-router-dom"
import { usePrevValue } from "../../util/hooks"
import { useLazyQuery } from "@apollo/client"
import qs from "query-string"
import RiderList from "./RiderList"

const SearchRiders = () => {
  const [searchValue, setSearchValue] = useState("")
  const [ridername, setRidername] = useState()
  const history = useHistory()
  const location = useLocation()
  const prevRidername = usePrevValue(ridername)
  const [searchRiderLazy, { data, loading }] = useLazyQuery(FETCH_USERS_QUERY, {
    variables: { username: searchValue },
    onCompleted: data => {
      if (searchValue) {
        history.push(`/search/1?rider=${encodeURIComponent(searchValue)}`)
      } else {
        history.push(`/search/1`)
      }
      setRidername(searchValue)
    }
  })
  useEffect(() => {
    if (searchValue !== "") {
      searchRider()
    }
  }, [data])

  useEffect(() => {
    if (location && location.search) {
      const riderSearchTerm = qs.parse(location.search)
      if (riderSearchTerm) {
        setSearchValue(decodeURIComponent(riderSearchTerm.rider || ""))
        setRidername(decodeURIComponent(riderSearchTerm.rider || ""))
        if (riderSearchTerm.rider) {
          searchRiderLazy({
            variables: { username: riderSearchTerm.rider }
          })
        }
      }
    }
  }, [location])
  let returnData = ""

  const searchRider = () => {
    if (prevRidername !== searchValue) {
      if (searchValue) {
        history.push(`/search/1?rider=${encodeURIComponent(searchValue)}`)
      } else {
        history.push(`/search/1`)
      }

      if (searchValue) {
        searchRiderLazy({
          variables: { username: searchValue }
        })
      }
      setRidername(searchValue)
    }
  }

  returnData = (
    <>
      <Form onSubmit={searchRider}>
        <div className="search-bar">
          <Form.Input
            placeholder="Type a rider name..."
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
      ) : data && data.getUsers.length === 0 && searchValue ? (
        <h1 className="text-center">hmm... we could not find the riders you were searching for. refine the search, maybe?</h1>
      ) : (
            <>{data && data.getUsers.map(rider => <RiderList riderData={rider} />)}</>
          )}
    </>
  )

  return returnData
}

export default SearchRiders
