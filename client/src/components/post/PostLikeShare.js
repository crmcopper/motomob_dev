import React from "react"
import { LIKE, SAVE, SHARE, } from "../../util/user-messages"


function PostLikeShare({ liked, follow, likeAction, saveAction, openShareModal }) {
  return (
    <div className="d-flex justify-content-between">
      <div className="post-like-share">
        {liked ? (
          <>
            <span className="svg-icon pointer align-middle" onClick={() => likeAction()}>
              <img src="/assets/images/icons/heart.svg" className="gray-color align-middle" alt="Heart" width="20" height="20" />
              <img src="/assets/images/icons/heart.svg" className="red-color align-middle" alt="Heart" width="20" height="20" />
              <span className="align-middle">{LIKE}</span>
            </span>
          </>
        ) : (
            <>
              <span className="svg-icon pointer align-middle" onClick={() => likeAction()}>
                <img src="/assets/images/icons/gray/heart.svg" className="gray-color align-middle" alt="Heart" width="20" height="20" />
                <img src="/assets/images/icons/gray/heart.svg" className="red-color align-middle" alt="Heart" width="20" height="20" />
                <span className="align-middle">{LIKE}</span>
              </span>
            </>
          )}

        {follow ? (
          <span className="svg-icon pointer align-middle " onClick={() => saveAction()} >
            <img src="/assets/images/icons/save-icon.svg" className="gray-color  align-middle" alt="Like" width="20" height="20" />
            <img src="/assets/images/icons/save-icon.svg" className="red-color align-middle" alt="Like" width="20" height="20" />
            <span className="align-middle">{SAVE}</span>
          </span>
        ) : (
            <span className="svg-icon pointer align-middle" onClick={() => saveAction()}>
              <img src="/assets/images/icons/gray/save-icon.svg" className="gray-color  align-middle" alt="Like" width="20" height="20" />
              <img src="/assets/images/icons/gray/save-icon.svg" className="red-color align-middle" alt="Like" width="20" height="20" />
              <span className="align-middle">{SAVE}</span>
            </span>
          )}
        <span className="svg-icon pointer" onClick={openShareModal}>
          <img src="/assets/images/icons/gray/share-with.svg" className="gray-color align-middle" alt="Share" width="20" height="20" />
          <img src="/assets/images/icons/share-with.svg" className="red-color align-middle" alt="Share" width="20" height="20" />
          <span className="align-middle">{SHARE}</span></span>
      </div>
    </div>
  )
}

export default PostLikeShare
