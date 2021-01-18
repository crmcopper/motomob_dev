import React from "react"
import { Modal } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { URL_SIGN_UP, URL_SIGN_IN, BTN_TEXT_SIGN_UP, BTN_TEXT_SIGN_IN } from "../../util/user-messages"

function NotLoggedInModal({ closeModal }) {
  return (
    <Modal.Content className="warning-modal-content">
      <button className="close-button" onClick={closeModal}>
        <img src="/assets/images/icons/close-red.svg" className="red-color" alt="Close" width="16" height="16" fill="red" />
      </button>
      <h1>{BTN_TEXT_SIGN_IN} or {BTN_TEXT_SIGN_UP}</h1>
      <p>
        Oh Oh! You need to sign in before doing that...
        <br />
        If you don't have an account yet, please sign up.
      </p>
      <div className="buttons-container">
        <Link to={URL_SIGN_UP} className="ui red basic button">
          {BTN_TEXT_SIGN_UP}
        </Link>
        <Link
          to={{
            pathname: `${URL_SIGN_IN}`,
            state: { redirectUrl: window.location.pathname }
          }}
          className="ui red button"
        >
          {BTN_TEXT_SIGN_IN}
        </Link>
      </div>
    </Modal.Content>
  )
}

export default NotLoggedInModal
