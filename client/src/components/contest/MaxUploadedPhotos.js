import React from "react"
import { Modal,Button } from "semantic-ui-react"
import { useLocation } from "react-router-dom"

function MaxUploadedPhotos({ closeModal }) {
  let location = useLocation()
  return (
    <Modal.Content className="warning-modal-content">
      <button className="close-button" onClick={closeModal}>
        <img src="/assets/images/icons/close-red.svg" className="red-color" alt="Close" width="16" height="16" fill="red" />
      </button>
      <h1>Maximum photos uploaded</h1>
      <p>
        You have already uploaded maximum number of photos on this contests
        so can not add more photos on this contests.
      </p>
      <div className="buttons-container">
        <Button type="submit" color="red" onClick={closeModal}>
          Close
        </Button>
      </div>
    </Modal.Content>
  )
}

export default MaxUploadedPhotos
