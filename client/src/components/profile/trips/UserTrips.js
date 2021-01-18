import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { fetchLimit } from "../../../util/Constants"
import { Tab, Dimmer, Loader, Grid, Responsive } from "semantic-ui-react"
import TripList from "./TripList"

const UserTrips = ({ userId }) => {
  return (
    <Tab.Pane attached={false}>
      <Grid verticalAlign="top" columns="equal">
        <Grid.Row className="text-between">
          <Grid.Column textAlign="right">
            <Link to="/post/create/1" className="text-red">
              Add a trip
                </Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <TripList parentAction={"trips"} userId={userId} />
    </Tab.Pane>
  )
}

export default UserTrips
