import React, { useContext } from "react"
import Navigation from "../layout/Navigation"
import { AuthContext } from "../context/auth"
import EditProfile from "../components/profile/EditProfile"
import { Card, Grid, Dimmer, Loader } from "semantic-ui-react"
import { useQuery } from "@apollo/client"
import { FETCH_USER_QUERY } from "../common/gql_api_def"

const EditProfileDeails = props => {
  const userId = props.match.params.userId
  const { user: loggedInUser } = useContext(AuthContext)
  const { data: { getUser: user = [] } = {}, loading } = useQuery(FETCH_USER_QUERY, {
    variables: { userId }
  })
  return (
    <Navigation>
      {
        <Card fluid className="post-view">
          <Card.Content extra>
            <Grid.Row>
              {loading && (
                <Dimmer active>
                  <Loader />
                </Dimmer>
              )}
              <Grid.Column>
                {!loading && user.hasOwnProperty("id") && loggedInUser && loggedInUser.id === userId ? <EditProfile user={user} /> : ""}
              </Grid.Column>
            </Grid.Row>
          </Card.Content>
        </Card>
      }
    </Navigation>
  )
}

export default EditProfileDeails
