import React, { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/auth"

import { useHistory } from "react-router-dom"

import { Form, Button, Grid, Modal, Popup, Dropdown } from "semantic-ui-react"

import RichTextEditor from "../util/RichTextEditor"
import { useForm } from "../../util/hooks"
import { useLazyQuery, useMutation } from "@apollo/client"
import { FETCH_BIKE_BY_NAME_QUERY, CREATE_FORUM_POST_MUTATION, FETCH_POSTS_QUERY } from "../../common/gql_api_def"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { charLimit, fetchLimit } from "../../util/Constants"
import { getNewBody } from "../../util/base64-aws-util"
import { Link } from "react-router-dom"
import Autocomplete from "react-google-autocomplete"
import MultiSearchSelectPopup from "../post/MultiSearchSelectPopup"
import { validateForumPost } from "../../util/validators"
import { ImagesPixelToPercent } from "../../util/ImagesPixelToPercent"
const friendOptions = []

export const AskQuestion = ({ post }) => {
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

  const [bikesSelected, setbikesSelected] = useState([])
  const [submitLoader, setSubmitLoader] = useState(false)
  const { user } = useContext(AuthContext)
  const userId = user?.id
  const username = user?.username
  const name = user?.name
  const avatarUrl = user?.avatarUrl
  const userBike = user?.bikes
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [quesType, setQuesType] = useState("bike")
  const [allLocation, setallLocation] = useState([])
  const [defaultBike, setDefaultBike] = useState(false)

  /* submit create bike post form and callback*/
  const { onChangeCustom, onChange, onSubmit, values } = useForm(createForumPostCallback, {
    body: "",
    title: "",
    bikes: [],
    bikesSelected: [],
    postag: [],
    additionalTag: ""
  })

  useEffect(() => {
    if (post) {
      settitle(post.title)
      setbody(post.body)
      setPostId(post.id)

      if (post.postType === "BikeForumPost") {
        setQuesType("bike")
        if (post.bikes.length) {
          const changeKey = post.bikes.map(({ thumbUrl, bikeId, bikename }) => ({ image: thumbUrl, bikeId: bikeId, bikename: bikename }))
          setbikes(changeKey)
          setbikesSelected(post.bikes)
        } else {
          setbikes([])
          setbikesSelected([])
        }
      } else {
        setQuesType("trip")
        if (document.getElementById("createTrip")) {
          document.getElementById("createTrip").click()
        }
        if (post.location.length) {
          const locationConvertInArray = Object.values(post.location)
          setallLocation(locationConvertInArray)
        }
      }

      let tags = post.postag.split(" # ")
      if (tags.length && tags[1]) {
        let selectedTags = tags[1].split(",")
        let tempSelected = []
        if (selectedTags.length) {
          selectedTags.map(t => {
            if (!friendOptions.find(tag => tag.value === t)) {
              friendOptions.push({ key: t, text: t, value: t })
            }
            tempSelected.push(t)
          })
        }
        values.postag = tempSelected
        values.additionalTag = tags[1]
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
  } else {
    if (user) {
      if (tempSearch === "") {
        if (user.ownBikes.length) {
          user.ownBikes.map(b => {
            searchedWhichBike.push({
              id: b.bikeId,
              label: b.bikename,
              image: b.thumbUrl, // No need for default, that too a local one!
              description: ""
            })
          })
        }
        if (user.followBikes.length) {
          user.followBikes.map(b => {
            if (!searchedWhichBike.find(bike => bike.id === b.bikeId)) {
              searchedWhichBike.push({
                id: b.bikeId,
                label: b.bikename,
                image: b.thumbUrl,
                description: ""
              })
            }
          })
        }
      }
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
    onCompleted: data => {
      history.push(`/posts/${data.createForumPost.id}`)
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
      quesType: quesType,
      location: allLocation,
      embedPicture: embedPicture,
      previewBody: previewBody,
      previewMedia: previewMedia,
      additionalTag: values.postag ? values.postag.join(",") : ""
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
      .slice(0, 560)
    if (nbodys == "...") {
      nbodys = ""
    }
    let newBody = await ImagesPixelToPercent(nbody)
    setPreviewBody(nbodys)
    setEmbedPicture(embedPicture)
    setbody(newBody)
    if (postId) {
      const changeKey = bikes.map(({ image, bikeId, bikename }) => ({ thumbUrl: image, bikeId: bikeId, bikename: bikename }))
      setbikesSelected(changeKey)
    }
    if (quesType === "bike") {
      setallLocation([])
    } else {
      setbikesSelected([])
    }
    createForumPost()
  }

  /* close login first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  const closeLocationPopup = () => {
    if (document.querySelector(".add-locations")) {
      document.querySelector(".add-locations").click()
    }
  }

  useEffect(() => {
    if (document.querySelector(".error-message")) {
      var topOfElement = document.querySelector(".error-message").offsetTop - 10
      window.scroll({ top: topOfElement, behavior: "auto" })
    }
  }, [errors])

  const submitForm = () => {
    const { valid, errors } = validateForumPost(title, body, bikesSelected, allLocation, quesType)
    if (!valid) {
      setErrors(errors)
    } else {
      onSubmit()
    }
  }

  const scrollWindow = () => {
    let yPosition = window.pageYOffset
    let xPosition = window.pageXOffset
    setTimeout(function () {
      window.scrollTo(xPosition, yPosition)
    }, 1000)
  }

  return (
    <>
      <Form onSubmit={submitForm} className={(submitLoader ? "loading " : " ") + "post-input bike-post-input form-container"}>
        <Link to="" className="cancel-btn top-right" onClick={() => history.goBack()}>
          Cancel
        </Link>
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={15} verticalAlign="middle" className="text-center">
            <label>Get help, Ask a question</label>
          </Grid.Column>
        </Grid>
        <Grid>
          <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
            <label>Question category</label>
            <p className="text-light">Is your question about bikes or travel?</p>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={10} computer={11}>
            <div className="field">
              <div className={(quesType === "bike" ? "checked " : "") + "ui radio checkbox"} onChange={() => setQuesType("bike")}>
                <input
                  className="hidden"
                  name="tab"
                  readOnly=""
                  id="createBike"
                  tabIndex="0"
                  type="radio"
                  value="Bike"
                  defaultChecked={quesType === "bike" ? true : false}
                />
                <label htmlFor="createBike">
                  <span className="check-mark align-middle">
                    <img src="/assets/images/icons/gray/checkmark.svg" className="align-middle gray-color" alt="checkmark" width="24" height="24" />
                    <img src="/assets/images/icons/checkmark.svg" className="align-middle red-color" alt="checkmark" width="24" height="24" />
                  </span>
                  <span className="svg-radio align-middle">
                    <img src="/assets/images/icons/gray/create-bike.svg" className="gray-color align-middle" alt="Bikes" width="24" height="24" />
                    <img src="/assets/images/icons/create-bike.svg" className="red-color align-middle" alt="Bikes" width="24" height="24" />
                  </span>
                  <span className="align-middle">Bike</span>
                </label>
              </div>
              <div className={(quesType === "trip" ? "checked " : "") + " ui radio checkbox"} onChange={() => setQuesType("trip")}>
                <input
                  className="hidden"
                  name="tab"
                  readOnly=""
                  id="createTrip"
                  tabIndex="0"
                  type="radio"
                  value="Trip"
                  defaultChecked={quesType === "trip" ? true : false}
                />
                <label htmlFor="createTrip">
                  <span className="check-mark align-middle">
                    <img src="/assets/images/icons/gray/checkmark.svg" className="align-middle gray-color" alt="checkmark" width="24" height="24" />
                    <img src="/assets/images/icons/checkmark.svg" className="align-middle red-color" alt="checkmark" width="24" height="24" />
                  </span>
                  <span className="svg-radio align-middle">
                    <img src="/assets/images/icons/gray/create-trip.svg" className="gray-color align-middle" alt="Trip" width="24" height="24" />
                    <img src="/assets/images/icons/create-trip.svg" className="red-color align-middle" alt="Trip" width="24" height="24" />
                  </span>
                  <span className="align-middle">Trip</span>
                </label>
              </div>
            </div>
          </Grid.Column>
        </Grid>
        {quesType === "trip" && (
          <Grid>
            <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
              <label>Select Locations</label>
              <p className="text-light">Which countries, towns, regions did you visit?</p>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={10} computer={11} verticalAlign="middle">
              <div className="location-bx">
                {allLocation.map((e, i) => (
                  <div className="tags" key={`locationDiv${i}`}>
                    <span>{e}</span>
                    <span
                      onClick={ev => {
                        setallLocation(allLocation.filter(loc => loc !== e))
                      }}
                      className="delete-tag"
                    >
                      <img src="/assets/images/icons/close-tag.svg" alt="Close" width="11" height="11" />
                    </span>
                  </div>
                ))}
                {allLocation.length < 8 && (
                  <Popup
                    content={
                      <>
                        <div className="d-flex justify-content-between">
                          <label></label>
                          <span className="pointer" onClick={() => closeLocationPopup()}>
                            Close
                          </span>
                        </div>
                        <div className="location-serach-iput">
                          <span className="svg-icon location-serach-icon">
                            <img src="/assets/images/icons/search-black.svg" alt="Search" width="16" height="16" />
                          </span>
                          <Autocomplete
                            autoFocus
                            name="location"
                            id="locationList"
                            onKeyDown={event => {
                              if (event.keyCode === 13) {
                                event.preventDefault()
                              }
                            }}
                            onPlaceSelected={place => {
                              if (place.formatted_address) {
                                let loc = allLocation
                                if (!loc.find(l => l === place.formatted_address)) {
                                  loc.push(place.formatted_address)
                                }
                                setallLocation([...loc])
                                if (document.querySelector("#locationBtn")) {
                                  document.querySelector("#locationBtn").click()
                                }
                              }
                            }}
                            types={["(regions)"]}
                            placeholder="Select your location"
                          />
                        </div>
                      </>
                    }
                    on="click"
                    pinned
                    position="bottom left"
                    className="search-bike-popup location-popup"
                    trigger={
                      <Button
                        content={
                          <>
                            <img src="/assets/images/icons/gray/plus.svg" className="gray-color" alt="Add" width="22" height="21" />
                            <img src="/assets/images/icons/plus.svg" className="red-color" alt="Add" width="22" height="21" />
                          </>
                        }
                        id="locationBtn"
                        type="button"
                        className={errors && errors.locations ? "add-locations add-bike-rounded-button error" : "add-locations add-bike-rounded-button"}
                      />
                    }
                    onClose={() => {
                      if (document.querySelector(".add-locations")) {
                        var element = document.getElementsByClassName("add-locations")[0]
                        element.classList.remove("box-opned")
                      }
                    }}
                    onOpen={() => {
                      if (document.querySelector(".add-locations")) {
                        var element = document.getElementsByClassName("add-locations")[0]
                        element.classList.add("box-opned")
                      }
                    }}
                  />
                )}
              </div>
              {errors?.locations && <span className="error-message">{errors.locations}</span>}
            </Grid.Column>
          </Grid>
        )}
        {quesType === "bike" && (
          <Grid>
            <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
              <label>Select bike(s)</label>
              <p className="text-light">Please select the bike(s) related to your question</p>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={10} computer={11} verticalAlign="middle">
              <div>
                {bikesSelected.map((e, i) => (
                  <div className="tags" key={i}>
                    <Popup
                      content={e.bikename}
                      className="popup-tooltip"
                      trigger={<img src={e.image ? e.image : e.thumbUrl} alt="slide" width="55" height="55" className="rounded" />}
                      position="bottom left"
                    />
                    <span
                      onClick={ev => {
                        setbikesSelected(bikesSelected.filter(b => b.bikeId !== e.bikeId))
                        setbikes(bikes.filter(b => b.bikeId !== e.bikeId))
                      }}
                      className="close-tag"
                    >
                      <img src="/assets/images/icons/close-small.svg" alt="Close" width="8" height="8" />
                    </span>
                  </div>
                ))}
                {bikesSelected.length < 8 && (
                  <Popup
                    content={
                      <MultiSearchSelectPopup
                        searchable={true}
                        showTags={false}
                        multiSelect={true}
                        onSelect={e => {
                          let tempBikes = []
                          let tempBikesSelected = []
                          if (e.length) {
                            e.map((bike, i) => {
                              if (i < 8) {
                                tempBikes.push({
                                  bikeId: bike.bikeId ? bike.bikeId : bike.id,
                                  bikename: bike.bikename ? bike.bikename : bike.label,
                                  image: bike.image
                                })
                                tempBikesSelected.push({
                                  bikeId: bike.bikeId ? bike.bikeId : bike.id,
                                  bikename: bike.bikename ? bike.bikename : bike.label,
                                  thumbUrl: bike.image
                                })
                              }
                            })
                          }
                          setbikes(tempBikes)
                          setbikesSelected(tempBikesSelected)
                          setDefaultBike(false)
                        }}
                        options={searchedWhichBike}
                        placeholder="Search bike"
                        selected={bikes}
                        onUserInput={value => {
                          if (value.length > 1 && tempSearch !== value) {
                            settempSearch(value)
                            searchBikeByName({ variables: { bikename: value } })
                            setDefaultBike(true)
                          }
                        }}
                        userDefaultBike={value => {
                          settempSearch(value)
                          searchBikeByName({ variables: { bikename: value } })
                          setDefaultBike(false)
                        }}
                        error={errors?.bikes ? true : false}
                      />
                    }
                    on="click"
                    pinned
                    position="bottom left"
                    className="search-bike-popup photo-contests"
                    trigger={
                      <Button
                        content={
                          <>
                            <img src="/assets/images/icons/gray/plus.svg" className="gray-color" alt="Add" width="22" height="21" />
                            <img src="/assets/images/icons/plus.svg" className="red-color" alt="Add" width="22" height="21" />
                          </>
                        }
                        type="button"
                        className={errors && errors.bikes ? "add-bike-rounded-button error" : "add-bike-rounded-button"}
                      />
                    }
                  />
                )}
              </div>
              {errors?.bikes && <span className="error-message">{errors.bikes}</span>}
            </Grid.Column>
          </Grid>
        )}
        <Grid>
          <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
            <label>Title of your question</label>
            <p className="text-light">A short punchy title so riders can help you quicker</p>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={10} computer={11}>
            <Form.Input
              className={errors?.title ? "error" : ""}
              placeholder="Title of your question"
              name="title"
              type="text"
              value={title}
              onChange={e => {
                settitle(e.target.value.toString().slice(0, charLimit))
              }}
            />
            {errors?.title && <span className="error-message">{errors.title}</span>}
          </Grid.Column>
        </Grid>
        <Grid className="mt-1">
          <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
            <label>Search keyword(s)</label>
            <p className="text-light">Riders can quickly find your post with these tags</p>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={10} computer={11}>
            <div className="field">
              <Dropdown
                placeholder="+ Add tags"
                fluid
                search
                selection
                multiple
                allowAdditions
                name="postag"
                onAddItem={(event, data) => {
                  let tempValue = data.value
                    .replace(/,/g, "")
                    .replace(/\s+/g, " ")
                    .replace(/\s+#/g, "#")
                    .replace(/#+\s/g, "#")
                    .replace(/\s+#+\s/g, "#")
                  if (tempValue.length > 1 && !friendOptions.find(f => f.value === tempValue)) {
                    friendOptions.push({ key: tempValue, text: tempValue, value: tempValue })
                  }
                }}
                options={friendOptions}
                selected={values.postag ? values.postag : []}
                value={values.postag ? values.postag : []}
                onChange={(event, data) => {
                  let tempValues = []
                  data.value.map(v => {
                    let temVal = v
                      .replace(/,/g, "")
                      .replace(/\s+/g, " ")
                      .replace(/\s+#/g, "#")
                      .replace(/#+\s/g, "#")
                      .replace(/\s+#+\s/g, "#")
                    if (temVal.length > 1 && !tempValues.find(t => t === temVal)) {
                      tempValues.push(temVal)
                    }
                  })
                  data.value = tempValues.slice(0, 25)
                  values.additionalTag = data.value.join(",")
                  onChangeCustom(event, data, "postag")
                }}
              />
            </div>
            <p className="text-light">To add a keyword, type the word(s) and press enter.</p>
          </Grid.Column>
        </Grid>
        <Form.Field className={errors?.body ? "error" : ""} onPaste={() => scrollWindow()}>
          <RichTextEditor
            placeholder="Start writing your post here. Add images, YouTube links, hashtags and more"
            onBodyChange={e => setbody(e)}
            value={body}
            error={errors?.body ? true : false}
            className={errors?.body ? "error" : ""}
          />
          {errors?.body && <span className="error-message">{errors.body}</span>}
        </Form.Field>
        <div className="d-flex justify-content-between align-items-center">
          <Link to=""></Link>
          <div>
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
          </div>
        </div>
      </Form>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}
