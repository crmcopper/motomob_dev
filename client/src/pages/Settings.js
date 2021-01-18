import React, { useContext } from "react"
import { Card, Menu } from "semantic-ui-react"
import Navigation from "../layout/Navigation"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { EMAIL_NOTIFICATIONS, AGREEMENTS } from "../util/user-messages"

const Settings = () => {
  const signinuser = useContext(AuthContext)
  return (
    <Navigation>
      {signinuser && (
        <Card fluid className="post-view setting-view">
          <h1>Settings</h1>
          <Menu text vertical>
            <Menu.Item as={Link} to="/settings/email-notification">
              <span className="item-text">{EMAIL_NOTIFICATIONS}</span>
              <span className="svg-icon"> <img src="/assets/images/icons/arrow.svg" className="align-middle" alt="Arrow" width="15" height="15" /></span>
            </Menu.Item>
            <Menu.Item as={Link} to="/settings/agreements">
              <span className="item-text">{AGREEMENTS}</span>
              <span className="svg-icon"> <img src="/assets/images/icons/arrow.svg" className="align-middle" alt="Arrow" width="15" height="15" /></span>
            </Menu.Item>
          </Menu>

        </Card>
      )}
    </Navigation>
  )
}

export default Settings
