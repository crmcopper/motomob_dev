import React, { useContext } from "react"
import { Menu, Header } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { Feedback } from "../util/Feedback"
import { AuthContext } from "../../context/auth"
import { URL_SIGN_IN, BTN_TEXT_SIGN_IN, BTN_TEXT_SIGN_OUT } from "../../util/user-messages"
import Avatar from "../util/Avatar"
import { useHistory } from "react-router-dom"

function Leftbar({ userProfiletoggle }) {
  const { user, logout } = useContext(AuthContext)
  const history = useHistory()

  const closeLeftMenuInMobile = () => {
    let element = document.querySelector(".topbar-mobile")
    if (element) {
      if (userProfiletoggle) {
        userProfiletoggle()
      }
    }
  }

  return (
    <div className="profile-view">
      {user && (
        <Header as="h4" image>
          <Avatar />
          <Header.Content>
            {user.username}
            <Header.Subheader>
              <Link className="link" to={`/profile/${user.id}`} onClick={() => closeLeftMenuInMobile()}>
                See profile
              </Link>
            </Header.Subheader>
          </Header.Content>
        </Header>
      )}
      <Menu text vertical>
        <Menu.Item as={Link} to={user ? `/profile/${user?.id}/1` : "/signin"} onClick={() => closeLeftMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/bikes.svg" className="gray-color" alt="My bikes" width="24" height="14" />
            <img src="/assets/images/icons/bikes.svg" className="red-color" alt="My bikes" width="24" height="14" />
          </span>
          <span className="item-text">My bikes</span>
        </Menu.Item>
        <Menu.Item as={Link} to={user ? `/profile/${user?.id}/2` : "/signin"} onClick={() => closeLeftMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/trips.svg" className="gray-color" alt="My trips" width="20" height="20" />
            <img src="/assets/images/icons/trips.svg" className="red-color" alt="My trips" width="20" height="20" />
          </span>
          <span className="item-text">My trips</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/coming-soon" onClick={() => closeLeftMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/followers.svg" className="gray-color" alt="Followers" width="20" height="20" />
            <img src="/assets/images/icons/followers.svg" className="red-color" alt="Followers" width="20" height="20" />
          </span>
          <span className="item-text">Followers</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/coming-soon" onClick={() => closeLeftMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/ad-verts.svg" className="gray-color" alt="Adverts" width="18" height="20" />
            <img src="/assets/images/icons/ad-verts.svg" className="red-color" alt="Adverts" width="18" height="20" />
          </span>
          <span className="item-text">Adverts</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/coming-soon" onClick={() => closeLeftMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/history.svg" className="gray-color" alt="History" width="21" height="18" />
            <img src="/assets/images/icons/history.svg" className="red-color" alt="History" width="21" height="18" />
          </span>
          <span className="item-text">History</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/settings" onClick={() => closeLeftMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/settings.svg" className="gray-color" alt="Settings" width="20" height="20" />
            <img src="/assets/images/icons/settings.svg" className="red-color" alt="Settings" width="20" height="20" />
          </span>
          <span className="item-text">Settings</span>
        </Menu.Item>
        {user ? (
          <>
            <Menu.Item
              as={Link}
              to="/"
              onClick={() => {
                closeLeftMenuInMobile()
                logout()
                history.push("/")
              }}
            >
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/signin.svg" className="gray-color" alt={BTN_TEXT_SIGN_OUT} width="19.454" height="20" />
                <img src="/assets/images/icons/signin.svg" className="red-color" alt={BTN_TEXT_SIGN_OUT} width="19.454" height="20" />
              </span>
              <span className="item-text">{BTN_TEXT_SIGN_OUT}</span>
            </Menu.Item>
          </>
        ) : (
          <Menu.Item
            as={Link}
            to={URL_SIGN_IN}
            onClick={() => {
              closeLeftMenuInMobile()
              history.push({ URL_SIGN_IN })
            }}
          >
            <span className="svg-icon">
              <img src="/assets/images/icons/gray/logout.svg" className="gray-color" alt="Log in" width="19.454" height="20" />
              <img src="/assets/images/icons/logout.svg" className="red-color" alt="Log in" width="19.454" height="20" />
            </span>
            <span className="item-text">{BTN_TEXT_SIGN_IN}</span>
          </Menu.Item>
        )}
      </Menu>
      {user ? <Feedback /> : ""}
    </div>
  )
}

export default Leftbar
