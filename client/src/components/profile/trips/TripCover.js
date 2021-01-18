import React, { useCallback, useContext, useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { SAVE_TRIP, ADD_UPDATE_TRIP_DETAILS, FECTH_TRIP_QUERY, S3_SIGN_MUTATION } from "../../../common/gql_api_def"
import { S3Folders, uploadFileSizeLimit } from "../../../util/Constants"
import { Button, Dimmer, Loader, Modal } from "semantic-ui-react"
import { AuthContext } from "../../../context/auth"
import Avatar from "../../util/Avatar"
import CustomDropzone from "../../util/CustomDropzone"
import { formatFilename, uploadToS3 } from "../../../util/s3"
import { useHistory } from "react-router-dom"
import {
  SAVE,
  COMMENTS,
  SHARE,
} from "../../../util/user-messages"
import Share from "../../util/Share"
import Cropper from "react-easy-crop"
import "react-input-range/lib/css/index.css"
import "react-easy-crop/react-easy-crop.css"
import getCroppedImg from "../../util/cropImage"
import { Slider } from "react-semantic-ui-range"
import { uploadTripThumbImage } from "../../../util/base64-aws-util"
import NotLoggedInModal from "../../contest/NotLoggedInModal"

const TripCover = ({ tripName, UserDetails }) => {
  const defalutUrl = "https://motomob-test.s3.eu-west-2.amazonaws.com/posts/dx68e-trip-default-cover.png";
  const [imageSrc, setimageSrc] = useState()
  let files = []
  const { user } = useContext(AuthContext)
  const [image, setImage] = useState("")
  const userId = UserDetails.id
  const userName = UserDetails.username
  const FullName = UserDetails.name
  const avatarUrl = UserDetails.avatarUrl
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)
  const [follow, setFollow] = useState(false)
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const url = window.location.href //here the full url is the one we need, unlike in home page
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [previewScreen, setpreviewScreen] = useState(false)
  const [tripData, setTripData] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState({})
  const [imageBase64Data, setimageBase64Data] = useState("")
  const [rotation, setRotation] = useState(0)
  const [previewLoading, setpreviewLoading] = useState(false)
  const [croupedThumbUlr, setcroupedThumbUlr] = useState("")

  const sliderSettings = {
    min: 1,
    max: 3,
    step: 0.1,
    value: zoom,
    onChange: value => {
      setZoom(value)
    }
  }

  const routeChange = userId => {
    let path = `/profile/${userId}`
    history.push(path)
  }
  const { loading, data2 } = useQuery(FECTH_TRIP_QUERY, {
    variables: { userId: userId, tripName: tripName },
    fetchPolicy: "no-cache",
    onCompleted: data => {
      if (data) {
        setIsLoading(false)
        if (data.getTripDetails.length > 0) {
          let tripData = data.getTripDetails[0]
          setTripData(tripData)
          setimageSrc(tripData.coverUrl)
        } else {
          setimageSrc(defalutUrl)
        }
      }
    }
  })

  const [s3Sign] = useMutation(S3_SIGN_MUTATION, {
    variables: { files: files },
    update(store, { data: { s3Sign } }) {
      uploadToS3(image, s3Sign).then(response => {
        setimageSrc(s3Sign[0].url)
        files = []
        upload()
      }).catch(error => {
        console.warn('error:', error);
      })
    },
    onError(err) {
      console.log(err)
    },
  })
  /* set selected Trips Photos */
  const setCoverImage = acceptedFiles => {
    if (acceptedFiles[0].size <= uploadFileSizeLimit) {
      setIsLoading(true)
      setImage(acceptedFiles)
    } else {
      setImage("")
    }
  }

  useEffect(() => {
    if (image && image !== "") {
      files.push({ name: `${S3Folders.posts}/${formatFilename(image[0].name)}`, type: image[0].type })
    }
    if (!!files.length) {
      s3Sign()
    }
  }, [image])

  const [upload] = useMutation(ADD_UPDATE_TRIP_DETAILS, {
    update(store, datass) {
      let newTrip = datass.data.createAndUpdateTrip;
      // setimageSrc(a.coverUrl)
      setIsLoading(false)
      files = []
      setpreviewScreen(true)
    },
    onError(err) {
      console.log(err)
    },
    variables: {
      userId: userId,
      tripName: tripName,
      coverUrl: imageSrc,
      isActive: true,
    }
  })
  let profileUser = {
    avatarUrl: avatarUrl,
    username: userName
  }


  //---call saveTrip mutation
  const [saveTrip] = useMutation(SAVE_TRIP, {
    variables: { tripName: tripName },
    update(store, { data }) {
      let result = data.saveTrip;
      setTripData(result)
      setimageSrc(result.coverUrl)
    }
  })

  function saveAction() {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      setFollow(!follow)
      saveTrip()
    }
  }

  useEffect(() => {
    if (user && tripData && tripData.savedtag) {
      let test = tripData.savedtag
      if (test.includes(user.username)) {
        setFollow(true)
      } else {
        setFollow(false)
      }
    }
  }, [tripData])

  const openShareModal = e => {
    setShareModalOpen(true)
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
  const setPreviewSubmit = () => {
    setpreviewLoading(true)
    uploadThumbImage()
  }

  /* upload profile image to server */
  async function uploadThumbImage() {
    if (imageBase64Data !== "") {
      const imageUpload = await uploadTripThumbImage(imageBase64Data, formatFilename(image[0].name))
      if (imageUpload) {
        setcroupedThumbUlr(imageUpload)
        setIsLoading(true)
        perviewUpload()
      }
    }
  }

  const [perviewUpload] = useMutation(ADD_UPDATE_TRIP_DETAILS, {
    update(store, result) {
      let newTrip = result.data.createAndUpdateTrip;
      setpreviewLoading(false)
      setimageSrc(newTrip.coverUrl)
      setIsLoading(false)
      setImage("")
      files = []
      setpreviewScreen(false)
    },
    onError(err) {
      console.log(err)
    },
    variables: {
      userId: userId,
      tripName: tripName,
      coverUrl: croupedThumbUlr,
      isActive: true,
    }
  })


  const openNotLoggedInModal = () => {
    if (!isWarningModalOpen) {
      setWarningModalOpen(true)
    }
  }
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }
  return (
    <>
      {user ?
        <div className={loading || isLoading ? "loading tripdetails" : "tripdetails"}>
          {previewScreen && imageSrc !== "" ? (
            <>
              <div className="crop-container">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={100 / 31}
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
              <p className="text-center">
                <Button type="button" color="red" onClick={setPreviewSubmit} disabled={imageSrc == "" || previewLoading}>Upload</Button>
              </p>
            </>
          ) :
            <div className="cover">
              {!loading && <>
                <img className="cover-img" src={imageSrc} alt="" />
                <div className="content"> <h3>{tripName}</h3>
                  <div className="d-flex justify-content-between align-items-center comment-action">
                    <div className="profile cursor-pointer" onClick={() => routeChange(userId)}>
                      <Avatar profileUser={profileUser} />
                      <span>{FullName}</span>
                    </div>

                    <div className="share">
                      {follow ? (
                        <span className="svg-icon pointer" onClick={() => saveAction()}>
                          <img src="/assets/images/icons/save-icon.svg" className="align-middle" alt="Like" width="20" height="20" />
                          <span className="align-middle">{SAVE}</span>
                        </span>
                      ) : (
                          <span className="svg-icon pointer action" onClick={() => saveAction()}>
                            <img src="/assets/images/icons/save-white-icon.svg" className="gray-color align-middle" alt="Like" width="20" height="20" />
                            <img src="/assets/images/icons/save-icon.svg" className="red-color align-middle" alt="Like" width="20" height="20" />
                            <span className="align-middle">{SAVE}</span>
                          </span>
                        )}
                      <span className="svg-icon pointer action" onClick={openShareModal}>
                        <img src="/assets/images/icons/share-white-icon.svg" className="gray-color align-middle" alt="Share" width="20" height="20" />
                        <img src="/assets/images/icons/share-icon.svg" className="red-color align-middle" alt="Share" width="20" height="20" />
                        <span className="align-middle">{SHARE}</span>
                      </span>
                    </div>
                  </div>
                  <div className="top">
                    {user.id === userId &&
                      <CustomDropzone multipleUpload={false} acceptedFiles={"image/*"} onDrop={setCoverImage} showStyle={false}>
                        <Button type="button" className="edit-img-btn">Edit Cover Image</Button>
                      </CustomDropzone>
                    }
                  </div>
                </div>
              </>
              }
            </div>
          }
        </div>
        :
        openNotLoggedInModal()
      }
      <Modal onClose={() => setShareModalOpen(false)} open={isShareModalOpen} className="share-modal" size="mini">
        <Share url={url} imageUrl={imageSrc} title={tripName ? tripName : "Motomob.me: Join the community for bikers"} description={"Check out this trip on MotoMob.me"} type={"trip"} onClose={() => setShareModalOpen(false)} />
      </Modal>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default TripCover