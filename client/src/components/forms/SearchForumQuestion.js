import React, { useContext, useState, useEffect } from "react"
import { AuthContext } from "../../context/auth"
import { Form, Card, Button, Grid, Modal, Dimmer, Loader, Popup } from "semantic-ui-react"
import { useLazyQuery } from "@apollo/client"
import { useHistory, useLocation } from "react-router-dom"
import qs from "query-string"

import { FETCH_BIKE_BY_NAME_QUERY, SEARCH_FORUM_POST_QUERY, SEARCH_POST_QUERY } from "../../common/gql_api_def"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { charLimit, fetchLimit } from "../../util/Constants"
import Autocomplete from "react-google-autocomplete"
import { ListQuestions } from "../question/ListQuestion"
import MultiSearchSelectPopup from "../../components/post/MultiSearchSelectPopup"
import { Link } from "react-router-dom"
import { validateSearchForumPost } from "../../util/validators"
import { useInfiniteScroll } from "../../util/hooks"

const SearchForumQuestion = () => {
  const { user } = useContext(AuthContext)
  const [tempSearch, settempSearch] = useState("")
  const history = useHistory()
  const location = useLocation()
  const [quesType, setQuesType] = useState("bike")
  const [bikes, setbikes] = useState([])
  const [bikesSelected, setbikesSelected] = useState([])
  const [errors, setErrors] = useState({})
  const [title, settitle] = useState("")
  const [questions, setQuestions] = useState([])
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [allLocation, setallLocation] = useState([])
  const [cursor, setCursor] = useState("")
  const [isFetching, setIsFetching] = useInfiniteScroll()
  const [defaultBike, setDefaultBike] = useState(false)
  let isloading = false

  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)

  const [getSelectedBikeByName] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY, {
    onCompleted: result => {
      if (result.getBikeByName.length) {
        let tempBikes = []
        let tempSelectedBikes = []
        result.getBikeByName.map(bike => {
          tempBikes.push({
            bikeId: bike.id,
            bikename: bike.bikename,
            image: bike.thumbUrl
          })
          tempSelectedBikes.push({
            bikeId: bike.id,
            bikename: bike.bikename,
            thumbUrl: bike.thumbUrl
          })
        })
        setbikes(tempBikes, ...bikes)
        setbikesSelected(tempSelectedBikes, ...bikesSelected)
      }
    }
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

  // const [{ data: { searchPosts } }] = useQuery(SEARCH_POST_QUERY)

  const [search, { loading, data: { searchPosts } = {}, fetchMore }] = useLazyQuery(SEARCH_POST_QUERY, {
    onCompleted: data => {
      setCursor(data.searchPosts.cursor)
      let questions = []
      if (data && data.searchPosts) {
        questions = (data.searchPosts.posts || []).map(post => {
          return post
        })
      }
      setQuestions(questions || [])
      setErrors([])
    },
    onError(err) {
      console.log(err)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    }
    // variables: {
    //   // first: fetchLimit,
    //   // after: null,
    //   // bikename: bikesSelected.length ? bikesSelected[0].bikename : "",
    //   // location: "",
    //   // title: title,
    //   // quesType: quesType
    //   limit: 10,
    //   fieldmap: [{field:"title", pattern:title ? title : "", gate:"AND"}, {field:"postag", pattern:quesType==="bike"?bikesSelected.join(" "):bikesSelected.join(" "), gate:'AND'}, {field:"postType", pattern:"BikeForumPost", gate:'OR'}]
    // }
  })

  useEffect(() => {
    if (cursor && isFetching) {
      let bikesToSearch = []
      bikesSelected.map(b => {
        if (!bikesToSearch.includes(b.bikename.slice(0, -7))) {
          bikesToSearch.push(b.bikename.slice(0, -7))
        }
      })
      fetchMore({
        query: SEARCH_POST_QUERY,
        variables: {
          cursor: cursor,
          limit: fetchLimit,
          fieldmap: [
            { field: "title", pattern: title ? title : "", gate: "AND" },
            { field: "postag", pattern: quesType === "bike" ? bikesSelected.join(" ") : allLocation.join(" "), gate: "AND" },
            { field: "postType", pattern: quesType === "bike" ? "BikeForumPost" : "TripForumPost", gate: "OR" }
          ]
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          let _updatedPostConnection = fetchMoreResult.searchPosts
          setCursor(_updatedPostConnection.cursor)
          _updatedPostConnection = [...questions, ..._updatedPostConnection.posts]
          setQuestions(_updatedPostConnection)
        }
      })
    }
  }, [isFetching])

  useEffect(() => {
    if (location && location.search) {
      const searchTerm = qs.parse(location.search)
      if (searchTerm && ((searchTerm.bikequestion && searchTerm.bikes) || (searchTerm.tripquestion && searchTerm.locations))) {
        let bikesToSearch = []
        let locationToSearch = []
        let titleToSearch = ""
        let quesTypeToSearch = ""
        if (searchTerm.bikequestion) {
          titleToSearch = searchTerm.bikequestion
          quesTypeToSearch = "bike"
          if (searchTerm.bikes && searchTerm.bikes.length) {
            searchTerm.bikes = JSON.parse(searchTerm.bikes)
            if (searchTerm.bikes.length) {
              getSelectedBikeByName({
                variables: { bikename: searchTerm.bikes.join(","), multiple: true }
              })
              searchTerm.bikes.map(b => {
                if (!bikesToSearch.includes(b.slice(0, -7))) {
                  bikesToSearch.push(b.slice(0, -7))
                }
              })
            }
          }
        } else {
          titleToSearch = searchTerm.tripquestion
          quesTypeToSearch = "trip"
          locationToSearch = JSON.parse(searchTerm.locations)
          setallLocation(locationToSearch)
          if (document.getElementById("createTrip")) {
            document.getElementById("createTrip").click()
          }
        }
        settitle(titleToSearch)
        setQuesType(quesTypeToSearch)
        search({
          variables: {
            // first: fetchLimit,
            // after: null,
            // bikename: bikesToSearch,
            // location: locationToSearch,
            // title: titleToSearch ? titleToSearch : "",
            // quesType: quesTypeToSearch
            limit: fetchLimit,
            fieldmap: [
              { field: "title", pattern: titleToSearch ? titleToSearch : "", gate: "AND" },
              { field: "postag", pattern: quesTypeToSearch === "bike" ? bikesToSearch.join(" ") : locationToSearch.join(" "), gate: "AND" },
              { field: "postType", pattern: quesTypeToSearch === "bike" ? "BikeForumPost" : "TripForumPost", gate: "OR" }
            ]
          }
        })
      }
    }
  }, [])

  const searchBikeQuetion = () => {
    let bikesToSearch = []
    let locationToSearch = []
    if (quesType === "bike") {
      let tempBikes = []
      bikesSelected.map(b => {
        tempBikes.push(b.bikename)
        if (!bikesToSearch.includes(b.bikename.slice(0, -7))) {
          bikesToSearch.push(b.bikename.slice(0, -7))
        }
      })
      if (title || tempBikes.length || (title && tempBikes.length)) {
        history.push(`/forum?bikequestion=${encodeURIComponent(title)}&bikes=${encodeURIComponent(JSON.stringify(tempBikes))}`)
      } else {
        history.push(`/forum`)
      }
    } else {
      locationToSearch = allLocation
      if (title) {
        history.push(`/forum?tripquestion=${encodeURIComponent(title)}&locations=${encodeURIComponent(JSON.stringify(allLocation))}`)
      } else {
        history.push(`/forum`)
      }
    }
    search({
      variables: {
        // first: fetchLimit,
        // after: null,
        // bikename: bikesToSearch,
        // location: locationToSearch,
        // title: title,
        // quesType: quesType
        limit: fetchLimit,
        fieldmap: [
          { field: "title", pattern: title ? title : "", gate: "AND" },
          { field: "postag", pattern: quesType === "bike" ? bikesToSearch.join(" ") : locationToSearch.join(" "), gate: "AND" },
          { field: "postType", pattern: quesType === "bike" ? "BikeForumPost" : "TripForumPost", gate: "OR" }
        ]
      }
    })
  }

  const submitForm = () => {
    const { valid, errors } = validateSearchForumPost(title, bikesSelected, allLocation, quesType)
    if (!valid) {
      setErrors(errors)
    } else {
      searchBikeQuetion()
    }
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
  return (
    <>
      <div className="text-right top-link">
        <Link to="/coming-soon">Questions Related to You</Link>
        <span>|</span>
        <Link to="/myquestions">My Questions</Link>
      </div>
      <Card fluid className="post-view create-post-new forum-search">
        <Form onSubmit={submitForm} className={(isloading ? "loading " : " ") + "post-input bike-post-input form-container"}>
          <Grid>
            <Grid.Column mobile={16} tablet={16} computer={16} verticalAlign="middle" className="text-center">
              <label>Search forum</label>
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
              <label>Type the text to search</label>
              <p className="text-light">What are you looking for?</p>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={10} computer={11}>
              <Form.Input
                className={errors?.title ? "error" : ""}
                placeholder="Type the text to search here...."
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
          <Grid>
            <Grid.Column textAlign="right">
              <Button type="submit" color="red">
                Search
              </Button>
            </Grid.Column>
          </Grid>
        </Form>
      </Card>

      <div className="text-center ask-question">
        Can't find what you're looking for <Link to="/post/forum">Ask a question?</Link>
      </div>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          !!questions.length && <ListQuestions questions={questions} />
        )}
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}
export default SearchForumQuestion
