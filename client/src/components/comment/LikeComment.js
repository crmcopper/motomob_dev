import React, { useEffect, useState } from "react"
import { Modal } from "semantic-ui-react"
import { useMutation } from "@apollo/client"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { LIKE_COMMENT_MUTATION, DISLIKE_COMMENT_MUTATION, FETCH_POST_COMMENTS_QUERY } from "../../common/gql_api_def"

function LikeComment({ postType, postId, user, comment: { id, likeCount, likes, dislikes, dislikeCount, replies } }) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)


  useEffect(() => {
    //---on page load we have checked comment & ans already liked or not
    if (likes && user) {
      const item = likes.find(item => item.username == user.username)
      if (item && Object.keys(item).length > 0) {
        setLiked(true)
      } else {
        setLiked(false)
      }
    } else setLiked(false)
  }, [likes])

  useEffect(() => {
    //---on page load we have checked comment & ans already disliked or not
    if (dislikes && user) {
      const item = dislikes.find(item => item.username == user.username)
      if (item && Object.keys(item).length > 0) {
        setDisliked(true)
      } else {
        setDisliked(false)
      }
    } else setDisliked(false)
  }, [dislikes])

  //---call likecomment mutation
  const [likeComment] = useMutation(LIKE_COMMENT_MUTATION, {
    variables: { commentId: id, postId: postId },
    update: (store, { data }) => {
      store.writeQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId },
        data: {
          getPostComments: [...data.likeComment]
        }
      })
    }
  })

  //---call dislikecomment mutation
  const [dislikeComment] = useMutation(DISLIKE_COMMENT_MUTATION, {
    variables: { commentId: id, postId: postId },
    update: (store, { data }) => {
      store.writeQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId },
        data: {
          getPostComments: [...data.dislikeComment]
        }
      })
    }
  })

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }


  function disLikeAction() {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      { disliked ? setDisliked(false) : setDisliked(false) }
      setLiked(false)
      dislikeComment()
    }
  }

  function likeAction() {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      { liked ? setLiked(false) : setLiked(true) }
      setDisliked(false)
      likeComment()
    }
  }

  return (
    <>
      <div className="d-block forum-result">
        <span className="svg-icon pointer">
          {liked ? (
            <img src="/assets/images/icons/like.svg" alt="Like" width="14" height="14" onClick={() => likeAction()} />
          ) : (
              <img src="/assets/images/icons/gray/like.svg" alt="Like" width="14" height="14" onClick={() => likeAction()} />
            )}
        </span>

        <span className="text-helpful text-green"> {likeCount > 0 ? likeCount : 0} </span>
        {(postType === "BikeForumPost" || postType === "TripForumPost") && (
          <>
            <span className="svg-icon pointer icon-dislike">
              {disliked ? (
                <img src="/assets/images/icons/dislike.svg" alt="Like" width="14" height="14" onClick={() => disLikeAction()} />
              ) : (
                  <img src="/assets/images/icons/gray/dislike.svg" alt="Like" width="14" height="14" onClick={() => disLikeAction()} />
                )}
            </span>
            <span className="text-helpful text-red"> {dislikeCount > 0 ? dislikeCount : 0} </span>
          </>
        )}
      </div>
      <Modal
        onClose={closeWarningModal}
        open={isWarningModalOpen}
        className="warning-modal"
        size="small"
      >
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default LikeComment
