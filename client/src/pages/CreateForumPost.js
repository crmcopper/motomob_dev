import React from "react"
import { Card, Header, Grid, Container } from "semantic-ui-react"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import Navigation from "../layout/Navigation"
import { AskQuestion } from "../components/question/AskQuestion"

const CreateForumPost = () => {
  return (
    <Navigation createpost>
      <Container>
        <Grid>
          <Grid.Row className="post-container">
            <Card fluid className="post-view create-post-new">
              <AskQuestion/>
            </Card>
          </Grid.Row>
        </Grid>
      </Container>
    </Navigation>
  )
}
export default CreateForumPost