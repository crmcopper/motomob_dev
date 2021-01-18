import React, { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/auth"
import { useHistory, useLocation } from "react-router-dom"
import { Form, Button, Grid, Image, Modal, Popup, Dropdown, Dimmer, Header, Input, Icon } from "semantic-ui-react"
import SemanticDatepicker from "react-semantic-ui-datepickers"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import { Link } from "react-router-dom"
import InputRange from "react-input-range"
import "react-input-range/lib/css/index.css"
import RichTextEditor from "../util/RichTextEditor"
import { useForm } from "../../util/hooks"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { FETCH_BIKE_BY_NAME_QUERY, S3_SIGN_MUTATION, FETCH_POSTS_QUERY, CREATE_COMMON_POST_MUTATION, SEARCH_TRIP_BY_NAME_QUERY } from "../../common/gql_api_def"
import moment from "moment"
import DropzoneUploadDisplay from "../util/DropzoneUploadDisplay"
import CustomDropzone from "../util/CustomDropzone"
import { formatFilename, uploadToS3 } from "../../util/s3"
import { S3Folders, gpxFileUploadLimit, fetchLimit, uploadFileSizeLimit } from "../../util/Constants"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import TextareaAutosize from "react-textarea-autosize"
import { getNewBody } from "../../util/base64-aws-util"
import MultiSearchSelectPopup from "./MultiSearchSelectPopup"
import SearchSelectTripPopup from "./SearchSelectTripPopup"
import { ImagesPixelToPercent } from "../../util/ImagesPixelToPercent"
import { validateBikePost, validateTripPost, validateBasicPost } from "../../util/validators"
import Autocomplete from "react-google-autocomplete"
import ReactHtmlParser from "react-html-parser"
import { ReactTinyLink } from "react-tiny-link"

const styles = {
  padding: "7.5px 1rem"
}
const friendOptions = []

const CommonPost = ({ post, postType, onClickSharePost, tabIndex }) => {
  const history = useHistory()
  const [postId, setPostId] = useState("")
  const [tempSearch, settempSearch] = useState("")
  const [errors, setErrors] = useState({})
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)
  const [bikes, setbikes] = useState([])
  const [pictureUrls, setpictureUrls] = useState([])
  const [when, setwhen] = useState("")
  const [gpxFiles, setgpxFiles] = useState([])
  const [bikesSelected, setbikesSelected] = useState([])
  const [selectedTripsImages, setselectedTripsImages] = useState([])
  const [selectedGpxFiles, setSelectedGpxFiles] = useState([])
  const [files, setFiles] = useState([])
  const [filesGpx, setFilesGpx] = useState([])
  const [viewAllImages, setviewAllImages] = useState(false)
  const [viewAllImagesButton, setviewAllImagesButton] = useState(false)
  const [photoGridLoader, setphotoGridLoader] = useState(false)
  const [gpxGridLoader, setgpxGridLoader] = useState(false)
  const [imagesForGrid, setImagesForGrid] = useState([])
  let filesToUpload = []
  let uploadFiles = []
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [editPostPictureUrls, setEditPostPictureUrls] = useState([])
  const [editGpxFiles, setEditGpxFiles] = useState([])
  const [submitLoader, setSubmitLoader] = useState(false)
  const [allLocation, setallLocation] = useState([])
  const [skipedLargeImages, setskipedLargeImages] = useState(false)
  const [skipedLargeGpxFiles, setskipedLargeGpxFiles] = useState(false)
  const [postag, setPostag] = useState([])
  const [postNewType, setPostNewType] = useState(postType ? postType : "BikePost")
  const { user } = useContext(AuthContext)
  const [cardContent, setCardContent] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const [open, setOpen] = useState(false)
  const [defaultBike, setDefaultBike] = useState(false)
  const [selectedTripDetails, setselectedTripDetails] = useState([])
  const [latestAdded, setLatestAdded] = useState(null)
  const [tempTripSearch, setTempTripSearch] = useState("")

  /** For cancle share and update */
  const cancleShare = () => {
    onClickSharePost()
    //history.push("/")
  }

  useEffect(() => {
    if (tabIndex === "TripPost") {
      if (document.getElementById("createTrip")) {
        document.getElementById("createTrip").click()
      }
      setPostNewType(tabIndex)
    }
  }, [tabIndex])

  useEffect(() => {
    if (post) {
      if (post.tripName) {
        let main = [
          {
            id: post.id,
            tripName: post.tripName
          }
        ]
        setselectedTripDetails(main)
      }
      // settitle(post.title)
      values.title = post.title
      values.tripName = post.tripName
      if (post.postType === "BasicPost") {
        //values.body = post.body
        let sahreUpdateCardBody = post.body.split('<a class="sc-bZQynM IDGvz react_tinylink_card" ')
        values.body = sahreUpdateCardBody[0] ? sahreUpdateCardBody[0] : ""
        if (sahreUpdateCardBody[1]) {
          setCardContent('<a class="sc-bZQynM IDGvz react_tinylink_card" ' + sahreUpdateCardBody[1].replace("display: none;", ""))
        }
      } else {
        values.body = post.body
      }

      // setbody(post.body)
      setPostId(post.id)
      values.postId = post.id
      setPostNewType(post.postType)
      if (post.bikes) {
        const changeKey = post.bikes.map(({ thumbUrl, bikeId, bikename }) => ({ image: thumbUrl, bikeId: bikeId, bikename: bikename }))

        setbikes(changeKey)
        setbikesSelected(post.bikes)
      } else {
        setbikes([])
        setbikesSelected([])
      }
      post.pictureUrls ? setEditPostPictureUrls(post.pictureUrls) : setEditPostPictureUrls([])
      if (post.pictureUrls.length >= 5) {
        setviewAllImagesButton(true)
      }
      let allImages = []
      if (!!post.pictureUrls.length) {
        post.pictureUrls.map(img => allImages.push({ path: img, imageType: "oldUploaded" }))
      }
      setImagesForGrid(allImages)

      /** if type is tripPost then only this will be added */

      //TODO: Horrendous coding! What's the point? Have to revert the gql load in order to get this to work. Why is an edit of share /update failing on location???
      if (post.postType === "TripPost") {
        const locationConvertInArray = Object.values(post.location)
        setallLocation(locationConvertInArray)
        if (post.when !== "Invalid date") {
          post.when ? setwhen(moment(post.when, "YYYY-MM-DD").toDate()) : setwhen("")
          values.when = post.when ? moment(post.when, "YYYY-MM-DD").toDate() : setwhen("")
        }
        // post.days ? setdays(post.days) : setdays(0)
        values.days = post.days
        // post.offRoadPercentage ? setoffRoadPercentage(post.offRoadPercentage) : setoffRoadPercentage(0)
        values.offRoadPercentage = post.offRoadPercentage
        post.gpxFiles ? setEditGpxFiles(post.gpxFiles) : setEditGpxFiles([])
      }
      if (post.postType !== "BasicPost") {
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
          setPostag(tempSelected)
        }
      }
    }
  }, [post])

  /* create trip post form sumbmit and callback */
  const { onChangeCustom, onChange, onSubmit, values } = useForm(createCommonPostCallback, {
    title: "",
    body: "",
    bikes: [],
    pictureUrls: [],
    location: [],
    when: "",
    days: "",
    offRoadPercentage: 0,
    gpxFiles: [],
    additionalTag: ""
  })

  /* received bike searched results */
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

  const usertag = user?.usertag
  const userId = user?.id
  const username = user?.username
  const name = user?.name
  const avatarUrl = user?.avatarUrl
  const userBike = user?.bikes
  const [allTrips, setAllTrips] = useState([])

  /*Trip Create and search  */
  const { datamain } = useQuery(SEARCH_TRIP_BY_NAME_QUERY, {
    variables: { userId: userId },
    fetchPolicy: "no-cache",
    onCompleted: result => {
      if (post && postId && post.tripName) {
        let a = result.searchTrips;
        let selectedTrip = a.filter(function (e, index, hotels) {
          return e.tripName === post.tripName
        });
        let data = [];
        data.push(selectedTrip[0])
        setAllTrips(data)
      } else {
        removeDuplicate(result.searchTrips)
      }
    }
  })

  const [mainTripList, { dt }] = useLazyQuery(SEARCH_TRIP_BY_NAME_QUERY, {
    variables: { userId: userId },
    fetchPolicy: "no-cache",
    onCompleted: result => {
      if (latestAdded && latestAdded.length > 0) {
        const filteredData = latestAdded.filter(element => {
          return element.tripName.toLowerCase().includes(tempTripSearch)
        })
        var newStatuses = [...filteredData, ...result.searchTrips]
        removeDuplicate(newStatuses)
      } else {
        removeDuplicate(result.searchTrips)
      }
    }
  })

  const removeDuplicate = result => {
    var elements = result.reduce(function (previous, current) {
      var object = previous.filter(object => object.tripName === current.tripName)
      if (object.length == 0) {
        previous.push(current)
      }
      return previous
    }, [])
    setAllTrips(elements)
  }
  /*end Trip Create and search  */

  /* save data of create Trip Post */
  const [createCommonPost, { loading, data1 }] = useMutation(CREATE_COMMON_POST_MUTATION, {
    refetchQueries: [
      {
        query: FETCH_POSTS_QUERY,
        variables: { cursor: "", usertag: usertag, limit: fetchLimit, type: "posts" }
      }
    ],
    awaitRefetchQueries: true,
    onCompleted: data => {
      setSubmitLoader(false)
      if (onClickSharePost) {
        onClickSharePost()
      }
      if (postNewType !== "BasicPost") {
        history.push(`/posts/${data.createCommonPost.id}`)
      }
    },
    onError(err) {
      setSubmitLoader(false)
      if (err) {
        setErrors(err.graphQLErrors[0].extensions.exception.errors)
      }
    },
    variables: values
  })

  /* upload selected images to s3Bucket */
  const [s3Sign] = useMutation(S3_SIGN_MUTATION, {
    update(store, { data: { s3Sign } }) {
      uploadFilesToS3(uploadFiles, s3Sign)
    },
    onError(err) {
      console.log(err)
    },
    variables: { files: filesToUpload }
  })

  /* upload files to s3 */
  async function uploadFilesToS3(uploadFiles, s3Sign) {
    uploadToS3(uploadFiles, s3Sign).then(function (response) {
      let deletedFiles = []
      if (response) {
        if (response.length) {
          response.map(failedFile => {
            deletedFiles.push(failedFile.filename)
          })
        }
      }
      let tempPictureUrls = []
      if (postNewType === "BasicPost") {
        pictureUrls.map(img => {
          if (!deletedFiles.includes(img)) {
            tempPictureUrls.push(img)
          }
        })
        tempPictureUrls = tempPictureUrls.sort(function (a, b) {
          return b.split("/").length - a.split("/").length
        })
      } else {
        imagesForGrid.map(img => {
          if (img.imageType && img.imageType === "oldUploaded") {
            if (!deletedFiles.includes(img.path)) {
              tempPictureUrls.push(img.path)
            }
          } else {
            if (!deletedFiles.includes(img.imagePath)) {
              tempPictureUrls.push(img.imagePath)
            }
          }
        })
      }
      let tempGpxFiles = []
      gpxFiles.map(file => {
        if (!deletedFiles.includes(file)) {
          tempGpxFiles.push(file)
        }
      })

      setpictureUrls(tempPictureUrls)
      values.pictureUrls = tempPictureUrls
      setgpxFiles(tempGpxFiles)
      values.gpxFiles = tempGpxFiles

      createCommonPost()

      setFiles([])
      setFilesGpx([])
      filesToUpload = []
      uploadFiles = []
    })
  }

  /* create Trip Post Callback function */
  async function createCommonPostCallback() {
    try {
      setSubmitLoader(true)
      //Give time for the message parsing (base64 to upload)
      if (files?.length) {
        let _file
        let _gridImages = imagesForGrid
        files.map((file, key) => {
          _file = { name: `${S3Folders.posts}/${formatFilename(file.name)}`, type: file.type }
          filesToUpload.push(_file)
          pictureUrls[key] = _file.name
          uploadFiles.push(file)
          _gridImages.map(img => {
            if (img.name === file.name) {
              img.imagePath = _file.name
            }
          })
        })
        setImagesForGrid(_gridImages)
      }
      if (filesGpx?.length) {
        let _file
        filesGpx.map((file, key) => {
          _file = { name: `${S3Folders.posts}/${formatFilename(file.name)}`, type: file.type }
          filesToUpload.push(_file)
          gpxFiles[key] = _file.name
          uploadFiles.push(file)
        })
      }
      if (uploadFiles.length !== 0) {
        s3Sign()
      }

      //replace all occurrences of base64 into links....
      if (cardContent) {
        if (document.getElementsByClassName("react_tinylink_card")) {
          let reactTinyTotal = document.getElementsByClassName("react_tinylink_card").length

          let NewText = document.getElementsByClassName("react_tinylink_card")[reactTinyTotal - 1].outerHTML.replace("display: none;", "")

          values.body = values.body + " " + NewText

          var exp = /((href|src)=["']|)(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
          values.body = values.body.replace(exp, function () {
            return arguments[1] ? arguments[0] : '<a href="' + arguments[3] + '">' + arguments[3] + "</a>"
          })
        }
      }

      let { nbody, previewMedia, embedPicture } = await getNewBody(values.body)
      values.body = nbody

      if (postNewType !== "BasicPost") {
        values.body = await ImagesPixelToPercent(values.body)
      }
      values.embedPicture = embedPicture
      values.previewMedia = previewMedia
      values.previewBody = nbody
        .replace(/<\/p>/g, "...")
        .replace(/<(.|\n)*?>/g, "")
        .slice(0, 280)
      if (values.previewBody === "...") {
        values.previewBody = ""
      }
      if (postId) {
        const changeKey = bikes.map(({ image, bikeId, bikename }) => ({ thumbUrl: image, bikeId: bikeId, bikename: bikename }))
        setbikesSelected(changeKey)
        values.bikes = changeKey
        editPostPictureUrls.map((image, i) => {
          pictureUrls.push(image)
        })

        editGpxFiles.map((gpx, i) => {
          gpxFiles.push(gpx)
        })
      } else {
        values.bikes = bikesSelected
      }
      values.postType = postNewType
      values.userId = userId
      values.username = username
      values.name = name
      values.avatarUrl = avatarUrl
      values.userbikes = userBike
      values.when = values.when ? moment(values.when).format("YYYY-MM-DD") : ""
      values.days = Number(values.days)
      if (postNewType === "BasicPost") {
        values.pictureUrls = pictureUrls
      } else {
        let tempPictureUrls = []
        imagesForGrid.map(img => {
          if (img.imageType && img.imageType === "oldUploaded") {
            tempPictureUrls.push(img.path)
          } else {
            tempPictureUrls.push(img.imagePath)
          }
        })
        values.pictureUrls = tempPictureUrls
      }
      values.gpxFiles = gpxFiles
      if (cardContent) {
        let reactTinyTotal = document.getElementsByClassName("react_tinylink_card").length
        values.previewMedia = `<img class="previewMediaImg" src=${document.getElementsByClassName("react_tinylink_card_media")[0].getAttribute("src")} />`
      }
      //values.previewMedia = previewImage ? `<img src=${previewImage} />` : previewMedia
      values.additionalTag = values.postag ? values.postag.join(",") : ""

      //Ensure the "higher" post elements are blanked out (Trip -> Bike -> Basic)
      if (postNewType === "BikePost") {
        values.location = []
        values.when = ""
        values.days = 0
        values.offRoadPercentage = 0
        values.gpxFiles = []
      } else if (postNewType === "BasicPost") {
        values.location = []
        values.when = ""
        values.days = 0
        values.offRoadPercentage = 0
        values.gpxFiles = []
        values.title = ""
        values.bikes = []
        values.additionalTag = ""
        // values.pictureUrls = []
      } else {
        values.location = allLocation
        values.tripName = selectedTripDetails.length > 0 ? selectedTripDetails[0].tripName : ""
      }

      if (uploadFiles.length === 0) {
        createCommonPost()
      }
    } catch (err) {
      setSubmitLoader(false)
      console.log(err)
    }
  }

  /* set selected Trips Photos */
  const setTripsPhotos = images => {
    let largeImages = images.filter(f => f.size > uploadFileSizeLimit)
    images = images.filter(f => f.size <= uploadFileSizeLimit)
    if (postNewType !== "BasicPost") {
      setImagesForGrid(imagesForGrid.concat(images))
    }
    let allImages = files.concat(images)
    setselectedTripsImages(allImages)
    let tempProfileUrls = []
    allImages.forEach(file => {
      tempProfileUrls.push(`${file.name}`)
    })
    setselectedTripsImages(allImages)
    setpictureUrls(tempProfileUrls)
    setFiles(allImages)
    if (postNewType === "BasicPost" && editPostPictureUrls.length + allImages.length >= 5) {
      if (!viewAllImagesButton) {
        setviewAllImagesButton(true)
      }
    }
    setphotoGridLoader(true)
    setTimeout(function () {
      setphotoGridLoader(false)
    }, 1000)

    if (largeImages && largeImages.length !== 0) {
      if (!skipedLargeImages) {
        setskipedLargeImages(true)
      }
    } else {
      if (skipedLargeImages) {
        setskipedLargeImages(false)
      }
    }
    setOpen(true)
  }

  /* set selected gpx photos */
  const setTripsGpxFile = gpxfiles => {
    let files = gpxfiles.filter(f => f.size <= uploadFileSizeLimit)
    let largeFiles = files.filter(f => f.size > uploadFileSizeLimit)
    let allGpxFiles = filesGpx.concat(files)
    let limit = gpxFileUploadLimit - editGpxFiles.length
    allGpxFiles = allGpxFiles.slice(0, limit)
    let tempGpxFiles = []
    allGpxFiles.forEach(file => {
      tempGpxFiles.push(`${file.name}`)
    })
    setgpxFiles(tempGpxFiles)
    setFilesGpx(allGpxFiles)
    setSelectedGpxFiles(allGpxFiles)
    setgpxGridLoader(true)
    setTimeout(function () {
      setgpxGridLoader(false)
    }, 1000)
    if (largeFiles && largeFiles.length !== 0) {
      if (!skipedLargeGpxFiles) {
        setskipedLargeGpxFiles(true)
      }
    } else {
      if (skipedLargeGpxFiles) {
        setskipedLargeGpxFiles(false)
      }
    }
    setOpen(true)
  }

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }
  /* delete selected gallary images */
  const deleteImage = editpictureUrl => {
    const convertInArray = Object.values(editPostPictureUrls)
    if (convertInArray.find(selectedPic => selectedPic === editpictureUrl)) {
      convertInArray.map((selectedPic, key) => {
        if (selectedPic === editpictureUrl) {
          convertInArray.splice(key, 1)
        }
      })
      setEditPostPictureUrls([...convertInArray])
      if (selectedTripsImages.length + editPostPictureUrls.length === 0) {
        setviewAllImagesButton(false)
        setviewAllImages(false)
      } else if (postNewType === "BasicPost" && selectedTripsImages.length + editPostPictureUrls.length <= 5 && !viewAllImages) {
        setviewAllImagesButton(false)
      }
      if (postNewType !== "BasicPost") {
        const gridArray = Object.values(imagesForGrid)
        imagesForGrid.map((selectedPic, key) => {
          if (selectedPic.imageType === "oldUploaded" && selectedPic.path === editpictureUrl) {
            gridArray.splice(key, 1)
          }
        })
        setImagesForGrid(gridArray)
      }
    }
  }

  /* delete selected gallary images */
  const deleteShareImage = selectedTripImage => {
    const convertInArray = Object.values(selectedTripsImages)
    if (convertInArray.find(selectedPic => selectedPic === selectedTripImage)) {
      convertInArray.map((selectedPic, key) => {
        if (selectedPic === selectedTripImage) {
          convertInArray.splice(key, 1)
        }
      })
      setselectedTripsImages([...convertInArray])
      setFiles([...convertInArray])
      setpictureUrls([...convertInArray])
      if (selectedTripsImages.length + editPostPictureUrls.length === 0) {
        setviewAllImagesButton(false)
        setviewAllImages(false)
      } else if (postNewType === "BasicPost" && selectedTripsImages.length + editPostPictureUrls.length <= 5 && !viewAllImages) {
        setviewAllImagesButton(false)
      }
      if (postNewType !== "BasicPost") {
        const gridArray = Object.values(imagesForGrid)
        imagesForGrid.map((selectedPic, key) => {
          if (selectedPic === selectedTripImage) {
            gridArray.splice(key, 1)
          }
        })
        setImagesForGrid(gridArray)
      }
    }
  }

  /* delete GPX files */
  const deleteSelectedGpxFile = gpxUrl => {
    const convertInArray = Object.values(selectedGpxFiles)
    if (convertInArray.find(selectedGpx => selectedGpx === gpxUrl)) {
      let tempGpxFiles = []
      convertInArray.map((selectedGpx, key) => {
        if (selectedGpx === gpxUrl) {
          convertInArray.splice(key, 1)
        } else {
          tempGpxFiles.push(`${selectedGpx.name}`)
        }
      })
      setSelectedGpxFiles([...convertInArray])
      setgpxFiles(tempGpxFiles)
      setFilesGpx([...convertInArray])
    }
  }

  /* delete GPX files */
  const deleteGpx = gpxUrl => {
    const convertInArray = Object.values(editGpxFiles)
    if (convertInArray.find(selectedGpx => selectedGpx === gpxUrl)) {
      convertInArray.map((selectedGpx, key) => {
        if (selectedGpx === gpxUrl) {
          convertInArray.splice(key, 1)
        }
      })
      setEditGpxFiles([...convertInArray])
    }
  }

  /* swap dragged image */
  const swapImages = (imgKey, type) => {
    if (imgKey && imagesForGrid[imgKey]) {
      let original = imagesForGrid[0]
      let newimage = imagesForGrid[imgKey]
      let pictures = []
      imagesForGrid.map((p, key) => {
        if (key === 0) {
          pictures.push(newimage)
        } else if (key === imgKey) {
          pictures.push(original)
        } else {
          pictures.push(p)
        }
      })
      setImagesForGrid(pictures)
    }
  }

  useEffect(() => {
    if (document.querySelector(".error-message")) {
      var topOfElement = document.querySelector(".error-message").offsetTop - 10
      window.scroll({ top: topOfElement, behavior: "auto" })
    }
  }, [errors])

  /* submit form */
  const submitForm = () => {
    if (postNewType === "BikePost") {
      const { valid, errors } = validateBikePost(values.title, values.body, bikes)
      if (!valid) {
        setErrors(errors)
      } else {
        onSubmit()
      }
    } else if (postNewType === "TripPost") {
      const { valid, errors } = validateTripPost(
        values.title,
        values.body,
        bikes,
        allLocation,
        values.when ? moment(values.when).format("YYYY-MM-DD") : "",
        values.days ? parseInt(values.days) : 0
      )
      if (!valid) {
        setErrors(errors)
      } else {
        onSubmit()
      }
    } else {
      const { valid, errors } = validateBasicPost(values.body)
      if (!valid) {
        setErrors(errors)
      } else {
        onSubmit()
      }
    }
  }
  const viewAllButtonClick = () => {
    setviewAllImages(!viewAllImages)
    setphotoGridLoader(true)
    setTimeout(function () {
      setphotoGridLoader(false)
    }, 1000)
  }

  const closeLocationPopup = () => {
    if (document.querySelector(".add-locations")) {
      document.querySelector(".add-locations").click()
    }
  }

  const checkForLink = bodyContent => {
    var urlRegex = /(http(s|)?:\/\/[^\s]+)/g
    let allUrls = []
    bodyContent.replace(urlRegex, function (url) {
      allUrls.push(url)
    })

    if (allUrls.length) {
      //crowlLink({ variables: { link: allUrls[0] } })
      //The link comes in with <p> at the end, get rid of it
      let url = allUrls[0].split("<")[0].replace('"', "")
      let card = <ReactTinyLink cardSize="large" showGraphic="false" maxLine="2" minLine="1" url={url} />
      //setPreviewImage(card)

      setCardContent(card)
    } else {
      setCardContent("")
    }
  }

  const addNewTempTrip = details => {
    let seleted = []
    seleted.push(details)
    setselectedTripDetails(seleted)
    let allNewAdded = latestAdded ? latestAdded : []
    allNewAdded.push(details)
    setLatestAdded(allNewAdded)
  }
  const selectTrip = trip => {
    if (selectedTripDetails.find(selectedBike => selectedBike.tripName === trip.tripName)) {
      selectedTripDetails.map((selectedBike, key) => {
        if (selectedBike.tripName === trip.tripName) {
          selectedTripDetails.splice(key, 1)
          if (post && postId) {
            allTrips.map((t, key) => {
              if (post.tripName === trip.tripName) {
                allTrips.splice(key, 1)
              }
            })
          }
        }
      })
      setAllTrips([...allTrips])
      setselectedTripDetails([...selectedTripDetails])
    } else {
      let tripSelected = []
      tripSelected.push(trip)
      setselectedTripDetails(tripSelected)
    }
  }
  const linkPost = () => {
    if (postId) {
      history.push(`/posts/${postId}`)
    } else {
      history.push('/')
    }
  }
  return (
    <>
      <Form onSubmit={submitForm} className={(submitLoader || loading ? "loading " : " ") + "post-input bike-post-input form-container"}>
        {postNewType !== "BasicPost" ? (
          <>
            <Link className="cancel-btn top-right" onClick={() => linkPost()}>
              Cancel
              </Link>
            <Grid>
              <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                <label>What is this post about?</label>
                <p className="text-light">Are you writing about a bike or a trip?</p>
              </Grid.Column>
              <Grid.Column mobile={16} tablet={10} computer={11}>
                <div className="field radio-bx">
                  <div className={(postNewType === "BikePost" ? "checked " : "") + "ui radio checkbox"} onChange={() => setPostNewType("BikePost")}>
                    <input
                      className="hidden"
                      name="tab"
                      readOnly=""
                      id="createBike"
                      tabIndex="0"
                      type="radio"
                      value="Bike"
                      defaultChecked={postNewType === "BikePost" ? true : false}
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
                  <div className={(postNewType === "TripPost" ? "checked " : "") + " ui radio checkbox"} onChange={() => setPostNewType("TripPost")}>
                    <input
                      className="hidden"
                      name="tab"
                      readOnly=""
                      id="createTrip"
                      tabIndex="0"
                      type="radio"
                      value="Trip"
                      defaultChecked={postNewType === "TripPost" ? true : false}
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

            {postNewType === "TripPost" && (
              <Grid>
                <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                  <label>Select Trip</label>
                  <p className="text-light">You can add this story to an existing trip or create a new trip. </p>
                </Grid.Column>
                <Grid.Column mobile={16} tablet={8} computer={6}>
                  <div className="add-trip-bx">
                    <Popup
                      content={
                        <SearchSelectTripPopup
                          searchable={true}
                          showTags={false}
                          multiSelect={false}
                          onSelect={value => {
                            selectTrip(value)
                          }}
                          selected={selectedTripDetails}
                          options={allTrips}
                          placeholder="Search or Add Trip Name"
                          onTripSearchChange={value => {
                            setTempTripSearch(value)
                            mainTripList({ variables: { tripName: value, userId: userId } })
                          }}

                          addNewTempTrip={addNewTempTrip}
                          error={errors?.bikes ? true : false}
                        />
                      }
                      on="click"
                      pinned
                      position="bottom left"
                      className="search-bike-popup select-tip"
                      trigger={
                        <span className={"add-trip"} title={selectedTripDetails.length > 0 ? selectedTripDetails[0].tripName : ""}>
                          <Form.Input
                            type="text"
                            fluid
                            readOnly
                            value={selectedTripDetails.length > 0 ? selectedTripDetails[0].tripName : ""}
                            placeholder="Select Trip"
                            icon="angle down"
                          />
                        </span>
                      }
                      on="click"
                    />
                    {
                      selectedTripDetails.length > 0 &&
                      <span
                        onClick={(e) => { e.preventDefault(); setselectedTripDetails([]) }}
                        className="delete-trip"
                      >
                        <img src="/assets/images/icons/close-tag.svg" alt="Close" width="11" height="11" />
                      </span>
                    }
                  </div>
                </Grid.Column>
              </Grid>
            )}
            <Grid>
              <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                <label>Select bike(s)</label>
                <p className="text-light">Select all the bikes related to this post</p>
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
                            }
                            setbikes(bikes)
                            setbikesSelected(bikesSelected)
                            setOpen(true)
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
                      className="search-bike-popup photo-contest"
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
            {postNewType === "TripPost" && (
              <>
                <Grid>
                  <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                    <label>Select location(s)</label>
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
                                  //value={values.location}
                                  name="location"
                                  id="locationList"
                                  //onChange={onChange}
                                  onKeyDown={event => {
                                    //Supress the enter key so that we dotn submit the form by mistake
                                    if (event.keyCode === 13) {
                                      event.preventDefault()
                                    }
                                  }}
                                  onPlaceSelected={place => {
                                    if (place.formatted_address) {
                                      onChangeCustom(place, "", "location")

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
                                  onChange={(event, val) => {
                                    onChangeCustom(event, val, "location")
                                    setOpen(true)
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
                              className={errors && errors.location ? "add-locations add-bike-rounded-button error" : "add-locations add-bike-rounded-button"}
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
                    {errors?.location && <span className="error-message">{errors.location}</span>}
                  </Grid.Column>
                </Grid>
                <Grid>
                  <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                    <label>Start date of your trip</label>
                    <p className="text-light">When did you start your trip?</p>
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={6}>
                    <SemanticDatepicker
                      placeholder="YYYY-MM-DD"
                      format="YYYY-MM-DD"
                      clearIcon={false}
                      icon={
                        <span className="svg-icon">
                          <img src="/assets/images/icons/gray/date-calender.svg" className="gray-color" alt="Calender" width="25" height="25" />
                          <img src="/assets/images/icons/date-calender.svg" className="red-color" alt="Calender" width="25" height="25" />
                        </span>
                      }
                      onChange={(e, date) => {
                        values.when = date.value
                        setOpen(true)
                      }}
                      value={when ? when : null}
                      className={errors?.when ? "error" : ""}
                    />
                    {errors?.when && <span className="error-message">{errors.when}</span>}
                  </Grid.Column>
                </Grid>
                <Grid>
                  <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                    <label>How many days?</label>
                    <p className="text-light">How long was your trip in days?</p>
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={6}>
                    <Form.Input
                      placeholder="How many days?"
                      type="text"
                      name="days"
                      value={values.days !== 0 ? values.days : ""}
                      onChange={e => {
                        onChange(e)
                        setOpen(true)
                      }}
                      className={errors && errors.days ? "error" : ""}
                      maxLength={3}
                    />
                    {errors?.days && <span className="error-message">{errors.days}</span>}
                  </Grid.Column>
                </Grid>
              </>
            )}
            {postNewType === "TripPost" && (
              <Grid>
                <Grid.Column mobile={16} tablet={6} computer={5} verticalAlign="middle">
                  <label>How much of the trip was off-road?</label>
                  <p className="text-light">Select the % of your trip that was off-road. Select 0% if you were always on-road.</p>
                </Grid.Column>
                <Grid.Column mobile={16} tablet={8} computer={6}>
                  <Form.Field className={values.offRoadPercentage === 0 ? "left-0" : values.offRoadPercentage === 100 ? "left-100" : ""}>
                    <InputRange
                      maxValue={100}
                      minValue={0}
                      step={10}
                      formatLabel={value => `${values.offRoadPercentage}%`}
                      value={values.offRoadPercentage}
                      onChange={(event, val) => {
                        onChangeCustom(event, val, "offRoadPercentage")
                        setOpen(true)
                      }}
                      error={errors?.setoffRoadPercentage}
                    />
                    <div className="d-flex justify-content-between input-range-label">
                      <label>0%</label>
                      <label>100%</label>
                    </div>
                  </Form.Field>
                </Grid.Column>
                <Grid.Column mobile={16} tablet={8} computer={2}>
                  <label className="text-small">Off-road</label>
                  <Form.Input value={values.offRoadPercentage + "%"} readOnly disabled />
                </Grid.Column>
                <Grid.Column mobile={16} tablet={8} computer={2}>
                  <label className="text-small">On-road</label>
                  <Form.Input value={100 - values.offRoadPercentage + "%"} readOnly disabled />
                </Grid.Column>
              </Grid>
            )}
            <Grid>
              <Grid.Column computer={16} verticalAlign="middle">
                <TextareaAutosize
                  type="text"
                  placeholder="The post title goes here. Make sure it is catchy..."
                  name="title"
                  className={errors && errors.title ? "error fixsize" : "fixsize"}
                  error={errors?.title}
                  value={values.title}
                  onChange={e => {
                    onChange(e)
                    setOpen(true)
                  }}
                  style={styles}
                  rows="1"
                />
                {errors?.title && <span className="error-message">{errors.title}</span>}
              </Grid.Column>
            </Grid>
            <Form.Field className={errors && errors.body ? "error" : ""}>
              <RichTextEditor
                placeholder="Write your post here. You can add images and video to make the post super engaging."
                onBodyChange={bodyOfEditor => {
                  values.body = bodyOfEditor
                  setOpen(true)
                }}
                value={values.body}
                error={errors?.body ? true : false}
              />
              {errors?.body && <span className="error-message">{errors.body}</span>}
            </Form.Field>
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
            <Grid>
              <Grid.Column computer={16} verticalAlign="middle">
                <label>Image Gallery</label>
                <p className="text-light">Add all your photos here. We will display this as a slideshow at the top of your post.</p>
                <CustomDropzone acceptedFiles={"image/*"} onDrop={setTripsPhotos} showStyle={true}>
                  <Image src="/assets/images/icons/image-upload-icon.svg" alt="Upload image"></Image>
                  <div className="drop-label">
                    Drop your image here, or <span className="text-red">Browse</span>
                  </div>
                  <em>Supports JPG, PNG</em>
                </CustomDropzone>
                {skipedLargeImages && <span className="error-message">Sorry, only files under 10MB is allowed.</span>}
                <Dimmer.Dimmable dimmed={photoGridLoader} className="photo-grid-loader">
                  <Dimmer active={photoGridLoader} verticalAlign="top">
                    <Header as="h2" icon inverted>
                      Loading...
                    </Header>
                  </Dimmer>
                  <p className="text-center">You can change the main image by clicking on any other image.</p>
                  {(!!editPostPictureUrls.length || !!selectedTripsImages.length) && (
                    <Grid className="bike-post-grid" columns={5}>
                      {imagesForGrid &&
                        !!imagesForGrid.length &&
                        imagesForGrid.map((img, key) => (
                          <Grid.Column key={key}>
                            <div className={key !== 0 ? "thumb-img" : "grid-first-img thumb-img"}>
                              {img.imageType === "oldUploaded" ? <Image src={img.path} /> : <DropzoneUploadDisplay imageUrl={img} />}
                              <span
                                className="close-icon"
                                onClick={e => {
                                  e.preventDefault()
                                  if (img.imageType === "oldUploaded") {
                                    deleteImage(img.path)
                                  } else {
                                    deleteShareImage(img)
                                  }
                                }}
                              >
                                <img src="/assets/images/close.svg" alt="Close" width="11" height="11" />
                              </span>
                              {key !== 0 ? (
                                <div className="overlay-block" onClick={() => swapImages(key, img.imageType)}>
                                  Click to set as main image
                                </div>
                              ) : (
                                  <div className="overlay-main">Main Image</div>
                                )}
                            </div>
                          </Grid.Column>
                        ))}
                    </Grid>
                  )}
                </Dimmer.Dimmable>
              </Grid.Column>
            </Grid>
            {postNewType === "TripPost" && (
              <Grid>
                <Grid.Column computer={16} verticalAlign="middle">
                  <label>Your tracks (GPX files)</label>
                  <p className="text-light">You can upload the GPX file of your track here so others can download and follow your track.</p>
                  <CustomDropzone acceptedFiles={".gpx"} onDrop={setTripsGpxFile} multipleUpload={true} maxFiles={2} showStyle={true}>
                    <Image src="/assets/images/icons/image-upload-icon.svg" alt="Upload image"></Image>
                    <div className="drop-label">
                      Drop your tracks here, or <span className="text-red">Browse</span>
                    </div>
                    <em>Supports: .gpx</em>
                  </CustomDropzone>
                  {skipedLargeGpxFiles && <span className="error-message">Sorry, only files under 10MB is allowed.</span>}
                  <Dimmer.Dimmable dimmed={gpxGridLoader} className="photo-grid-loader">
                    <Dimmer active={gpxGridLoader} verticalAlign="top">
                      <Header as="h2" icon inverted>
                        Loading...
                      </Header>
                    </Dimmer>
                    <Grid className="bike-post-grid" columns={5}>
                      {!!selectedGpxFiles.length &&
                        selectedGpxFiles.map((selectedGpxfile, key) => {
                          let displayGpxName = selectedGpxfile.name
                          if (selectedGpxfile.name.length > 20) {
                            displayGpxName = selectedGpxfile.name.substring(0, 20) + "..."
                          }
                          return (
                            <Grid.Column key={key} textAlign="center">
                              <div className="thumb-img gpx-view">
                                <Image src="/assets/images/icons/gpx-icon.svg" width="73" height="73" alt="Upload image"></Image>
                                <span
                                  className="close-icon"
                                  onClick={e => {
                                    e.preventDefault()
                                    deleteSelectedGpxFile(selectedGpxfile)
                                  }}
                                >
                                  <img src="/assets/images/close.svg" alt="Close" />
                                </span>
                              </div>
                              {displayGpxName}
                            </Grid.Column>
                          )
                        })}
                      {!!editGpxFiles.length &&
                        editGpxFiles.map((file, key) => {
                          let displayGpxName = file.name
                          if (file.substring(file.lastIndexOf("/") + 1)) {
                            displayGpxName =
                              file.substring(file.lastIndexOf("/") + 1).substring(0, 20) + (file.substring(file.lastIndexOf("/") + 1).length > 20 ? "..." : "")
                          }
                          return (
                            <Grid.Column key={key} textAlign="center">
                              <div className="thumb-img gpx-view">
                                <Image src="/assets/images/icons/gpx-icon.svg" width="73" height="73" alt="Upload image"></Image>
                                <span
                                  className="close-icon"
                                  onClick={e => {
                                    e.preventDefault()
                                    deleteGpx(file)
                                  }}
                                >
                                  <img src="/assets/images/close.svg" alt="Close" />
                                </span>
                              </div>
                              {displayGpxName}
                            </Grid.Column>
                          )
                        })}
                    </Grid>
                  </Dimmer.Dimmable>
                </Grid.Column>
              </Grid>
            )}
            <div className="d-flex justify-content-between align-items-center">
              <Link onClick={() => linkPost()} className="cancel-btn cursor-pointer text-red">
                Cancel
              </Link>
              <div>
                {/* <Button type="button" color="red" className="white-addon">
              Save & Finish Later
            </Button> */}
                <Button
                  type="submit"
                  color="red"
                  id="postSubmitBtn"
                  onClick={e => {
                    if (!user) {
                      e.preventDefault()
                      setWarningModalOpen(true)
                    }
                    setOpen(false)
                  }}
                  disabled={submitLoader || loading}
                >
                  Post
                </Button>
              </div>
            </div>
          </>
        ) : (
            <>
              <Modal.Header>{postId ? "Edit Post" : "Share an update"}</Modal.Header>
              <Form.Group>
                <div className="post-size">
                  {!viewAllImages && (
                    <>
                      <Form.Field className={errors && errors.body ? "error" : ""} onPaste={() => { }}>
                        <RichTextEditor
                          placeholder="Share something interesting ..."
                          onBodyChange={bodyOfEditor => {
                            values.body = bodyOfEditor
                            checkForLink(bodyOfEditor)
                          }}
                          value={values.body}
                          noTopBar={true}
                          error={errors?.body ? true : false}
                          className="custom-input"
                          focused={true}
                        />
                        {errors?.body && <span className="error-message">{errors.body}</span>}
                      </Form.Field>
                      <div>{cardContent}</div>
                    </>
                  )}
                  <Form.Field className={viewAllImages ? "edit-post-images" : ""}>
                    {viewAllImagesButton && !viewAllImages && (
                      <Button onClick={() => viewAllButtonClick()} className="overlay-btn" type="button">
                        <img src="/assets/images/icons/edit-red.svg" alt="Edit" width="12" height="12" />
                      Edit All
                      </Button>
                    )}
                    {viewAllImages && (
                      <Button onClick={() => viewAllButtonClick()} className="overlay-btn" type="button">
                        <img src="/assets/images/icons/arrow-left.svg" alt="Back" width="12" height="12" />
                      Back
                      </Button>
                    )}
                    <Dimmer.Dimmable dimmed={photoGridLoader} className="photo-grid-loader">
                      <Dimmer active={photoGridLoader} verticalAlign="top">
                        <Header as="h2" icon inverted>
                          Loading...
                      </Header>
                      </Dimmer>
                      {!!selectedTripsImages.length && !postId && (
                        <Grid className="post-grid">
                          {!viewAllImages && (
                            <>
                              <Grid.Row>
                                <Grid.Column key={0}>
                                  <div className="thumb-img">
                                    <DropzoneUploadDisplay imageUrl={selectedTripsImages[0]} />
                                    <span
                                      className="close-icon"
                                      onClick={e => {
                                        e.preventDefault()
                                        deleteShareImage(selectedTripsImages[0])
                                      }}
                                    >
                                      <img src="/assets/images/close.svg" alt="Close" />
                                    </span>
                                  </div>
                                </Grid.Column>
                              </Grid.Row>
                              <Grid.Row
                                className={
                                  "post-thumbnail " + (selectedTripsImages.length > 4 ? " fixed-img" : selectedTripsImages.length > 3 ? " fixed-img-3" : "")
                                }
                              >
                                {selectedTripsImages.map(
                                  (selectedTripImage, key) =>
                                    key < 5 &&
                                    key != 0 && (
                                      <Grid.Column key={key}>
                                        <div className="thumb-img">
                                          <DropzoneUploadDisplay imageUrl={selectedTripImage} />
                                          <span
                                            className="close-icon"
                                            onClick={e => {
                                              e.preventDefault()
                                              deleteShareImage(selectedTripImage)
                                            }}
                                          >
                                            <img src="/assets/images/close.svg" alt="Close" />
                                          </span>
                                          {selectedTripsImages.length > 4 && key === 4 && (
                                            <span className="overlay-block">+{selectedTripsImages.length - 4}</span>
                                          )}
                                        </div>
                                      </Grid.Column>
                                    )
                                )}
                              </Grid.Row>
                            </>
                          )}
                          {viewAllImages && selectedTripsImages.length !== 0 && (
                            <Grid.Row className="post-thumbnail">
                              {selectedTripsImages.map((selectedTripImage, key) => (
                                <div className="thumb-img" key={key}>
                                  <DropzoneUploadDisplay imageUrl={selectedTripImage} />
                                  <span
                                    className="close-icon"
                                    onClick={e => {
                                      e.preventDefault()
                                      deleteShareImage(selectedTripImage)
                                    }}
                                  >
                                    <img src="/assets/images/close.svg" alt="Close" />
                                  </span>
                                </div>
                              ))}
                            </Grid.Row>
                          )}
                        </Grid>
                      )}
                      {postId && (
                        <>
                          {!viewAllImages && (editPostPictureUrls.length !== 0 || selectedTripsImages.length !== 0) && (
                            <Grid className="post-grid">
                              <Grid.Row>
                                {editPostPictureUrls.length !== 0 && (
                                  <Grid.Column key={16}>
                                    <div className="thumb-img">
                                      <img src={editPostPictureUrls[0]} />
                                      <span
                                        className="close-icon"
                                        onClick={e => {
                                          e.preventDefault()
                                          deleteImage(editPostPictureUrls[0])
                                        }}
                                      >
                                        <img src="/assets/images/close.svg" alt="Close" />
                                      </span>
                                    </div>
                                  </Grid.Column>
                                )}
                                {editPostPictureUrls.length === 0 && selectedTripsImages.length !== 0 && (
                                  <Grid.Column key={selectedTripsImages[0]}>
                                    <div className="thumb-img">
                                      <DropzoneUploadDisplay imageUrl={selectedTripsImages[0]} />
                                      <span
                                        className="close-icon"
                                        onClick={e => {
                                          e.preventDefault()
                                          deleteShareImage(selectedTripsImages[0])
                                        }}
                                      >
                                        <img src="/assets/images/close.svg" alt="Close" />
                                      </span>
                                      {editPostPictureUrls.length + 1 > 4 && (
                                        <span className="overlay-block">+{editPostPictureUrls.length + selectedTripsImages.length - 4}</span>
                                      )}
                                    </div>
                                  </Grid.Column>
                                )}
                              </Grid.Row>
                              <Grid.Row
                                className={
                                  "post-thumbnail " +
                                  (editPostPictureUrls.length + selectedTripsImages.length > 4
                                    ? " fixed-img"
                                    : editPostPictureUrls.length + selectedTripsImages.length > 3
                                      ? "fixed-img-3"
                                      : "")
                                }
                              >
                                {editPostPictureUrls.map(
                                  (editpictureUrl, key) =>
                                    key < 5 &&
                                    key != 0 && (
                                      <Grid.Column key={key}>
                                        <div className="thumb-img">
                                          <img src={editpictureUrl} />
                                          <span
                                            className="close-icon"
                                            onClick={e => {
                                              e.preventDefault()
                                              deleteImage(editpictureUrl)
                                            }}
                                          >
                                            <img src="/assets/images/close.svg" alt="Close" />
                                          </span>
                                          {editPostPictureUrls.length > 4 && key === 4 && (
                                            <span className="overlay-block">+{editPostPictureUrls.length + selectedTripsImages.length - 4}</span>
                                          )}
                                        </div>
                                      </Grid.Column>
                                    )
                                )}
                                {editPostPictureUrls.length < 5 &&
                                  selectedTripsImages.map(
                                    (editpictureUrl, key) =>
                                      editPostPictureUrls.length + key < 5 &&
                                      (editPostPictureUrls.length === 0 && key === 0 ? (
                                        ""
                                      ) : (
                                          <Grid.Column key={key}>
                                            <div className="thumb-img">
                                              <DropzoneUploadDisplay imageUrl={editpictureUrl} />
                                              <span
                                                className="close-icon"
                                                onClick={e => {
                                                  e.preventDefault()
                                                  deleteShareImage(editpictureUrl)
                                                }}
                                              >
                                                <img src="/assets/images/close.svg" alt="Close" />
                                              </span>
                                              {editPostPictureUrls.length + (key + 1) > 4 && (
                                                <span className="overlay-block">+{editPostPictureUrls.length + selectedTripsImages.length - 4}</span>
                                              )}
                                            </div>
                                          </Grid.Column>
                                        ))
                                  )}
                              </Grid.Row>
                            </Grid>
                          )}
                          {viewAllImages && (editPostPictureUrls.length !== 0 || selectedTripsImages.length !== 0) && (
                            <div className="edit-grid">
                              <Grid.Row className={"post-thumbnail"}>
                                {editPostPictureUrls.map((editpictureUrl, key) => (
                                  <Grid.Column key={key}>
                                    <div className="thumb-img">
                                      <img src={editpictureUrl} />
                                      <span
                                        className="close-icon"
                                        onClick={e => {
                                          e.preventDefault()
                                          deleteImage(editpictureUrl)
                                        }}
                                      >
                                        <img src="/assets/images/close.svg" alt="Close" />
                                      </span>
                                    </div>
                                  </Grid.Column>
                                ))}
                              </Grid.Row>
                              <Grid.Row className={"post-thumbnail"}>
                                {selectedTripsImages.map((editpictureUrl, key) => (
                                  <Grid.Column key={key}>
                                    <div className="thumb-img">
                                      <DropzoneUploadDisplay imageUrl={editpictureUrl} />
                                      <span
                                        className="close-icon"
                                        onClick={e => {
                                          e.preventDefault()
                                          deleteShareImage(editpictureUrl)
                                        }}
                                      >
                                        <img src="/assets/images/close.svg" alt="Close" />
                                      </span>
                                    </div>
                                  </Grid.Column>
                                ))}
                              </Grid.Row>
                            </div>
                          )}
                        </>
                      )}
                    </Dimmer.Dimmable>
                  </Form.Field>
                </div>
              </Form.Group>
              <div className="postbottom-block">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {" "}
                    {!postId && (
                      <CustomDropzone acceptedFiles={"image/*"} onDrop={setTripsPhotos} showStyle={false}>
                        <img src="/assets/images/icons/attach-image.svg" alt="" />
                      </CustomDropzone>
                    )}
                    {postId && (
                      <CustomDropzone acceptedFiles={"image/*"} onDrop={setTripsPhotos} showStyle={false}>
                        <Button className="post-btn align-middle" type="button">
                          <img src="/assets/images/icons/plus.svg" alt="" className="align-middle" /> <span className="align-middle">Add More Photos</span>
                        </Button>
                      </CustomDropzone>
                    )}
                    {skipedLargeImages && (
                      <span className="ui error message skipped_large_file_message" style={{ display: "inline-block" }}>
                        Sorry, only files under 10MB is allowed.
                      </span>
                    )}
                  </div>
                  <Button
                    type="submit"
                    color="red"
                    id="basicPostSubmit"
                    onClick={e => {
                      if (!user) {
                        e.preventDefault()
                        setWarningModalOpen(true)
                      }
                      setOpen(false)
                    }}
                    disabled={submitLoader || loading}
                  >
                    {"Post"}
                  </Button>
                </div>
              </div>
            </>
          )}
      </Form>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>

      {/* <Prompt
        when={open}
        message={JSON.stringify({
          header: "Leave page",
          content: "Are you sure you want to discard the changes?"
        })}
      /> */}
    </>
  )
}

export default CommonPost
