import React, { useState, useContext, useEffect } from "react"
import history from "../util/history"
import { Card, Grid, Modal } from "semantic-ui-react"
import ListBikeSlider from "./ListBikeSlider"
import { useQuery } from "@apollo/client"
import { FOLLOW_BIKE_MUTATION, FETCH_USER_FOLLOW_BIKES_QUERY, FETCH_USER_OWN_BIKES_QUERY } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import { AuthContext } from "../../context/auth"
import ListBikePosts from "./ListBikePosts"

import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
const ListBikeName = ({ bike }) => {
  const { user } = useContext(AuthContext)
  const context = useContext(AuthContext)
  const userId = user?.id
  const [follow, setFollow] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)

  const { loading1, data: { getUserFollowBikes: userFollowBikes = {} } = {} } = useQuery(FETCH_USER_FOLLOW_BIKES_QUERY, {
    variables: { userId: userId }
  })

  useEffect(() => {
    if (!!userFollowBikes?.followBikes?.length) {
      const item = userFollowBikes.followBikes.find(item => item.bikeId == bike.id)

      if (item != undefined && Object.keys(item).length > 0) {
        setFollow(true)
      } else {
        setFollow(false)
      }
    }
  }, [userFollowBikes])

  const [followBike, { data, loading }] = useMutation(FOLLOW_BIKE_MUTATION, {
    update(store, { data }) {
      context.login(data.followBike, false)

      store.writeQuery({
        query: FETCH_USER_OWN_BIKES_QUERY,
        variables: { userId: userId },
        data: {
          getUserOwnBikes: [data.followBike.ownBikes]
        }
      })

      store.writeQuery({
        query: FETCH_USER_FOLLOW_BIKES_QUERY,
        variables: { userId: userId },
        data: {
          getUserFollowBikes: [data.followBike.followBikes]
        }
      })
    },
    variables: {
      bikes: [
        {
          bikeId: bike.id,
          bikename: bike.bikename,
          thumbUrl: bike.thumbUrl,
          prodStartYear: bike.prodStartYear
        }
      ]
    }
  })

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }
  function followAction() {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      setFollow(!follow)
      followBike()
    }
  }

  return (
    <>
      <Card fluid className="post-view bike-profile list-bike">
        <span className="svg-icon arrow-left pointer" onClick={() => history.goBack()}>
          <img src="/assets/images/icons/arrow-left.svg" className="align-middle" alt="Arrow" width="17" height="17" />
        </span>
        <Grid verticalAlign="top" columns="equal">
          <Grid.Row>
            <Grid.Column width={10}>
              <p className="text-dark">{bike.bikename}</p>
              <p className="text-light">
                {bike.prodStartYear} {bike.prodEndYear !== "" ? "-" + bike.prodEndYear : ""}
              </p>
            </Grid.Column>
            <Grid.Column textAlign="right">
              {/* <Link className="svg-icon">
                <img src="/assets/images/icons/gray/setting-bike.svg" className="align-middle gray-color" alt="setting" width="17" height="17" />
                <img src="/assets/images/icons/setting-bike.svg" className="align-middle red-color" alt="setting" width="17" height="17" />
              </Link> */}
              <div className="follow-icon d-inline-block">
                {follow ? (
                  <img
                    src="/assets/images/icons/follow-bike.svg"
                    onClick={() => followAction()}
                    className="align-middle red-color"
                    alt="Followers"
                    width="28"
                    height="24"
                  />
                ) : (
                  <img
                    src="/assets/images/icons/gray/follow-bike.svg"
                    onClick={() => followAction()}
                    className="align-middle gray-color"
                    alt="Followers"
                    width="28"
                    height="24"
                  />
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div className="bike-slider">
          <ListBikeSlider images={bike.pictureUrls} />
        </div>
        <div className="bike-details">
          <div className="d-inline-block">
            <span className="svg-icon">
              <img src="/assets/images/icons/gray/followers.svg" className="align-middle" alt="fans" width="16" height="16" />
            </span>{" "}
            <span className="align-middle text-light">34K followers</span>
          </div>
          <div className="d-inline-block">
            <span className="svg-icon">
              <img src="/assets/images/icons/gray/trips.svg" className="align-middle" alt="Trips" width="16" height="16" />
            </span>{" "}
            <span className="align-middle text-light">81 Trips</span>
          </div>
          <div className="d-inline-block">
            <span className="svg-icon">
              <img src="/assets/images/icons/gray/forum.svg" className="align-middle" alt="Forum" width="16" height="16" />
            </span>{" "}
            <span className="align-middle text-light">View forum</span>
          </div>
        </div>
      </Card>
      <ListBikePosts bike={bike} />
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default ListBikeName
