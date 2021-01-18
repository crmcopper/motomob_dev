import React, { useContext } from "react"
import { Grid } from "semantic-ui-react"
import { AuthContext } from "../../context/auth"
import { FETCH_USER_NOTIFICATIONS, READ_ALL_NOTIFICATION } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"

const ReadAllNotifications = ({ totalNotification }) => {
  const { user } = useContext(AuthContext)

  const [markAllNotification] = useMutation(READ_ALL_NOTIFICATION, {
    variables: { username: user.username },
    update(store, { data }) {
      store.writeQuery({
        query: FETCH_USER_NOTIFICATIONS,
        variables: { username: user.username },
        data: {
          getUserNotifications: { notifications: data.readAllNotification.notifications, notificationsTotal: data.readAllNotification.notificationsTotal }
        }
      })
    }
  })

  return (
    <>
      <Grid columns="equal" padded className="notification-title">
        <Grid.Column>
          <span>
            You have <span className="text-red">{totalNotification}</span> new notifications.
          </span>
        </Grid.Column>
        {totalNotification > 0 && (
          <Grid.Column textAlign="right">
            <span className="text-red pointer " onClick={markAllNotification} >
              Mark all as read
            </span>
          </Grid.Column>
        )}
      </Grid>
    </>
  )
}

export default ReadAllNotifications
