import React, { useContext, useState } from "react"
import { Comment, Grid, Modal, Dropdown, Button,Responsive } from "semantic-ui-react"
import ReactHtmlParser from "react-html-parser"
import moment from "moment"
import { Link } from "react-router-dom"
import ReplyComments from "./ReplyComment"
import { AuthContext } from "../../context/auth"
import DeleteComment from "./DeleteComment"
import LikeComment from "./LikeComment"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import RichTextEditor from "../util/RichTextEditor"
import EditComment from "../../components/comment/EditComment"

function DisplayCommentCard({ deleteContent, postType, comment, postId, child = false, reply, showReply, openComment, setOpenComment }) {
  const { body, createdAt, id,name, username, userId, avatarUrl, userbikes, likeCount, likes, dislikes, dislikeCount, replies, replyToId } = comment
  const { user } = useContext(AuthContext)

  const [showComment, setCommentFlag] = useState(false)
  const [showEditor, setEditor] = useState(false)
  const [showeditor, setEditorFlag] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }
  const [editPostEditor, seteditPostEditor] = useState(false)

 
  // let mobileText = ""
  // if (name && name != null) {
  
  //   if(name.length > 20){
  //   mobileText = name.substring(0, 15)
  //   mobileText = mobileText + "..."
  //   }
  //   else{
  //     mobileText = name
  //   }
   

  // }

  //const commentCount = -10 //TODO: change later after implementing comments on comments
  return (
    <>
      <Comment.Avatar as={Link} to={`/profile/${userId}`} src={avatarUrl ? avatarUrl : "/assets/images/richard-pic.png"} />
      <Comment.Content>
      <Responsive minWidth={992}>
        <Comment.Author as={Link} to={`/profile/${userId}`}>
         {name}  <span className="text-light">@{username}</span>
        </Comment.Author>
        <div className="author-sub text-light">@{userbikes}</div>
        </Responsive>
        <Responsive maxWidth={991}>
        <Comment.Author as={Link} to={`/profile/${userId}`}>
         {name} 
        </Comment.Author>
        <div className="author-sub text-light">@{username}</div>
          </Responsive>
        <Comment.Metadata>
        {user && user.username === username && (
            <Dropdown
              pointing
              className="link item align-middle edit-delete-comment"
              icon={
                <span className="svg-icon">
                  <img
                    src="/assets/images/icons/gray/dots.svg"
                    className="gray-color"
                    alt="More Vertical"
                    width="5"
                    height="25"
                  />
                  <img
                    src="/assets/images/icons/dots.svg"
                    className="red-color"
                    alt="More Vertical"
                    width="5"
                    height="25"
                  />
                </span>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => seteditPostEditor(true)}>
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
                  </span> Edit
                      </Dropdown.Item>
                <DeleteComment deleteContent={deleteContent} commentId={id} postId={postId} replyToId={replyToId} />
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Comment.Metadata>
        {!editPostEditor && (
          <>
            <Comment.Text>
              <div className="quill ">
                <div className="ql-container ql-snow ql-disabled">
                  <div className="ql-editor">{ReactHtmlParser(body)}</div>
                </div>
              </div>
            </Comment.Text>
            <Comment.Actions>
              <div className="d-flex justify-content-between align-items-center comment-action">
              <LikeComment user={user} comment={{ id, likeCount, likes, dislikes, dislikeCount, replies }} postType={postType} postId={postId} />
              <span className="text-light">{moment(createdAt).fromNow(true)} ago</span>
              </div>
              <div className="d-flex justify-content-end">
              {!child && reply && reply.length == 0 && (
                      <Button
                        onClick={() => {
                          if (user) {
                            setOpenComment(comment.id)
                            setEditor(true)
                            setEditorFlag(true)
                          } else {
                            setEditor(false)
                            setWarningModalOpen(true)
                          }
                        }}
                        className="post-btn reply-comment-btn"
                      >
                        Reply
                      </Button>
                    )}
                    {child && showReply && (
                      <Button
                        onClick={() => {
                          if (user) {
                            setOpenComment(comment.id)
                            setEditor(true)
                            setEditorFlag(true)
                          } else {
                            setEditor(false)
                            setWarningModalOpen(true)
                          }
                        }}
                        className="post-btn reply-comment-btn"
                      >
                        Reply
                      </Button>
                    )}
                    {comment.id == openComment && <ReplyComments postId={postId} comments={comment} child={child} showEditor={showEditor} setEditor={setEditor} />}
              </div>
            </Comment.Actions>
          </>
        )}
      </Comment.Content>
      {editPostEditor && (
        <EditComment postId={postId} comments={comment} seteditPostEditor={seteditPostEditor} />
      )}
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default DisplayCommentCard
