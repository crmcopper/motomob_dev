import React, { useContext } from "react"
import { useQuery } from "@apollo/client"
import { FETCH_USER_FOLLOW_BIKES_QUERY } from "../../../common/gql_api_def"
import { Dimmer, Grid, Loader } from "semantic-ui-react"
import Bike from "./Bike";
import AddBike from "../../bike/AddBike"
import { AuthContext } from "../../../context/auth"

const FollowBikes = ({ userId, title ,username }) => {
  const { loading, data: { getUserFollowBikes: userFollowBikes = {} } = {} } = useQuery(FETCH_USER_FOLLOW_BIKES_QUERY, {
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
            {!!userFollowBikes?.followBikes?.length && (
              <>
                {userFollowBikes?.followBikes.map((followBike, key) => (
                  <Bike key={key} bike={followBike} username={username} userId={userId} parentAction="follow" />
                ))}
              </>
            )}

            {loggedInUser && loggedInUser.id === userId ? <AddBike title="Follow" userId={userId} userBikes={userFollowBikes?.followBikes} /> : ""}
          </>
        )}
    </Grid>
  )
}

export default FollowBikes
