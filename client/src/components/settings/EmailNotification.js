import React, { useContext } from "react"
import { Card, Grid, Button } from "semantic-ui-react"
import Navigation from "../../layout/Navigation"
import history from "../util/history"
import { AuthContext } from "../../context/auth"
import { FETCH_USER_QUERY } from "../../common/gql_api_def"
import { useQuery } from "@apollo/client"
import EmailType from "./EmailType"
import { EMAIL_APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS, DAILY, WEEKLY, OFF, EMAIL_NOTIFICATION_TEXT } from "../../util/user-messages"


const EmailNotification = () => {

  const signinuser = useContext(AuthContext)

  const { data: { getUser: user = [] } = {} } = useQuery(FETCH_USER_QUERY, {
    variables: { userId: signinuser.user.id }
  })


  return (

    <Navigation>
      { signinuser && (
        <Card fluid className="post-view setting-view">
          <span className="svg-icon arrow-left pointer" >
            <img src="/assets/images/icons/arrow-left.svg" className="align-middle" alt="Arrow" width="17" height="17" onClick={() => history.goBack()} />
          </span>
          <Card.Content extra>
            <h1>Settings <img src="/assets/images/icons/arrow-black.svg" className="align-middle" alt="Arrow" width="16" height="16" /> <span>{EMAIL_NOTIFICATIONS}</span></h1>
            <p>{EMAIL_NOTIFICATION_TEXT} </p>
            <Grid columns='equal' verticalAlign='middle'>
              <Grid.Column floated='left' mobile={16} tablet={8} computer={8}>
                <p>{EMAIL_APP_NOTIFICATIONS}</p>
              </Grid.Column>
              <Grid.Column floated='right' textAlign='right' mobile={16} tablet={8} computer={8}>
                <Button.Group>
                  <EmailType type="daily" userId={user.id} label={DAILY} isActive={user.notificationFrequency} />
                  <EmailType type="weekly" userId={user.id} label={WEEKLY} isActive={user.notificationFrequency} />
                  <EmailType type="off" userId={user.id} label={OFF} isActive={user.notificationFrequency} />

                </Button.Group>
              </Grid.Column>
            </Grid>
          </Card.Content>
        </Card>
      )}
    </Navigation>


  )
}

export default EmailNotification
