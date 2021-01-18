import React, { useState } from "react"
import { useMutation } from "@apollo/client"
import { Confirm, Dropdown } from "semantic-ui-react"

import { DELETE_COMMENT_MUTATION, FETCH_POST_COMMENTS_QUERY, FETCH_POST_QUERY } from "../../common/gql_api_def"

function DeleteComment({ postId, commentId, replyToId, deleteContent }) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    update(store, { data }) {
      setConfirmOpen(false)
      if (postId && commentId) {

        store.writeQuery({
          query: FETCH_POST_COMMENTS_QUERY,
          variables: { postId },
          data: {
            getPostComments: data.deleteComment.comment
          }
        })

        store.writeQuery({
          query: FETCH_POST_QUERY,
          variables: { postId },
          data: data.deleteComment.post
        })

        if (document.getElementsByClassName('active visible edit-delete-comment')) {
          document.getElementsByClassName('active visible edit-delete-comment')[0].click()
        }

      }
    },
    variables: {
      commentId,
      replyToId
    }
  })
  return (
    <>
      <Dropdown.Item onClick={() => setConfirmOpen(true)}>
        <span className="svg-icon">
          <img
            src="/assets/images/icons/gray/remove-icon.svg"
            className="gray-color"
            alt="Delete"
            width="16"
            height="16"
          />
          <img
            src="/assets/images/icons/remove-icon.svg"
            className="red-color"
            alt="Delete"
            width="16"
            height="16"
          />
        </span>
        Delete
      </Dropdown.Item>
      {deleteContent !== "" ? (
        <Confirm
          closeIcon
          open={confirmOpen}
          className="delete-modal"
          onCancel={() => setConfirmOpen(false)}
          header={"Are you sure?"}
          content={deleteContent}
          onConfirm={deleteComment}
          confirmButton="Yes"
        />
      ) : (
          <Confirm
            closeIcon
            open={confirmOpen}
            className="delete-modal"
            onCancel={() => setConfirmOpen(false)}
            header={"Are you sure?"}
            content={"Are you sure you want to delete this comment?"}
            onConfirm={deleteComment}
            confirmButton="Yes"
          />
        )}

    </>
  )
}

export default DeleteComment
