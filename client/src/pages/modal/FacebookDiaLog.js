import React, { useState, useEffect } from "react"
import FacebookLogin from 'react-facebook-login';
import { Button } from "semantic-ui-react"
import { BTN_TEXT_SIGN_UP_WITH_FB, BTN_TEXT_SIGN_IN_WITH_FB, URL_SIGN_UP } from "../../util/user-messages"
import { useLocation } from "react-router-dom"
require("dotenv").config()

function FacebookModal({ onSigninOrSignup, accessToken }) {
  const [isSignin, setIsSignin] = useState(true)
  const responseFacebook = (response) => {
    if (!response.status && response.status !== "unknown") {
      accessToken(response.accessToken)
      onSigninOrSignup()
    }
  }
  let getlocation = useLocation()

  useEffect(() => {
    if (getlocation.pathname === URL_SIGN_UP) { setIsSignin(false) }
  }, [getlocation.state])
  return (

    <>
      <FacebookLogin
        appId="828328161272860"
        fields="name,email,picture"
        callback={responseFacebook}
        cssClass="btn-facebook btn-register-with ui button"
        icon={<span className="btn-icon"><img src="/assets/images/icons/facebook-icon.svg" alt={isSignin ? BTN_TEXT_SIGN_IN_WITH_FB : BTN_TEXT_SIGN_UP_WITH_FB} width="19.533" height="19.931" /></span>}

        textButton={isSignin ? BTN_TEXT_SIGN_IN_WITH_FB : BTN_TEXT_SIGN_UP_WITH_FB}
        render={renderProps => (
          // <button onClick={renderProps.onClick}>This is my custom FB button</button>
          <Button type="submit" className="btn-facebook btn-register-with" onClick={renderProps.onClick}>
            {isSignin ? BTN_TEXT_SIGN_IN_WITH_FB : BTN_TEXT_SIGN_UP_WITH_FB}
          </Button>
        )}
      />
    </>

  )
}

export default FacebookModal
