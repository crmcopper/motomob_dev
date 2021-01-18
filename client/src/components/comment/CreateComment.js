import React, { useContext, useState } from "react"
import { Button, Form, Modal, Card, Header } from "semantic-ui-react"
import { useMutation } from "@apollo/client"
import Avatar from "../../../src/components/util/Avatar"
import { useForm } from "../../util/hooks"
import { AuthContext } from "../../context/auth"
import RichTextEditor from "../util/RichTextEditor"
import { CREATE_COMMENT_MUTATION, FETCH_POST_COMMENTS_QUERY, FETCH_POST_QUERY } from "../../common/gql_api_def"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { getNewBody } from "../../util/base64-aws-util"

function CreateComment({ postType, postId, comments }) {
  const { user } = useContext(AuthContext)
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
      setEditorFlag(false)
      setErrors(true)
      values.body = ""
      const commentsData = store.readQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId }
      })

      store.writeQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId },
        data: {
          getPostComments: [data.createComment.comment, ...commentsData.getPostComments]
        }
      })

      store.writeQuery({
        query: FETCH_POST_QUERY,
        variables: { postId },
        data: data.createComment.post
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
    //replace all occurrences of base64 into links....
    const { nbody } = await getNewBody(values.body)
    // console.log(nbody)
    values.body = nbody

    createComment()
  }
  const [showeditor, setEditorFlag] = useState(false)

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  if (showeditor) {
    setTimeout(function () {
      if (document.querySelector(".create-comment")) {
        document.querySelector(".create-comment").focus()
        var topOfElement = document.querySelector(".create-comment").offsetTop - 10
        window.scroll({ top: topOfElement, behavior: "auto" })
      }
    })
  }

  //TODO: Clear the editor after post. We need to call quill.setContents([{ insert: '\n' }]); or something similar
  return (
    <>
      {showeditor && user && (
        <>
          <Card fluid className="post-comment create-comment">
            <Form onSubmit={onSubmit} className={(submitLoader || loading ? "loading " : " ") + "post-input bike-post-input"}>
              <Form.Field>
                <RichTextEditor focused={true} onBodyChange={body => (values.body = body)} value={values.body} comment={true} />
              </Form.Field>
              <Form.Field className="text-right">
                <Button
                  onClick={e => {
                    setEditorFlag(false)
                    setErrors(false)
                  }}
                  type="button"
                  className="btn-cancel white-addon comment-btn"
                  color="red"
                  disabled={submitLoader || loading}
                >
                  Cancel
                </Button>
                <Button type="submit" color="red" className="comment-btn">
                  {postType === "BikeForumPost" || postType === "TripForumPost" ? " Add Answer" : "Add Comment"}
                </Button>
              </Form.Field>
            </Form>
          </Card>
        </>
      )}
      {showeditor && errors && error && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      )}
      {(!showeditor || (showeditor && !user)) && (
        <Card
          onClick={() => {
            if (user) {
              setEditorFlag(true)
            } else {
              setWarningModalOpen(true)
            }
          }}
          fluid
          className="post-comment bike-comments"
        >
          <Header as="h4" image className="pointer">
            <Avatar src="/assets/images/bike-4.png" alt="" />
            <Header.Content>
              <Form>
                <Form.Group inline>
                  <div className="borderless">
                    {postType === "BikeForumPost" || postType === "TripForumPost" ? "Answer here (if you can help)" : "Add a comment"}
                  </div>
                  <Button type="submit" className="post-btn add-new-comment">
                    {postType === "BikeForumPost" || postType === "TripForumPost" ? "Answer" : "Comment"}
                  </Button>
                </Form.Group>
              </Form>
            </Header.Content>
          </Header>
        </Card>
      )}
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default CreateComment
