import React, { useState, useContext, useEffect } from "react"
import { Item, Card, Dimmer, Loader } from "semantic-ui-react"
import Navigation from "./Navigation"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../context/auth"
import { notification_fetchLimit } from "../util/Constants"
import { FETCH_USER_ALL_NOTIFICATIONS } from "../common/gql_api_def"
import NotificationItem from "../components/menu/NotificationItem"
import { useInfiniteScroll } from "../util/hooks"

const NotificationsList = () => {
  const { user } = useContext(AuthContext)
  const [notifications, setNotifications] = useState({})
  const [isFetching, setIsFetching] = useInfiniteScroll()
  const usertag = user.username
  const { loading, data, error, fetchMore } = useQuery(FETCH_USER_ALL_NOTIFICATIONS, {
    variables: { cursor: "", usertag, limit: notification_fetchLimit }
  })

  //Initial pull
  useEffect(() => {
    if (data) {
      setNotifications(data.getUserAllNotifications)
    }
  }, [data])

  //subsequent pulls of data
  useEffect(() => {
    if (notifications.cursor && isFetching) {
      fetchMore({
        query: FETCH_USER_ALL_NOTIFICATIONS,
        variables: {
          cursor: notifications.cursor,
          usertag,
          limit: notification_fetchLimit //fetchLimit
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          // Since we have a postConnection object of which one element is replaced (Cursor) and the other
          // extended (posts), lets create a temporary object to set. Rememeber: every setstate rerenders!
          let _updatedNotificationConnection = fetchMoreResult.getUserAllNotifications
          _updatedNotificationConnection.notifications = [...notifications.notifications, ..._updatedNotificationConnection.notifications]
          setNotifications(_updatedNotificationConnection)
        }
      })
    }
  }, [isFetching])
  return (
    <Navigation>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          <>
            <Card fluid className="notifications-view">
              <h1>Notifications</h1>
              <Item.Group>
                {notifications.notifications && notifications.notifications.length > 0 ? (
                  notifications.notifications.map(notify => <NotificationItem data={notify} key={notify.id} parentAction="allNotification" />)
                ) : (
                    <h3>still waiting for a notification...</h3>
                  )}
              </Item.Group>
            </Card>
          </>
        )}
    </Navigation>
  )
}

export default NotificationsList
