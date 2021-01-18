import React, { useState } from "react"
import { Button, Form, Header, Grid, Radio } from "semantic-ui-react"
import Autocomplete from "react-google-autocomplete"
import "react-phone-input-2/lib/style.css"
import CustomDropzone from "../util/CustomDropzone"
import Avatar from "../util/Avatar"
import { useLazyQuery } from "@apollo/client"
import { FETCH_BIKE_BY_NAME_QUERY } from "../../common/gql_api_def"
import MultiSearchSelect from "../post/MultiSearchSelect"
import Cropper from "react-easy-crop"
import "react-input-range/lib/css/index.css"
import "react-easy-crop/react-easy-crop.css"
import getCroppedImg from "../util/cropImage"
import { Slider } from "react-semantic-ui-range"
import "semantic-ui-css/semantic.min.css"
import history from "../util/history"

const ProfileForm = ({
  user = null,
  onSubmit,
  onChange,
  values,
  errors,
  showTnC = false, //Terms and Conditions
  buttonTitle,
  setImage,
  image,
  showIcon = false,
  showEmail = false,
  showPassword = true,
  showUsertag = false,
  showBikes = false,
  loading = false,
  setBikesData,
  setLocationData,
  setimageBase64Data = "",
  imageBase64Data = "",
  uploadImageLoading,
  onRadioChange,
  readonly
}) => {
  const [passwordShown, setPasswordShown] = useState(false)
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)
  const [bikes, setbikes] = useState([])
  const [tempSearch, settempSearch] = useState("")
  const [zoom, setZoom] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [imageSrc, setimageSrc] = useState("")
  let aspect = 1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState({})
  const [croppedImage, setCroppedImage] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [showCrop, setShowCrop] = useState(false)
  const [showBtn, setShowBtn] = useState(true)
  const setAvatar = image => {
    //prep the files
    values.avatarFile = image[0].name
    setImage(image)
    setimageSrc(URL.createObjectURL(image[0]))
    setShowBtn(false)
    setShowCrop(true)
  }

  const toggleShowPass = () => {
    setPasswordShown(passwordShown ? false : true)
  }

  /* received searched bike list */
  let searchedWhichBike = []
  if (data) {
    for (let b = 0; b < data.getBikeByName.length; b++) {
      searchedWhichBike.push({
        id: data.getBikeByName[b].id,
        label: data.getBikeByName[b].bikename,
        image: data.getBikeByName[b].thumbUrl,
        description: ""
      })
    }
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

  const changeImage = () => {
    setShowBtn(true)
    setShowCrop(false)
  }
  let profileUser = {
    avatarUrl: imageSrc ? imageSrc : values.avatarUrl,
    username: values.username
  }
  return (
    <div className="user-profile-view">
      <Form onSubmit={onSubmit} noValidate className={loading || uploadImageLoading ? "loading" : ""}>
        <div className="profile-control">
          {showCrop && (
            <>
              <Grid.Column>
                <span
                  className="close-tag"
                  onClick={e => {
                    setImage(null)
                    setimageSrc("")
                    setShowBtn(true)
                    setShowCrop(false)
                  }}
                >
                  <img src="/assets/images/icons/close-small.svg" alt="Delete" width="8" height="8" />
                </span>
              </Grid.Column>
              <div className="crop-container">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={onCropChange}
                  onCropComplete={onCropComplete}
                  onZoomChange={onZoomChange}
                />
              </div>
              <div className="controls">
                <Slider value={zoom} color="red" settings={sliderSettings} color="red" />
              </div>
            </>
          )}
        </div>
        <Form.Field className="profile-img">
          <Header image>
            {showBtn && (
              <>
                <Avatar profileUser={profileUser} />
              </>
            )}
            <Header.Content>
              <CustomDropzone multipleUpload={false} acceptedFiles={"image/*"} onDrop={setAvatar}>
                {showBtn && (
                  <Button type="button" basic color="red">
                    <span className="align-middle">
                      <img src="/assets/images/icons/upload-pic.svg" alt="Upload" className="align-middle" width="16" height="16" />
                    </span>{" "}
                    <span className="align-middle">Upload new picture</span>
                  </Button>
                )}
              </CustomDropzone>
            </Header.Content>
          </Header>
        </Form.Field>
        {showCrop && (
          <div className="profile-control">
            <div className="text-center">
              <Button type="button" basic color="red" onClick={() => history.goBack()}>
                Cancel{" "}
              </Button>
              <Button type="submit" color="red" disabled={loading || uploadImageLoading}>
                {buttonTitle}
              </Button>
            </div>
          </div>
        )}
        <div className="profile-description">
          <h3 className="text-center">Personal details</h3>
          <p className="text-center text-red">Sorry, you can not change these details right now. Please check back later </p>
        </div>

        <div className="profile-control">
          <Form.Field>
            <label>Username</label>
            <input
              placeholder="Your username - make it a catchy one"
              name="username"
              type="text"
              maxLength={15}
              value={values.username}
              className={errors?.username ? "error" : ""}
              onChange={onChange}
              disabled
            />
            {errors?.username && <span className="error-message">{errors.username}</span>}
          </Form.Field>
          <Form.Field>
            <label>Full name</label>
            <input
              placeholder="Your Fullname - max 30 characters"
              name="name"
              type="text"
              maxLength={30}
              value={values.name}
              className={errors?.name ? "error" : ""}
              onChange={onChange}
              disabled
            />
            {errors?.name && <span className="error-message">{errors.name}</span>}
          </Form.Field>

          {showEmail && (
            <Form.Input placeholder="Email" name="email" type="email" value={values.email} error={errors?.email ? true : false} onChange={onChange} />
          )}
          <Form.Field>
            <label>Email Address</label>
            <input
              placeholder="Your Email Address"
              name="email"
              type="email"
              value={values.email}
              className={errors?.username ? "error" : ""}
              onChange={onChange}
              disabled
            />
            {errors?.email && <span className="error-message">{errors.email}</span>}
          </Form.Field>
          <Form.Field>
            <label>Location</label>
            <Form.Input>
              <input
                placeholder="Enter your location"
                name="location"
                type="text"
                value={values.location}
                className={errors?.location ? "error" : ""}
                onChange={onChange}
                disabled
              />
              {/* <Autocomplete
                value={values.location}
                name="location"
                autoComplete="none"
                onChange={onChange}
                onKeyDown={event => {
                  //Supress the enter key so that we dotn submit the form by mistake
                  if (event.keyCode === 13) {
                    event.preventDefault()
                  }
                }}
                onPlaceSelected={place => {
                  values.location = place.formatted_address
                  setLocationData(place.formatted_address)
                }}
                types={["(regions)"]}
                placeholder="Your location - tell us where you are from"
                readOnly
              /> */}
            </Form.Input>
            {errors?.location && <span className="error-message">{errors.location}</span>}
          </Form.Field>

          {showPassword && (
            <div className="pass_show no-label">
              <Form.Input
                placeholder="Your Password - keep it safe"
                name="password"
                type={passwordShown ? "text" : "password"}
                value={values.password}
                error={errors?.password ? true : false}
                onChange={onChange}
              />
              <span onClick={toggleShowPass}>
                {passwordShown ? (
                  <img src="/assets/images/icons/gray/view-hide.svg" alt="Hide" width="20" height="16" />
                ) : (
                  <img src="/assets/images/icons/gray/view-show.svg" alt="Show" width="20" height="16" />
                )}
              </span>
            </div>
          )}

          {showBikes && (
            <>
              <MultiSearchSelect
                searchable={true}
                showTags={true}
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
                    // setbikesSelected(bikesSelected)
                  }
                  setbikes(bikes)
                  setBikesData(bikesSelected)
                }}
                options={searchedWhichBike}
                placeholder="What bikes do you own today?"
                selected={bikes}
                onUserInput={value => {
                  if (value.length > 1 && tempSearch !== value) {
                    settempSearch(value)
                    searchBikeByName({ variables: { bikename: value } })
                  }
                }}
                error={errors?.ownBikes ? true : false}
              />
            </>
          )}
          {showUsertag && (
            <Form.Input
              label="Usertag"
              placeholder="usertag"
              name="usertag"
              type="text"
              value={values.usertag}
              error={errors?.usertag ? true : false}
              onChange={onChange}
            />
          )}
          {showTnC && (
            <>
              <p></p>
              <div className="text-center">By clicking on "Agree and Sign Up", you agree with our </div>
              <div className="text-center">
                <a className="nav-item" target="_blank" href="/policies.html">
                  Policies
                </a>
                {" and "}
                <a target="_blank" href="/terms.html">
                  Terms of Service
                </a>
              </div>
              <p></p>
            </>
          )}
          <Grid>
            <Grid.Column>
              <Button type="submit" className="ui red white-addon button" disabled>
                <img src="/assets/images/icons/lock.svg" alt="lock" className="align-middle" width="16" height="16" />{" "}
                <span className="align-middle">Reset Password</span>
              </Button>
            </Grid.Column>
          </Grid>
        </div>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map(value => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProfileForm
