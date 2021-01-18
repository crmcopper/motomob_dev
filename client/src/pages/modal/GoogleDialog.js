import React, { useState, useEffect } from "react"
import GoogleLogin from "react-google-login"
import { Button } from "semantic-ui-react"
import { BTN_TEXT_SIGN_IN_WITH_GOOGLE, URL_SIGN_UP } from "../../util/user-messages"
import { useLocation } from "react-router-dom"
require("dotenv").config()

function GoogleDialog({ onSigninOrSignup, accessToken }) {
  const [isSignin, setIsSignin] = useState(true)
  const responseGoogle = response => {
    if (!response.error && response.error !== "popup_closed_by_user") {
      accessToken(response.accessToken)
      onSigninOrSignup()
    }
  }
  let getlocation = useLocation()
  useEffect(() => {
    if (getlocation.pathname === URL_SIGN_UP) {
      setIsSignin(false)
    }
  }, [getlocation.state])
  //  console.log('isSignin', isSignin)
  return (
    <>
      {isSignin ? (
        <GoogleLogin
          clientId="695500836072-aa35ppon8ohsdhjm6hevrvkjj89g9mvm.apps.googleusercontent.com"
          render={renderProps => (
            <Button type="submit" onClick={renderProps.onClick} disabled={renderProps.disabled} className="btn-google btn-register-with">
              <span className="btn-icon">
                <img src="/assets/images/icons/google-icon.svg" alt={BTN_TEXT_SIGN_IN_WITH_GOOGLE} width="19.533" height="19.931" />
              </span>
              {BTN_TEXT_SIGN_IN_WITH_GOOGLE}
            </Button>
          )}
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
      ) : (
          <GoogleLogin
            clientId="695500836072-aa35ppon8ohsdhjm6hevrvkjj89g9mvm.apps.googleusercontent.com"
            render={renderProps => (
              <Button type="submit" onClick={renderProps.onClick} disabled={renderProps.disabled} className="btn-google btn-register-with">
                <span className="btn-icon">
                  <img src="/assets/images/icons/google-icon.svg" alt="Sign up with google" width="19.533" height="19.931" />
                </span>
              Sign up with Google
              </Button>
            )}
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={"single_host_origin"}
          />
        )}
    </>
  )
}

export default GoogleDialog
