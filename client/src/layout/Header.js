import React, { useState } from "react"
import { Responsive } from "semantic-ui-react"
import { Link } from "react-router-dom"
import Lottie from "../util/Lottie"

function Header() {
  const [rightMenu, setRightMenu] = useState(false)
  const rightBartoggle = () => {
    setRightMenu(!rightMenu)
  }

  return (
    <>
      <div className="nav-wrapper">
        <div className="logo-wrapper">
          <Link to="/signin">
            <Responsive minWidth={767}>
              <img src="/assets/images/colored-logo.svg" alt="Coloured Logo" width="83.27" height="46.8" />
            </Responsive>
            <Responsive maxWidth={767}>
              <img src="/assets/images/colored-logo-red-orange.svg" alt="Logo" width="83.269" height="46.796" />
            </Responsive>
          </Link>
        </div>
        <Responsive maxWidth={767} className="d-flex align-items-center pointer" onClick={rightBartoggle}>
          <img src="/assets/images/icons/menu.svg" alt="Menu" width="18" height="14" />
        </Responsive>
        <div className={rightMenu ? "nav-menu show" : "nav-menu"}>
          <a className="nav-item" href="/about.html">
            About
          </a>
          <a className="nav-item" href="https://blog.motomob.me/">
            Blog
          </a>
          <a className="nav-item" href="/investors.html">
            Investors
          </a>
          <a className="nav-item" href="/contact.html">
            Contact
          </a>
        </div>
      </div>
      <Responsive minWidth={767} className="bg-left">
        <h1 className="text-center">MotoMob.me</h1>
        <p className="text-center">bikers only</p>
        <Lottie></Lottie>
      </Responsive>
    </>
  )
}

export default Header
