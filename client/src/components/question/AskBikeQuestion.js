import React, { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/auth"

import { useHistory } from "react-router-dom"

import { Form, Button, Grid, Modal } from "semantic-ui-react"

import RichTextEditor from "../util/RichTextEditor"
import { useForm } from "../../util/hooks"
import { useLazyQuery, useMutation } from "@apollo/client"
import { FETCH_BIKE_BY_NAME_QUERY, CREATE_FORUM_POST_MUTATION, FETCH_POSTS_QUERY } from "../../common/gql_api_def"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import TextareaAutosize from "react-textarea-autosize"
import { charLimit, fetchLimit } from "../../util/Constants"
import MultiSearchSelect from "../post/MultiSearchSelect"
import { getNewBody } from "../../util/base64-aws-util"

const styles = {
  padding: "7px 1rem"
}

/* define CreateBikePost component */
export const AskBikeQuestion = ({ post }) => {
  const [postId, setPostId] = useState("")
  const [tempSearch, settempSearch] = useState("")
  const history = useHistory()
  const [errors, setErrors] = useState({})
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)
  const [title, settitle] = useState("")
  const [bikes, setbikes] = useState([])
  const [body, setbody] = useState("")
  const [previewMedia, setPreviewMedia] = useState("")
  const [previewBody, setPreviewBody] = useState("")
  const [embedPicture, setEmbedPicture] = useState("")
  const [bike, setBikeName] = useState("")

  const [bikesSelected, setbikesSelected] = useState([])
  const [submitLoader, setSubmitLoader] = useState(false)
  const { user } = useContext(AuthContext)
  const usertag = user?.usertag
  const userId = user?.id
  const username = user?.username
  const name = user?.name
  const avatarUrl = user?.avatarUrl
  const userBike = user?.bikes
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [defaultBike, setDefaultBike] = useState(false)

  /* submit create bike post form and callback*/
  const { onSubmit } = useForm(createForumPostCallback, {
    body: "",
    title: "",
    bikes: [],
    setbikesSelected: []
  })

  useEffect(() => {
    if (post != undefined) {
      settitle(post.title)
      setbody(post.body)
      setPostId(post.id)

      if (post.bikes) {
        const changeKey = post.bikes.map(({ thumbUrl, bikeId, bikename }) => ({ image: thumbUrl, bikeId: bikeId, bikename: bikename }))
        setbikes(changeKey)
        setbikesSelected(post.bikes)
      } else {
        setbikes([])
        setbikesSelected([])
      }
    }
  }, [post])
  /* received searched bike list */
  let searchedWhichBike = []
  if (data && defaultBike) {
    for (let b = 0; b < data.getBikeByName.length; b++) {
      searchedWhichBike.push({
        id: data.getBikeByName[b].id,
        label: data.getBikeByName[b].bikename,
        image: data.getBikeByName[b].thumbUrl,
        description: ""
      })
    }
  }

  /* create bike post / save data of bike post */
  const [createForumPost] = useMutation(CREATE_FORUM_POST_MUTATION, {
    refetchQueries: [
      {
        query: FETCH_POSTS_QUERY,
        variables: { cursor: "", usertag: "", limit: fetchLimit, type: "posts" }
      }
    ],
    onCompleted: () => {
      history.push("/")
      //      history.push("/forum/0")
    },
    onError(err) {
      setSubmitLoader(false)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: {
      postId: postId,
      title: title,
      bikes: bikesSelected,
      body: body,
      userId: userId,
      username: username,
      name: name,
      avatarUrl: avatarUrl,
      userbikes: userBike,
      quesType: "bike",
      embedPicture: embedPicture,
      previewBody: previewBody,
      previewMedia: previewMedia
    }
  })

  /* create bike post callback */
  async function createForumPostCallback() {
    //Give time for the message parsing (base64 to upload)
    setSubmitLoader(true)

    //replace all occurrences of base64 into links....
    const { nbody, previewMedia, embedPicture } = await getNewBody(body)
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
    if (postId) {
      const changeKey = bikes.map(({ image, bikeId, bikename }) => ({ thumbUrl: image, bikeId: bikeId, bikename: bikename }))
      setbikesSelected(changeKey)
    }
    createForumPost()
  }

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  return (
    <Form onSubmit={onSubmit} className={(submitLoader ? "loading " : " ") + "post-input bike-post-input form-container"}>
      <MultiSearchSelect
        searchable={true}
        showTags={true}
        multiSelect={true}
        bike={bike}
        onSelect={e => {
          let bikes = []
          let bikesSelected = []
          if (e.length) {
            e.map((bike, i) => {
              if (i < 8) {
                bikes.push({
                  bikeId: bike.bikeId ? bike.bikeId : bike.id,
                  bikename: bike.bikename ? bike.bikename : bike.label,
                  image: bike.image ? bike.image : bike.image
                })
                bikesSelected.push({
                  bikeId: bike.bikeId ? bike.bikeId : bike.id,
                  bikename: bike.bikename ? bike.bikename : bike.label,
                  thumbUrl: bike.image ? bike.image : bike.image
                })
              }
            })
            setbikes(bikes)
            setbikesSelected(bikesSelected)
            setBikeName(bikesSelected[0].bikename)
            setDefaultBike(false)
          }
        }}
        options={searchedWhichBike}
        placeholder="Which bike?"
        selected={bikes}
        onUserInput={value => {
          if (value.length > 1 && tempSearch !== value) {
            settempSearch(value)
            searchBikeByName({ variables: { bikename: value } })
            setDefaultBike(true)
          }
        }}
        error={errors?.bikes ? true : false}
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
          className={errors?.body ? "error" : ""}
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
