import React from "react"
import history from "../components/util/history"
import { Link } from "react-router-dom"

function GettingStarted() {
  return (
    <div className="login-view">
      <div className="login-layout">
        <div className="nav-wrapper">
          <div className="logo-wrapper">
            <Link to="/signin">
              <img src="assets/images/Colored-Logo-redorange.png" alt="Coloured Logo" />
            </Link>
          </div>
        </div>
        <div className="form-card getting-started">
          <span className="svg-icon arrow-left pointer" onClick={() => history.goBack()}>
            <img src="/assets/images/icons/arrow-left.svg" className="align-middle" alt="Arrow" width="17" height="17" />
          </span>
          <div className="form-container">
            <h3 className="text-center">We are just getting started…</h3>
            <p>The platform is currently in beta testing and registration is available by invitation only. </p>
            <p>
              If you would like to be involved, drop us a line at{" "}
              <a href="mailto:hello@motomob.me?subject=Request for sign in &body=I'd like credentials to log in to MotoMob.me please">hello@motomob.me</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GettingStarted
