import React, { useContext, useState } from "react"
import { Button, Form, Card } from "semantic-ui-react"
import { useMutation } from "@apollo/client"
import { useForm } from "../../util/hooks"
import { AuthContext } from "../../context/auth"
import RichTextEditor from "../util/RichTextEditor"
import { UPDATE_COMMENT_MUTATION, FETCH_POST_COMMENTS_QUERY } from "../../common/gql_api_def"
import { getNewBody } from "../../util/base64-aws-util"

function EditComment({ postId, comments, seteditPostEditor }) {
  
  const { user } = useContext(AuthContext)
  const [errors, setErrors] = useState(false)
  const [submitLoader, setSubmitLoader] = useState(false)
  const { values, onSubmit } = useForm(updateCommentCallback, {
    body: comments.body
  })

  const [updateComment, { loading, error }] = useMutation(UPDATE_COMMENT_MUTATION, {
    variables: values,
    update: (store, { data }) => {
      setErrors(true)
      values.body = ""
      store.writeQuery({
        query: FETCH_POST_COMMENTS_QUERY,
        variables: { postId },
        data: {
          getPostComments: data.updateComment
        }
      })     
      setSubmitLoader(false)
      seteditPostEditor(false)
    },
    onError(err) {
      setSubmitLoader(false)
      setErrors(true)
    }
  })

  async function updateCommentCallback() {
    //Give time for the message parsing (base64 to upload)
    setSubmitLoader(true)
    values.commentId = comments.id
    //set the postId
    values.postId = postId
    //replace all occurrences of base64 into links....
    const {nbody} = await getNewBody(values.body)
    
    values.body = nbody

    updateComment()
  }

  return (
    <>     
      <div className="post-comment replay-comment">
        <Form onSubmit={onSubmit} className={(submitLoader || loading ? "loading " : " ") + "post-input bike-post-input"}>
          <Form.Field>            
            <RichTextEditor onBodyChange={body => (values.body = body)} value={values.body} comment={true} />
          </Form.Field>
          <Form.Field className="text-right">
            <Button
              onClick={e => {
                setErrors(false)
              }}
              type="button"
              className="btn-cancel white-addon comment-btn"
              color="red"
              onClick={()=>seteditPostEditor(false)}
            >
              Cancel
            </Button>            
            <Button type="submit" color="red" className="comment-btn" disabled={submitLoader || loading}>
              Update
            </Button>
          </Form.Field>
        </Form>
      </div> 
      {errors && error && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      )}
    </>
  )
}
export default EditComment
