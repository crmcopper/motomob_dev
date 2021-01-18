import React, { useState, Fragment, useContext, createRef, useEffect } from "react"
import { Container, Menu, Grid, Responsive, Sticky, Ref } from "semantic-ui-react"
import { Link } from "react-router-dom"

import Avatar from "../components/util/Avatar"
import Leftbar from "../components/menu/Leftbar"
import Rightbar from "../components/menu/Rightbar"
import Notifications from "../components/menu/Notifications"
import { AuthContext } from "../context/auth"
import { useHistory, useLocation } from "react-router-dom"
function Navigation({ children, contests = false, createpost = false }) {
  const { user } = useContext(AuthContext)
  const [userProfile, setUserProfile] = useState(false)
  const [rightMenu, setRightMenu] = useState(false)
  const contextRef = createRef()

  const userProfiletoggle = () => {
    setUserProfile(!userProfile)
  }
  const history = useHistory()
  useEffect(() => {
    //debugger
    //console.log('getlocation.state', history.location.pathname)

    // if(history.location.pathname==='/post/create/1'){

    // }
  }, [history])
  const rightBartoggle = () => {
    setRightMenu(!rightMenu)
  }

  return (
    <Fragment>
      <Menu borderless className="header-menu top fixed">
        <Container>
          <Responsive minWidth={992}>
            <Menu.Item as={Link} to={user ? "/" : "/signin"} className="navbar-logo">
              <img src="/assets/images/colored-logo-red-orange.svg" alt="Logo" width="83.269" height="46.796" />
            </Menu.Item>
          </Responsive>
          <Responsive maxWidth={991}>
            {!user ? (
              <Menu.Item as={Link} to={user ? "/" : "/signin"} className="navbar-logo">
                <img src="/assets/images/colored-logo-red-orange.svg" alt="Logo" width="83.269" height="46.796" />
              </Menu.Item>
            ) : !userProfile && !rightMenu ? (
              <Menu.Item as="a" onClick={userProfiletoggle} className="user-pic">
                <Avatar />
              </Menu.Item>
            ) : (
                  ""
                )}
            <div className={userProfile ? "show topbar-mobile" : "topbar-mobile"}>
              <Leftbar userProfiletoggle={userProfiletoggle} />
            </div>
          </Responsive>
          <Menu.Menu position="right">
            {userProfile ? (
              <div className="item-flex">
                <Menu.Item as="a" onClick={userProfiletoggle}>
                  <img src="/assets/images/icons/close.svg" alt="Close" width="19" height="19" />
                </Menu.Item>
              </div>
            ) : rightMenu ? (
              <div className="item-flex">
                <Menu.Item as="a" onClick={rightBartoggle}>
                  <img src="/assets/images/icons/close.svg" alt="Close" width="19" height="19" />
                </Menu.Item>
              </div>
            ) : (
                  <Fragment>
                    {!contests && (
                      <>
                        <h3>{process.env.NODE_ENV === "production" ? "" : "TEST SYSTEM"}</h3>
                        <Responsive maxWidth={991} className="item-flex home-link">
                            <Menu.Item as={Link} to="/">
                              <img src="/assets/images/icons/home.svg" alt="Home" width="20" height="20" />
                            </Menu.Item>
                          </Responsive>
                        <Menu.Item as={Link} to="/search/0">
                          <img src="/assets/images/icons/search.svg" alt="Search" width="20" height="20" />
                        </Menu.Item>

                        <Notifications />
                      </>
                    )}

                    <Responsive maxWidth={991} className="item-flex">
                      <Menu.Item as="a" onClick={rightBartoggle}>
                        <img src="/assets/images/icons/menu.svg" alt="Menu" width="18" height="14" />
                      </Menu.Item>
                    </Responsive>
                  </Fragment>
                )}
            <Responsive maxWidth={991}>
              <div className={rightMenu ? "show topbar-mobile" : "topbar-mobile"}>
                <Rightbar rightBartoggle={rightBartoggle} />
              </div>
            </Responsive>
          </Menu.Menu>
        </Container>
      </Menu>
      <main className={userProfile || rightMenu ? "hide" : ""}>
        {contests || createpost ? (
          <div className="contest-grid">{children}</div>
        ) : (
            <Container>
              <Grid>
                <Ref innerRef={contextRef}>
                  <Grid.Row className="post-container">
                    <Grid.Column className="leftbar">
                      <Responsive minWidth={992}>
                        <Sticky context={contextRef}>
                          <Leftbar />
                        </Sticky>
                      </Responsive>
                    </Grid.Column>
                    <Grid.Column className="postbar">{children}</Grid.Column>
                    <Grid.Column className="rightbar">
                      <Responsive minWidth={992}>
                        <Sticky context={contextRef}>
                          <Rightbar />
                        </Sticky>
                      </Responsive>
                    </Grid.Column>
                  </Grid.Row>
                </Ref>
              </Grid>
            </Container>
          )}
      </main>
    </Fragment>
  )
}

export default Navigation
