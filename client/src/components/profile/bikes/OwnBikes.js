import React, { useContext } from "react"
import { Dimmer, Grid, Loader } from "semantic-ui-react"
import AddBike from "../../bike/AddBike"
import { useQuery } from "@apollo/client"
import { FETCH_USER_OWN_BIKES_QUERY } from "../../../common/gql_api_def"
import Bike from "./Bike"
import { AuthContext } from "../../../context/auth"

const OwnBikes = ({ userId, title,username }) => {
  const { loading, data: { getUserOwnBikes: userOwnBikes = {} } = {} } = useQuery(FETCH_USER_OWN_BIKES_QUERY, {
    variables: { userId: userId }
  })
  const { user: loggedInUser } = useContext(AuthContext)

  return (
    <Grid>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          <>
            {!!userOwnBikes?.ownBikes?.length && (
              <>
                {userOwnBikes?.ownBikes.map((ownBike, key) => (
                  <Bike key={key} bike={ownBike} username={username} userId={userId} parentAction="own" />
                ))}
              </>
            )}

            {loggedInUser && loggedInUser.id === userId ? <AddBike title="Own" userId={userId} userBikes={userOwnBikes?.ownBikes} /> : ""}
          </>
        )}
    </Grid>
  )
}

export default OwnBikes
