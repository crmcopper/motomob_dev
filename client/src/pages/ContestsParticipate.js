import React, { useState, useContext, useEffect, useRef } from "react"
import { useQuery } from "@apollo/client"
import { Dimmer, Loader, Modal, Container, Card, Header, Form, Button, Grid, Popup } from "semantic-ui-react"
import { AuthContext } from "../context/auth"
import NotLoggedInModal from "../components/contest/NotLoggedInModal"
import Navigation from "../layout/Navigation"
import Avatar from "../components/util/Avatar"
import UploadPhoto from "../components/contest/UploadPhoto"
import { Link } from "react-router-dom"
import { useMutation, useLazyQuery } from "@apollo/client"
import { useForm } from "../util/hooks"
import { ADD_CONTEST_PHOTO, FETCH_CONTEST_QUERY, S3_SIGN_MUTATION, FETCH_BIKE_BY_NAME_QUERY, ADD_PREVIEW_PHOTO_CONTEST } from "../common/gql_api_def"
import { S3Folders } from "../util/Constants"
import { formatFilename, uploadToS3 } from "../util/s3"
import MultiSearchSelect from "../components/post/MultiSearchSelect"
import MaxUploadedPhotos from "../components/contest/MaxUploadedPhotos"
import Cropper from "react-easy-crop"
import InputRange from "react-input-range"
import "react-input-range/lib/css/index.css"
import "react-easy-crop/react-easy-crop.css"
import getCroppedImg from "../components/util/cropImage"
import { Slider } from "react-semantic-ui-range"
import "semantic-ui-css/semantic.min.css"
import { uploadContestsThumbImage } from "../util/base64-aws-util"
import moment from "moment"
import MultiSearchSelectPopup from "../components/post/MultiSearchSelectPopup"

