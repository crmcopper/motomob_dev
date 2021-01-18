import React, { useState } from "react"

import { Modal, Dropdown } from "semantic-ui-react"

import { useHistory } from "react-router-dom"
import CommonPost from "./CommonPost"

function BasicPostModel({ children, post, postNewType, show, handleClose, title, addNewPost, setShowSharePost }) {
  const history = useHistory()
  const [confirmOpen, setConfirmOpen] = useState(addNewPost ? true : false)
  const closePopup = () => {
    setConfirmOpen(false)
    if (setShowSharePost) {
      setShowSharePost(false)
    }
  }
  const onClickSharePost = () => {
    setConfirmOpen(false)
    if (setShowSharePost) {
      setShowSharePost(false)
    }
    if (document.getElementsByClassName('moto-body')) {
      document.getElementsByClassName('moto-body')[0].click()
    }
  }
  return (
    <>
      {!addNewPost && (
        <Dropdown.Item onClick={() => {
          setConfirmOpen(true)
          if (document.getElementsByClassName('moto-body')) {
            document.getElementsByClassName('moto-body')[0].click()
          }
        }}>
          <span className="svg-icon">
            <img
              src="/assets/images/icons/gray/edit-icon.svg"
              className="gray-color"
              alt="Edit"
              width="18"
              height="18"
            />
            <img
              src="/assets/images/icons/edit-icon.svg"
              className="red-color"
              alt="Edit"
              width="18"
              height="18"
            />
          </span> {title}
        </Dropdown.Item>
      )}
      <Modal open={confirmOpen} closeIcon className="create-post-modal" onClose={() => closePopup()} onOpen={() => setConfirmOpen(true)} closeOnDimmerClick={false}>
        <Modal.Content >
          <CommonPost post={post} postType={"BasicPost"} onClickSharePost={onClickSharePost} />
        </Modal.Content>
      </Modal>
    </>
  )

}

export default BasicPostModel
