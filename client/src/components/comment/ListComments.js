import React, { useState } from "react"
import { Comment } from "semantic-ui-react"
import { WARNING_DELETE_COMMENT_WITH_REPLIES, WARNING_DELETE_COMMENT_WITHOUT_REPLIES} from "../../util/user-messages"
import DisplayCommentCard from "./DisplayCommentCard"
//TODO: Will this logic hold up with large amounts of data and pagination? No. This needs to go
function ListChildComments({ replyComments = [], postId, openComment, setOpenComment, postType }) {
  return (
    <>
      {replyComments
        .slice(0)
        .reverse()
        .map((child_comment, index) => {
          let showReply = false
          if (replyComments.length - 1 === index) {
            showReply = true
          }
          return (
            <Comment.Group key={index}>
              <DisplayCommentCard
                comment={child_comment}
                postId={postId}
                child={true}
                showReply={showReply}
                openComment={openComment}
                setOpenComment={setOpenComment}
                postType={postType}
                deleteContent={WARNING_DELETE_COMMENT_WITHOUT_REPLIES}
              />
            </Comment.Group>
          )
        })}
    </>
  )
}

function ListComments({ postType, postId, comments }) {
  const [openComment, setOpenComment] = useState(null)

  return (
    <>
      {comments.map(comment => (
        <Comment.Group key={comment.id} className="comment-view">
          <Comment>
            <DisplayCommentCard
              comment={comment}
              postId={postId}
              reply={comment.replies}
              postType={postType}
              openComment={openComment}
              setOpenComment={setOpenComment}
              deleteContent={comment.replies.length?WARNING_DELETE_COMMENT_WITH_REPLIES:WARNING_DELETE_COMMENT_WITHOUT_REPLIES}
            />
            <ListChildComments replyComments={comment.replies} postId={postId} openComment={openComment} setOpenComment={setOpenComment} postType={postType} />
          </Comment>
        </Comment.Group>
      ))}
    </>
  )
}

export default ListComments