const ContestsParticipate = props => {
  const contestId = props.contestId ? props.contestId : props.match.params.contestId;
  const { user } = useContext(AuthContext)
  const [isWarningModalOpen, setWarningModalOpen] = useState(user ? false : true)
  const [ismaxUploadLimitModal, setismaxUploadLimitModal] = useState(false)
  const [previewData, setpreviewData] = useState({})
  const [previewScreen, setpreviewScreen] = useState(false)
  const [recentUploaded, setrecentUploaded] = useState(false)
  const [defaultBike, setDefaultBike] = useState(false)


  const { loading, data: { getContest: { title, photos, imageUrl, sponsors, closingDate } = {} } = {} } = useQuery(FETCH_CONTEST_QUERY, {
    variables: { contestId }
  })
  let myPhotos = []
  if (photos && photos.length) {
    myPhotos = photos.filter(p => p.username == user.username)
  }

  const closeWarningModal = () => {
    props.history.push({
      pathname: `/photo-contests`
    })
  }
  const [errors, setErrors] = useState({})
  const [image, setImage] = useState("")
  let files = []
  const [tempSearch, settempSearch] = useState("")
  const [bikes, setbikes] = useState([])
  const [bikesSelected, setbikesSelected] = useState([])
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)

  const [saveLoading, setsaveLoading] = useState(false)
  const [previewLoading, setpreviewLoading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [imageSrc, setimageSrc] = useState("")
  let aspect = 1
  const [imageBase64Data, setimageBase64Data] = useState("")
  const [croppedAreaPixels, setCroppedAreaPixels] = useState({})
  const [rotation, setRotation] = useState(0)
  const [croupedThumbUlr, setcroupedThumbUlr] = useState("")
  const [imageUploadError, setimageUploadError] = useState(false)

  const { onSubmit, values } = useForm(uploadCallback, {
    imageUrl: "",
    contestId: contestId,
    bikesSelected: [],
  })

  const resetDropZone = () => {
    values.imageUrl = ""
  }

  function uploadCallback() {
    if (image) {
      files.push({ name: `${S3Folders.contests}/${formatFilename(image[0].name)}`, type: image[0].type })
    }

    if (!!files.length) {
      s3Sign()
    }
  }

  const [upload] = useMutation(ADD_CONTEST_PHOTO, {
    update(store, { data: { addPhotoToContest } }) {

      const galleryData = store.readQuery({
        query: FETCH_CONTEST_QUERY,
        variables: { contestId }
      })

      store.writeQuery({
        query: FETCH_CONTEST_QUERY,
        data: {
          getContest: {
            ...galleryData.getContest,
            photos: [addPhotoToContest, ...galleryData.getContest.photos]
          }
        }
      })
      setpreviewData(addPhotoToContest)
      setsaveLoading(false)
      resetDropZone()
      setErrors({})
      setpreviewScreen(true)
      setrecentUploaded(true)
      // props.history.push({
      //     pathname: `/photo-contests/${contestId}`
      // })
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors)
    },
    variables: {
      imageUrl: values.imageUrl,
      contestId: contestId,
      bikeId: bikesSelected.length > 0 ? bikesSelected[0].bikeId : "",
      bikename: bikesSelected.length > 0 ? bikesSelected[0].bikename : "",
      bikethumbUrl: bikesSelected.length > 0 ? bikesSelected[0].thumbUrl : "",
      thumbUrl: values.imageUrl,
      userId: user?.id,
      username: user?.username,
      name: user?.name,
      avatarUrl: user?.avatarUrl
    }
  })

  const [s3Sign] = useMutation(S3_SIGN_MUTATION, {
    update(store, { data: { s3Sign } }) {
      setsaveLoading(true)
      uploadToS3(image, s3Sign).then(function (response) {
        let deletedFiles = []
        if (response) {
          if (response.length) {
            response.map((failedFile) => {
              deletedFiles.push(failedFile.filename)
            })
          }
        }
        if (!deletedFiles.length) {
          setimageUploadError(false)
          values.imageUrl = s3Sign[0].url
          setimageSrc(s3Sign[0].url)
          upload()
          files = []
        } else {
          setimageUploadError(true)
          setsaveLoading(false)
        }
      })
    },
    onError(err) {
      console.log(err)
    },
    variables: { files: files }
  })
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
    //TODO: Another case of blind copy/paste across the platform and not tested! Move to a utility funciton
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

  // useEffect(() => {
  //   if (image.length) {
  //     setimageSrc(URL.createObjectURL(image[0]))
  //   }
  // }, [image])

  const closeMaxUploadModal = () => {
    props.history.push({
      pathname: `/photo-contests/${contestId}`
    })
  }

  const onCropChange = crop => {
    setCrop(crop)
  }

  const onZoomChange = zoom => {
    setZoom(zoom)
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
    showCroppedImage(croppedAreaPixels, imageSrc)
  }
  async function showCroppedImage(croppedAreaPixels, imageSrc) {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      if (imageBase64Data !== croppedImage) {
        setimageBase64Data(croppedImage)
      }
    } catch (e) {
      console.error(e)
    }
  }
  const sliderSettings = {
    min: 1,
    max: 3,
    step: 0.1,
    value: zoom,
    onChange: value => {
      setZoom(value)
    }
  }

  const [perviewUpload] = useMutation(ADD_PREVIEW_PHOTO_CONTEST, {
    update(store, { data: { addPreviewPhotoToContest } }) {
      files = []
      const galleryData = store.readQuery({
        query: FETCH_CONTEST_QUERY,
        variables: { contestId }
      })
      let allPhotos = []
      if (galleryData.getContest.photos) {
        galleryData.getContest.photos.map((p) => {
          if (p.imageUrl == addPreviewPhotoToContest.imageUrl && p.username == addPreviewPhotoToContest.username) {
          } else {
            allPhotos.push(p)
          }
        })
      }
      store.writeQuery({
        query: FETCH_CONTEST_QUERY,
        data: {
          getContest: {
            ...galleryData.getContest,
            photos: [addPreviewPhotoToContest, ...allPhotos],
          }
        }
      })
      setpreviewLoading(false)
      setErrors({})
      props.history.push({
        pathname: `/photo-contests/${contestId}`
      })
      window.location.reload()
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors)
    },
    variables: {
      contestId: contestId,
      imageUrl: previewData.imageUrl,
      thumbUrl: croupedThumbUlr,
    }
  })

  const setPreviewSubmit = () => {
    setpreviewLoading(true)
    uploadThumbImage()
  }

  /* upload profile image to server */
  async function uploadThumbImage() {
    if (imageBase64Data !== "") {
      const imageUpload = await uploadContestsThumbImage(imageBase64Data, formatFilename(image[0].name))
      if (imageUpload) {
        setcroupedThumbUlr(imageUpload)
        perviewUpload()
      } else {
        props.history.push({
          pathname: `/photo-contests/${contestId}`
        })
      }
    }
  }

  const contestDetails = () => {
    if (props.setShowUpload) {
      props.setShowUpload(false)
    } else {
      props.history.push({
        pathname: `/photo-contests/${contestId}`
      })
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [props])

  return (
    <Navigation contests>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          <Container className="pb-90">
            {/*<h1 className="contests-title">{title}</h1>*/}
            {/*<h4 className="contests-close-date">{moment(closingDate).format("YYYY MMM DD")}</h4>*/}
            <Card fluid className="photo-contest create-post-new">
              <Header>
                {/* <Avatar profileUser={user} /> */}
                {!previewScreen ? (
                  <Header.Content>
                    Enter the contest
                    <Header.Subheader>{title}</Header.Subheader>
                  </Header.Content>
                ) : (
                    <Header.Content>
                      Please set the best preview for your photo...
                      <Header.Subheader>A good preview will get you more likes. We will show this on the gallery page of the  <br /> competition.</Header.Subheader>
                    </Header.Content>
                  )}
                <a onClick={() => contestDetails()} className="cancel-btn top-right">
                  Cancel
            </a>
              </Header>
              {!previewScreen && (
                <Form className={(saveLoading ? "loading " : " ") + "post-input form-container"} >

                  <UploadPhoto values={values} setImage={setImage} image={image} />
                  <div className="text-block">
                    <span className="title">Please select the main bike in the photo.</span>

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
                              multiSelect={false}
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
                                if (value.length > 1 && value !== tempSearch) {
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

                  </div>
                  <div className="text-block">
                    <span className="title">Criteria</span>
                    <p className="text-paragraph">
                      Please make sure that your photo meets the criteria outlined in the competition criteria page in this competition.{" "}
                      <Link to={`/photo-contests/${contestId}#criteria`} target="_blank" className="link">See competition criteria here.</Link>
                    </p>
                  </div>
                  <div className="text-block">
                    <span className="title">Terms of Service</span>
                    <p className="text-paragraph">
                      When you enter the competition you agree to our terms of service. {" "}
                      <Link to={"/competition-terms-of-use.html"} target="_blank" className="link">See the Terms of Service here.</Link>
                    </p>
                  </div>
                  <p className="text-center"><Button type="submit" color="red" onClick={onSubmit} disabled={!image || saveLoading}>Agree & Participate</Button></p>

                  {imageUploadError && (
                    <div className="ui error message" style={{ display: "block" }}>
                      <ul className="list">
                        <li>Problem while upload image, please try again</li>
                      </ul>
                    </div>
                  )}
                </Form>
              )}
              {previewScreen && (
                <Form className={(previewLoading ? "loading " : " ") + "post-input form-container contests-preview"}>
                  { image && imageSrc !== "" && (
                    <div className="profile-control">
                      <div className="crop-container">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={aspect}
                          cropShape="rect"
                          showGrid={false}
                          onCropChange={onCropChange}
                          onCropComplete={onCropComplete}
                          onZoomChange={onZoomChange}
                        />
                      </div>
                      <div className="controls">
                        <Slider value={zoom} color="red" settings={sliderSettings} color="red" />
                      </div>
                    </div>
                  )}
                  <p className="text-center">
                    <Button type="button" color="red" onClick={setPreviewSubmit} disabled={imageSrc == "" || previewLoading}>Set Preview</Button>
                  </p>
                </Form>
              )}
            </Card>
            {!recentUploaded && (
              <Modal onClose={closeMaxUploadModal} className="warning-modal" size="small">
                <MaxUploadedPhotos closeModal={closeMaxUploadModal} />
              </Modal>
            )}
          </Container>
        )}
    </Navigation>

  )
}

export default ContestsParticipate
