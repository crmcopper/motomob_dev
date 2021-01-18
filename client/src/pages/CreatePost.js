import React, { useState, useEffect } from "react"
import Navigation from "../layout/Navigation"
import { Card, Container, Grid } from "semantic-ui-react"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import CommonPosts from "../components/post/CommonPost"
import { GA_Track } from "../util/google-analytics"

const CommonPost = props => {
  GA_Track(window.location.href)

  const [tabIndex, setTabIndex] = useState("BikePost")
  const tab = props.match.params.tab ? props.match.params.tab : 0

  useEffect(() => {
    if (tab === "1") {
      setTabIndex("TripPost")
    } else {
      setTabIndex("BikePost")
    }
  }, [tab])

  return (
    <Navigation createpost>
      <Container>
        <Grid>
          <Grid.Row className="post-container">
            <Card fluid className="post-view create-post-new">
              <CommonPosts postType={tabIndex} tabIndex={tabIndex} />
            </Card>
          </Grid.Row>
        </Grid>
      </Container>
    </Navigation>
  )
}

export default CommonPost
