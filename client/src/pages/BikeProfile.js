import React from "react"
import { Dimmer, Loader } from "semantic-ui-react"
import Navigation from "../layout/Navigation"
import ListBikeName from "../components/bike/ListBikeName"
import { FETCH_BIKE_QUERY } from "../common/gql_api_def"
import { useQuery } from "@apollo/client"

const BikeProfile = (props) => {
  const bikeId = props.match.params.bikeId ? props.match.params.bikeId : ""
  const { loading, data: { getBike: bike = [] } = {} } = useQuery(
    FETCH_BIKE_QUERY,
    {
      variables: { bikeId },
    }
  )
  return (
    <>
      <Navigation>
        {loading ? (
          <Dimmer active>
            <Loader />
          </Dimmer>
        ) : (
          <>
            {bike.length === 0 && <p>No Result found...</p>}
            {bike.length !== 0 && <ListBikeName bike={bike} />}
          </>
        )}
      </Navigation>
    </>
  )
}

export default BikeProfile
