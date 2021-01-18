import React from "react"
import { Form, Button } from "semantic-ui-react"

function ThanksModal({ userEmail, props, hasAction }) {
  return (
    <>
      {hasAction !== "forgotPassword" ? (
        <div className="form-bx">
          <div className="d-flex align-items-center thank-you">
            <Form noValidate>
              <h1 className="text-center">
                {" "}
                <img src="/assets/images/icons/gift-icon.svg" alt="Gift" width="36" height="36" /> Thank you for registering with us!
              </h1>
              <p>We just emailed a magic link to {userEmail}.</p>
              <p>Not received the email?</p>
              <ol>
                <li>Please check your spam/junk folder</li>
                <li>Is your email address correct? If not, create a new account with the correct email address</li>
              </ol>
              <Button
                type="submit"
                color="red"
                size="small"
                onClick={e => {
                  e.preventDefault()
                  //not verified: redirect to signiny page
                  props.history.push("/signin")
                }}
              >
                Back to Sign In
              </Button>
            </Form>
          </div>
        </div>
      ) : (
        <div className="form-bx">
          <div className="d-flex align-items-center thank-you">
            <Form noValidate>
              <h1 className="text-center"> You are almost there...</h1>
              <p>We just emailed a magic link to {userEmail}.</p>
              <p>Not received the email?</p>
              <ol>
                <li>Please check your spam/junk folder</li>
                <li>Is your email address correct? If not, create a new account with the correct email address</li>
              </ol>
              <Button
                type="submit"
                color="red"
                size="tiny"
                onClick={e => {
                  e.preventDefault()
                  //not verified: redirect to signiny page
                  props.history.push("/signin")
                }}
              >
                Ok
              </Button>
            </Form>
          </div>
        </div>
      )}
    </>
  )
}

export default ThanksModal
