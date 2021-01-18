import React, { Component, useContext } from "react"
import { Menu, Image } from "semantic-ui-react"
import { Link } from "react-router-dom"

import { AuthContext } from "../../context/auth"

const Rightbar = ({ rightBartoggle }) => {
  const { user } = useContext(AuthContext)

  const closeMenuInMobile = () => {
    let element = document.querySelector(".topbar-mobile")
    if (element) {
      if (rightBartoggle) {
        rightBartoggle()
      }
    }
  }

  return (
    <div className="profile-view">
      <Menu text vertical>
        <Menu.Item as={Link} to="/" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/home.svg" className="gray-color" alt="Home" width="20" height="20" />
            <img src="/assets/images/icons/home.svg" className="red-color" alt="Home" width="20" height="20" />
          </span>
          <span className="item-text">Home</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/search/0" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/bikes.svg" className="gray-color" alt="Bikes" width="24" height="14" />
            <img src="/assets/images/icons/bikes.svg" className="red-color" alt="Bikes" width="24" height="14" />
          </span>
          <span className="item-text">Bikes</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/search/1" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/helmet.svg" className="gray-color" alt="Bikes" width="24" height="14" />
            <img src="/assets/images/icons/helmet.svg" className="red-color" alt="Bikes" width="24" height="14" />
          </span>
          <span className="item-text">Riders</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/search/2" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/trips.svg" className="gray-color" alt="Trips" width="20" height="20" />
            <img src="/assets/images/icons/trips.svg" className="red-color" alt="Trips" width="20" height="20" />
          </span>
          <span className="item-text">Trips</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/forum" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/forum.svg" className="gray-color" alt="Forum" width="20" height="20" />
            <img src="/assets/images/icons/forum.svg" className="red-color" alt="Forum" width="20" height="20" />
          </span>
          <span className="item-text">Forum</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/coming-soon" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/marketplace.svg" className="gray-color" alt="Marketplace" width="18" height="16" />
            <img src="/assets/images/icons/marketplace.svg" className="red-color" alt="Marketplace" width="18" height="16" />
          </span>
          <span className="item-text">Marketplace</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/coming-soon" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/events.svg" className="gray-color" alt="Events" width="18" height="20" />
            <img src="/assets/images/icons/events.svg" className="red-color" alt="Events" width="18" height="20" />
          </span>
          <span className="item-text">Events</span>
        </Menu.Item>
        {/* <Menu.Item as={Link} to="/coming-soon" onClick={()=>closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/business.svg" className="gray-color" alt="Business / Shops" width="20" height="18" />
            <img src="/assets/images/icons/business.svg" className="red-color" alt="Business / Shops" width="20" height="18" />
          </span>
          <span className="item-text">Business / Shops</span>
        </Menu.Item> */}
        <Menu.Item as={Link} to="/photo-contests" onClick={() => closeMenuInMobile()}>
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/camera.svg" className="gray-color" alt="Contests" width="20" height="18" />
            <img src="/assets/images/icons/camera.svg" className="red-color" alt="Contests" width="20" height="18" />
          </span>
          <span className="item-text">Photo Contests</span>
        </Menu.Item>
      </Menu>
      {/* {user ? <Feedback /> : ""} */}
     {/*  <div className="advt-bx">
        <Link to="/post-competition"><Image src='/assets/images/post-comp.png' fluid alt="Post Advt" /></Link>
      </div> */}
    </div>
  )
}

export default Rightbar
