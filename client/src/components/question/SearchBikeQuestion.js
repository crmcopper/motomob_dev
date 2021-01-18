import React, { useState, useContext, useEffect } from "react"

import { Form, Button, Grid, Modal, Dimmer, Loader } from "semantic-ui-react"
import { useLazyQuery } from "@apollo/client"
import { useHistory, useLocation } from "react-router-dom"
import qs from "query-string"

import { AuthContext } from "../../context/auth"
import { FETCH_BIKE_BY_NAME_QUERY, SEARCH_FORUM_POST_QUERY } from "../../common/gql_api_def"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import TextareaAutosize from "react-textarea-autosize"
import { charLimit, fetchLimit } from "../../util/Constants"
import MultiSearchSelect from "../post/MultiSearchSelect"
import { ListQuestions } from "./ListQuestion"

export const SearchBikeQuestion = () => {
  const [tempSearch, settempSearch] = useState("")
  const history = useHistory()
  const location = useLocation()
  const [defaultBike, setDefaultBike] = useState(false)
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)

  const [getSelectedBikeByName] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY, {
    onCompleted: result => {
      if (result.getBikeByName.length) {
        let tempBikes = []
        let tempSelectedBikes = []
        tempBikes.push({
          bikeId: result.getBikeByName[0].id,
          bikename: result.getBikeByName[0].bikename,
          image: result.getBikeByName[0].thumbUrl
        })
        tempSelectedBikes.push({
          bikeId: result.getBikeByName[0].id,
          bikename: result.getBikeByName[0].bikename,
          thumbUrl: result.getBikeByName[0].thumbUrl
        })
        setbikes(tempBikes)
        setbikesSelected(tempSelectedBikes)
      }
    }
  })
  let isloading = false
  const [errors, setErrors] = useState({})

  const [titleLazy, settitleLazy] = useState("")
  const [title, settitle] = useState("")
  const [bikes, setbikes] = useState([])
  const [questions, setQuestions] = useState([])
  const [bikesSelected, setbikesSelected] = useState([])
  const [bikeName, setbikeName] = useState("")

  const { user } = useContext(AuthContext)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)

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

  const [search, { loading, data: { searchForumPost } = {} }] = useLazyQuery(SEARCH_FORUM_POST_QUERY, {
    onCompleted: data => {
      let questions = []
      if (data && data.searchForumPost) {
        questions = (data.searchForumPost.edges || []).map(edge => {
          return edge.node
        })
      }
      setQuestions(questions || [])
      setErrors([])
    },
    onError(err) {
      console.log(err)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: {
      first: fetchLimit,
      after: null,
      bikename: bikesSelected.length ? bikesSelected[0].bikename : "",
      location: "",
      title: title,
      quesType: "bike"
    }
  })

  useEffect(() => {
    if (location && location.search) {
      // TODO: set bike name in input box
      const searchTerm = qs.parse(location.search)
      if ((searchTerm && (searchTerm.bikequestion || searchTerm.bike)) || (searchTerm.bikequestion && searchTerm.bike)) {
        settitle(searchTerm.bikequestion)
        setbikeName(searchTerm.bike)

        let getBikes = getSelectedBikeByName({
          variables: { bikename: searchTerm.bike }
        })

        let bike = JSON.parse(localStorage.getItem("bike"))
        if (bike && bike.length) {
          setbikes(bike)
        }
        search({
          variables: {
            first: fetchLimit,
            after: null,
            bikename: searchTerm.bike ? searchTerm.bike : "",
            location: "",
            title: searchTerm.bikequestion ? searchTerm.bikequestion : "",
            quesType: "bike"
          }
        })
      }
    }
  }, [])

  const searchQuetion = () => {
    if (title || bikeName || (title && bikeName)) {
      history.push(`/forum/0?bikequestion=${encodeURIComponent(title)}&bike=${encodeURIComponent(bikeName)}`)
    } else {
      history.push(`/forum/0`)
    }
    //setQuestions([])
    search({
      variables: {
        first: fetchLimit,
        after: null,
        bikename: bikeName,
        location: "",
        title: title,
        quesType: "bike"
      }
    })
  }

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  return (
    <>
      <Form onSubmit={() => searchQuetion()} className={(isloading ? "loading " : " ") + "post-input bike-post-input form-container"}>
        <MultiSearchSelect
          searchable={true}
          showTags={true}
          multiSelect={false}
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
              setbikeName(bikesSelected[0].bikename)
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
          error={errors?.bike ? true : false}
        />

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
        <Grid>
          <Grid.Column textAlign="center">
            <Button type="submit" color="red">
              Search
            </Button>
          </Grid.Column>
        </Grid>
        {loading ? (
          <Dimmer active>
            <Loader />
          </Dimmer>
        ) : (
            <ListQuestions questions={questions} />
          )}
      </Form>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}
