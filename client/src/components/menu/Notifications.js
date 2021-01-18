import React, { useState, useContext, useEffect } from "react"
import { Grid, Dropdown, Item, Menu, Modal } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/auth"
import { FETCH_USER_NOTIFICATIONS } from "../../common/gql_api_def"
import { useQuery } from "@apollo/client"
import NotificationItem from "./NotificationItem"
import ReadAllNotifications from "./ReadAllNotifications"
import NotLoggedInModal from "../contest/NotLoggedInModal"

const Notifications = () => {
  const { user } = useContext(AuthContext)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [totalNotification, setTotalNotification] = useState(0)
  const [notifications, setNotifications] = useState({})

  const { loading, data, error } = useQuery(FETCH_USER_NOTIFICATIONS, {
    variables: { username: user ? user.username : "" },
    skip: user ? false : true
  })

  useEffect(() => {
    if (data && data.getUserNotifications.notifications) {
      setNotifications(data.getUserNotifications.notifications)
      setTotalNotification(data.getUserNotifications.notificationsTotal)
    }
  }, [data])

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  return (
    <>
      {user && notifications ? (
        <Dropdown
          pointing
          className="item align-middle notification-menu"
          icon={
            <>
              <img src="/assets/images/icons/bell.svg" alt="Bell" width="18" height="21" />
              {totalNotification > 0 ? <span className="notification-counter">{totalNotification}</span> : ""}
            </>
          }
        >
          <Dropdown.Menu>
            <ReadAllNotifications totalNotification={totalNotification} />

            <Item.Group>
              {notifications && notifications.length > 0 ? (
                notifications.map(notify => <NotificationItem data={notify} key={notify.id} parentAction="menu" />)
              ) : ""}
            </Item.Group>
            {notifications && notifications.length > 0 && (
              <Grid columns="equal" padded className="notification-title">
                <Grid.Column textAlign="center">
                  <Link to="/notifications" className="text-red">
                    See All Notifications
                  </Link>
                </Grid.Column>
              </Grid>
            )}
          </Dropdown.Menu>
        </Dropdown>
      ) : (
          <Menu.Item
            onClick={() => {
              if (!user) {
                setWarningModalOpen(true)
              }
            }}
          >
            <img src="/assets/images/icons/bell.svg" alt="Bell" width="18" height="21" />
          </Menu.Item>
        )}
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default Notifications
