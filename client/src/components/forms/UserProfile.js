import React, { useState } from "react"
import { Button, Form, Grid, Popup } from "semantic-ui-react"
import Autocomplete from "react-google-autocomplete"
import "react-phone-input-2/lib/style.css"
import { useLazyQuery } from "@apollo/client"
import { FETCH_BIKE_BY_NAME_QUERY } from "../../common/gql_api_def"
import MultiSearchSelectPopup from "../post/MultiSearchSelectPopup"
import "react-input-range/lib/css/index.css"
import "react-easy-crop/react-easy-crop.css"
import { Link } from "react-router-dom"
import "semantic-ui-css/semantic.min.css"
import { BTN_TEXT_SIGN_IN, URL_SIGN_IN } from "../../util/user-messages"

const UserProfile = ({
  onSubmit,
  onChange,
  values,
  errors,
  registerDescription,
  showEmail,
  showName,
  showPassword,
  showLocation,
  loading = false,
  loadingforfb = false,
  loadingforgoogle = false,
  setBikesData,
  setLocationData,
  uploadImageLoading,
  goBack
}) => {
  const [passwordShown, setPasswordShown] = useState(false)
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)
  const [bikes, setbikes] = useState([])
  const [tempSearch, settempSearch] = useState("")

  const [bikesSelected, setbikesSelected] = useState([])

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

  return (
    <>
      <div className="form-bx">
        <div className="d-flex align-items-center">
          <Form onSubmit={onSubmit} noValidate className={loading || loadingforfb || loadingforgoogle || uploadImageLoading ? "loading" : ""}>
            {registerDescription ? (
              <h1 className="text-center"> Let's get started...</h1>
            ) : (
              <>
                <h1 className="text-center mb-0">Let's complete your profile...</h1>
                <p className="text-center text-light-dark">
                  Before you start using MotoMob, we need a bit more information from you. You can change this information from your profile, anytime.
                </p>
              </>
            )}
            <Form.Field>
              <label>Username</label>
              <input
                placeholder="Your username - make it a catchy one"
                name="username"
                type="text"
                maxLength={15}
                value={values.username}
                className={errors.username ? "error" : ""}
                onChange={onChange}
              />
              {errors?.username && <span className="error-message">{errors.username}</span>}
            </Form.Field>
            <Form.Field className="d-flex align-items-center">
              <div className="label-left">
                <label>Select bike(s) you own or like</label>
              </div>
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
                        setBikesData(bikesSelected.filter(b => b.bikeId !== e.bikeId))
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
                          setBikesData(tempBikesSelected)
                          setbikesSelected(tempBikesSelected)
                        }}
                        options={searchedWhichBike}
                        placeholder="Search bike"
                        selected={bikes}
                        onUserInput={value => {
                          if (value.length > 1 && tempSearch !== value) {
                            settempSearch(value)
                            searchBikeByName({ variables: { bikename: value } })
                          }
                        }}
                        userDefaultBike={value => {
                          settempSearch(value)
                          searchBikeByName({ variables: { bikename: value } })
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
                        className={errors && errors.ownBikes ? "add-bike-rounded-button error" : "add-bike-rounded-button"}
                      />
                    }
                  />
                )}
              </div>
              {errors?.ownBikes && <div className="error-message">{errors.ownBikes}</div>}
            </Form.Field>
            {showName && (
              <Form.Field>
                <label>Full name</label>
                <input
                  placeholder="Your Full name - max 30 characters"
                  name="name"
                  type="text"
                  maxLength={30}
                  value={values.name}
                  className={errors.name ? "error" : ""}
                  onChange={onChange}
                />
                {errors?.name && <span className="error-message">{errors.name}</span>}
              </Form.Field>
            )}
            {showEmail && (
              <Form.Field>
                <label>Email</label>
                <input
                  placeholder="Your Email Address"
                  name="email"
                  type="email"
                  value={values.email}
                  className={errors.email ? "error" : ""}
                  onChange={onChange}
                />
                {errors?.email && <span className="error-message">{errors.email}</span>}
              </Form.Field>
            )}
            {showLocation && (
              <Form.Field>
                <label>Location</label>
                <Form.Input>
                  <Autocomplete
                    value={values.location}
                    name="location"
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
                    className={errors.location ? "error" : ""}
                    types={["(regions)"]}
                    placeholder="Your location - tell us where you are from"
                  />
                </Form.Input>
                {errors?.location && <span className="error-message">{errors.location}</span>}
              </Form.Field>
            )}
            {showPassword && (
              <Form.Field>
                <label>Password</label>
                <div className="pass_show no-label">
                  <input
                    placeholder="Your Password - keep it safe"
                    name="password"
                    type={passwordShown ? "text" : "password"}
                    value={values.password}
                    className={errors.password ? "error" : ""}
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

                {errors?.password && <span className="error-message">{errors.password}</span>}
              </Form.Field>
            )}
            <p className="text-center font-medium">
              By clicking on "Agree and Continue", you agree with our <a href="/policies.html">Policies</a> and <a href="/terms.html">Terms of Service</a>
            </p>
            <Grid columns="equal">
              <Grid.Column>
                <Button type="submit" className="ui red white-addon button" color="white" onClick={() => goBack()}>
                  Cancel
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button type="submit" color="red">
                  Agree & Continue
                </Button>
              </Grid.Column>
            </Grid>
          </Form>
        </div>
        {!values.access_token && (
          <div className="text-center bottom-fixed">
            Already have an account?{" "}
            <Link className="text-red" to={URL_SIGN_IN}>
              {BTN_TEXT_SIGN_IN}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

export default UserProfile
