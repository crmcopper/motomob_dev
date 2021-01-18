import React, { useContext } from "react"
import { Dimmer, Dropdown, Grid, Image, Loader } from "semantic-ui-react"
import { DELETE_USER_BIKE, FETCH_USER_OWN_BIKES_QUERY, FETCH_USER_FOLLOW_BIKES_QUERY } from "../../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import { Link } from "react-router-dom"
import { AuthContext } from "../../../context/auth"
const Bike = ({ userId, bike, parentAction, username }) => {
  const { user } = useContext(AuthContext)
  const context = useContext(AuthContext)

  const [remove, { loading }] = useMutation(DELETE_USER_BIKE, {
    update(store, { data }) {
      if (data && data.deleteUserBike !== undefined) {
        context.login(data.deleteUserBike, false)
      }

      store.writeQuery({
        query: FETCH_USER_OWN_BIKES_QUERY,
        variables: { userId: userId },
        data: {
          getUserOwnBikes: [data.deleteUserBike.ownBikes]
        }
      })

      store.writeQuery({
        query: FETCH_USER_FOLLOW_BIKES_QUERY,
        variables: { userId: userId },
        data: {
          getUserFollowBikes: [data.deleteUserBike.followBikes]
        }
      })
    },
    variables: { userId: userId, bikeId: bike.bikeId, type: parentAction }
  })

  const removeBike = () => {
    remove()
  }

  return (
    <Grid.Column mobile={16} tablet={8} computer={8}>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
        <>
          <div className="own-img-bx">
            <Link to={"/bike/" + bike.bikeId}>
              <Image src={bike.thumbUrl} alt={bike.bikename} size="big" />
            </Link>
          </div>
          <Grid verticalAlign="top" columns="equal">
            <Grid.Row>
              <Grid.Column width={12}>
                <Link to={"/bike/" + bike.bikeId} className="text-dark">
                  {bike.bikename}
                </Link>
                {bike?.prodStartYear && <p className="text-light">Year {bike.prodStartYear}</p>}
              </Grid.Column>
              {user && user.username === username && (
                <Grid.Column textAlign="right">
                  <Dropdown
                    pointing
                    className="link item"
                    icon={
                      <span className="svg-icon">
                        <img src="/assets/images/icons/gray/dots.svg" className="gray-color" alt="More Horizontal" width="20" height="28" />
                        <img src="/assets/images/icons/dots.svg" className="red-color" alt="More Horizontal" width="20" height="28" />
                      </span>
                    }
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={removeBike}>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Grid.Column>
              )}
            </Grid.Row>
          </Grid>
        </>
      )}
    </Grid.Column>
  )
}

export default Bike
