import React, { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/auth"

import { useHistory } from "react-router-dom"

import { Form, Button, Grid, Image, Modal, Responsive } from "semantic-ui-react"
import { Link } from "react-router-dom"

import RichTextEditor from "../util/RichTextEditor"
import { useForm } from "../../util/hooks"
import { useMutation } from "@apollo/client"
import { CREATE_FORUM_POST_MUTATION, FETCH_POSTS_QUERY } from "../../common/gql_api_def"
import NotLoggedInModal from "../contest/NotLoggedInModal"
import TextareaAutosize from "react-textarea-autosize"
import { charLimit, fetchLimit } from "../../util/Constants"
import { getNewBody } from "../../util/base64-aws-util"

export const AskTripQuestion = ({ post }) => {
  const history = useHistory()
  const [postId, setPostId] = useState("")
  const [errors, setErrors] = useState({})
  const [title, settitle] = useState("")
  const [body, setbody] = useState("")
  const [previewMedia, setPreviewMedia] = useState("")
  const [previewBody, setPreviewBody] = useState("")
  const [embedPicture, setEmbedPicture] = useState("")
  const [location, setLocation] = useState("")

  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [submitLoader, setSubmitLoader] = useState(false)

  const styles = {
    padding: "9px 1rem"
  }

  /* create trip post form sumbmit and callback */
  const { onSubmit } = useForm(createForumPostCallback, {
    title: "",
    body: "",
    location: ""
  })
  useEffect(() => {
    if (post) {
      settitle(post.title)
      setbody(post.body)
      setPostId(post.id)
      post.location ? setLocation(post.location[0]) : setLocation("")
    }
  }, [post])

  const { user } = useContext(AuthContext)
  const usertag = user?.usertag
  const userId = user?.id
  const username = user?.username
  const name = user?.name
  const avatarUrl = user?.avatarUrl
  const userBike = user?.bikes

  /* save data of create Trip Post */
  const [createForumPost] = useMutation(CREATE_FORUM_POST_MUTATION, {
    refetchQueries: [
      {
        query: FETCH_POSTS_QUERY,
        variables: { cursor: "", usertag: "", limit: fetchLimit, type: "posts" }
      }
    ],
    onCompleted: () => {
      history.push("/")
      //       history.push("/forum/1")
    },
    onError(err) {
      setSubmitLoader(false)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: {
      postId: postId,
      title: title,
      body: body,
      userId: userId,
      location,
      username: username,
      name: name,
      avatarUrl: avatarUrl,
      userbikes: userBike,
      quesType: "trip",
      embedPicture: embedPicture,
      previewBody: previewBody,
      previewMedia: previewMedia
    }
  })

  /* create Trip Post Callback function */
  async function createForumPostCallback() {
    //Give time for the message parsing (base64 to upload)
    setSubmitLoader(true)

    //replace all occurrences of base64 into links....
    const { nbody, previewMedia, embedPicture } = await getNewBody(body)
    // console.log(nbody)
    setPreviewMedia(previewMedia)
    let nbodys = nbody
      .replace(/<\/p>/g, "...")
      .replace(/<(.|\n)*?>/g, "")
      .slice(0, 280)
    if (nbodys === "...") {
      nbodys = ""
    }
    setPreviewBody(nbodys)

    setEmbedPicture(embedPicture)
    setbody(nbody)

    createForumPost()
  }

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  return (
    <Form onSubmit={onSubmit} className={(submitLoader ? "loading " : " ") + "post-input bike-post-input form-container"}>
      <Form.Select
        fluid
        name="location"
        multiple={false}
        search
        options={locations}
        placeholder="Where?"
        onChange={(e, { value }) => {
          setLocation(value)
        }}
        value={location}
        error={errors?.location ? true : false}
      />

      <Form.Field className={errors?.title ? "error" : ""}>
        <TextareaAutosize
          type="text"
          placeholder="Title of your question"
          value={title}
          name="title"
          onChange={e => {
            settitle(e.target.value.toString().slice(0, charLimit))
          }}
          className="fixsize"
          style={styles}
          rows="1"
        />
      </Form.Field>

      <Form.Field className={errors?.body ? "error" : ""}>
        <RichTextEditor
          placeholder="Start writing your post here. Add images, YouTube links, hashtags and more"
          onBodyChange={e => setbody(e)}
          value={body}
          error={errors?.body ? true : false}
        />
      </Form.Field>

      <Grid className="post-btn-wrapper">
        <Grid.Column>
          {Object.keys(errors).length > 0 && (
            <div className="ui error message" style={{ display: "block" }}>
              <ul className="list">
                {Object.values(errors).map(value => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          )}
        </Grid.Column>
      </Grid>

      <Grid className="post-btn-wrapper">
        <Grid.Column textAlign="center">
          <Button
            type="submit"
            color="red"
            onClick={e => {
              if (!user) {
                e.preventDefault()
                setWarningModalOpen(true)
              }
            }}
          >
            Post
          </Button>
        </Grid.Column>
      </Grid>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </Form>
  )
}

export default AskTripQuestion
