import React, { useContext } from "react"
import { Item, Responsive } from "semantic-ui-react"
import { useHistory } from "react-router-dom"
import { AuthContext } from "../../context/auth"
import { READ_NOTIFICATION, FETCH_USER_NOTIFICATIONS } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import moment from "moment"
import ReactHtmlParser from 'react-html-parser'

const NotificationItem = ({ data, parentAction }) => {
  const { user } = useContext(AuthContext)
  const history = useHistory()
  const [readNotification] = useMutation(READ_NOTIFICATION, {
    variables: { notificationId: data.id },
    update(store, { data }) {
      store.writeQuery({
        query: FETCH_USER_NOTIFICATIONS,
        variables: { username: user ? user.username : "" },
        data: {
          getUserNotifications: { notifications: [data.readNotification] }
        }
      })
    }
  })

  const onNotification = item => {
    if (!item.hasActioned) {
      readNotification()
    }
    history.push(data.link)
  }
  let webText
  if (parentAction === "menu") {
    webText = data.message.substring(0, 60)
  } else {
    webText = data.message.substring(0, 185)
  }
  //let mobileText = data.message.substring(0, 60)

  return (
    <>
      <Item key={data.id}
        className={!data.hasActioned ? "unread pointer" : "pointer"}
        onClick={() => {
          onNotification(data)
        }}
      >
        <div className="ui tiny image" >
          <img src={data.avatarUrl} alt="" />
          {!data.hasActioned && <div className="dots"></div>}
        </div>
        <Item.Content >

          <Item.Header >
            {data.actionBy} <span className="text-light">
              <img src="/assets/images/icons/gray/clock_icon.svg" width="12" height="16" className="align-middle" />{' '} {moment(data.createdAt).fromNow(true)} ago</span>
          </Item.Header>

          <Item.Description>{ReactHtmlParser(webText)}</Item.Description>
          {/* <Responsive minWidth={992}>
            <Item.Description>{ReactHtmlParser(webText)}</Item.Description>
          </Responsive>

          <Responsive maxWidth={991}>
            <Item.Description>{ReactHtmlParser(mobileText)}</Item.Description>
          </Responsive> */}

        </Item.Content>
      </Item>
    </>
  )
}

export default NotificationItem
