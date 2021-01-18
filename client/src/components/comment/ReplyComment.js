import React, { useContext, useState } from "react"
import { Button, Form, Modal } from "semantic-ui-react"
import { useMutation } from "@apollo/client"

import { useForm } from "../../util/hooks"
import { AuthContext } from "../../context/auth"
import RichTextEditor from "../util/RichTextEditor"
import { CREATE_COMMENT_MUTATION, FETCH_POST_COMMENTS_QUERY /*, FETCH_POST_QUERY */ } from "../../common/gql_api_def"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { getNewBody } from "../../util/base64-aws-util"

function ReplyComment({ postId, comments, showEditor, setEditor }) {
  const { user } = useContext(AuthContext)
  // const [showeditor, setEditor] = useState(true);
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [errors, setErrors] = useState(false)
  const [submitLoader, setSubmitLoader] = useState(false)

  const { values, onSubmit } = useForm(createCommentCallback, {
    body: ""
  })

  //Instead of just refetching the comments (all of them!!), it is better to update the backend and change the cache.
  const [createComment, { loading, error }] = useMutation(CREATE_COMMENT_MUTATION, {
    variables: values,
    update: (store, { data }) => {
      setEditor(false)
      setErrors(false)
      const commentsData = store.readQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId }
      })

      store.writeQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId },
        data: {
          getPostComments: [...commentsData.getPostComments, data.createComment]
        }
      })
      //Mark the end of the process
      setSubmitLoader(false)
    },
    onError(err) {
      setSubmitLoader(false)
      setErrors(true)
    }
  })

  async function createCommentCallback() {
    //Give time for the message parsing (base64 to upload)
    setSubmitLoader(true)

    //set the postId
    values.postId = postId

    //Create the user "Snapshot" data to be saved with the post
    values.userId = user.id
    values.avatarUrl = user.avatarUrl
    values.userbikes = user.bikes
    values.username = user.username
    values.name = user.name
    values.replyToId = comments.replyToId ? comments.replyToId : comments.id

    //replace all occurrences of base64 into links....
    const { nbody } = await getNewBody(values.body)
    // console.log(nbody)
    values.body = nbody

    createComment()
  }

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  //TODO: Clear the editor after post. We need to call quill.setContents([{ insert: '\n' }]); or something similar
  if (showEditor) {
    setTimeout(function () {
      if (document.querySelector(".reply-comment")) {
        document.querySelector(".reply-comment").focus()
        var elmnt = document.querySelector(".reply-comment")
        elmnt.scrollIntoView({ behavior: "auto", block: "end", inline: "end" })
      }
    })
  }
  return (
    <>
      {showEditor && (
        <>
          <div className="reply-comment">
            <Form onSubmit={onSubmit} className={(submitLoader || loading ? "loading " : " ") + "post-input bike-post-input "}>
              <Form.Field>
                <RichTextEditor focused={true} onBodyChange={body => (values.body = body)} value={""} comment={true} />
              </Form.Field>
              <Form.Field className="text-right">
                <Button
                  onClick={e => {
                    setEditor(false)
                    setErrors(false)
                  }}
                  type="button"
                  className="btn-cancel white-addon "
                  color="red"
                >
                  Cancel
                </Button>
                <Button
                  onClick={e => {
                    if (!user) {
                      e.preventDefault()
                      setWarningModalOpen(true)
                    }
                  }}
                  type="submit"
                  className="reply-btn"
                  color="red"
                  disabled={submitLoader || loading}
                >
                  Add Reply
                </Button>
                <div id="text-editor"></div>
              </Form.Field>
            </Form>
            {errors && error && (
              <div className="ui error message" style={{ marginBottom: 20 }}>
                <ul className="list">
                  <li>{error.graphQLErrors[0].message}</li>
                </ul>
              </div>
            )}
          </div>
        </>
      )}
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default ReplyComment
