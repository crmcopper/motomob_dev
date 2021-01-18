import React, { useState, useContext, useEffect } from "react"
import { Form, Button, Grid, Modal, Dimmer, Loader, Responsive } from "semantic-ui-react"
import { useLazyQuery } from "@apollo/client"
import { useHistory, useLocation } from "react-router-dom"
import qs from "query-string"

import { SEARCH_FORUM_POST_QUERY } from "../../common/gql_api_def"
import { AuthContext } from "../../context/auth"
import { locations, fetchLimit } from "../../util/Constants"

import { charLimit } from "../../util/Constants"
import { ListQuestions } from "./ListQuestion"

export const SearchTripQuestion = props => {
  const history = useHistory()
  const urlLocation = useLocation()

  const [errors, setErrors] = useState({})
  const [title, settitle] = useState("")
  const [location, setLocation] = useState("")
  const [titleLazy, settitleLazy] = useState("")
  const [questions, setQuestions] = useState([])



  const { user } = useContext(AuthContext)

  /* close sign in first modal */

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
      bikename: "",
      location,
      title,
      quesType: "trip"
    }
  })

  useEffect(() => {
    if (urlLocation && urlLocation.search) {
      const searchTerm = qs.parse(urlLocation.search)
      if ((searchTerm && (searchTerm.tripquestion || searchTerm.location)) || (searchTerm.tripquestion && searchTerm.location)) {
        settitle(searchTerm.tripquestion)
        setLocation(searchTerm.location)
        search({
          variables: {
            first: fetchLimit,
            after: null,
            bikename: "",
            location: searchTerm.location ? searchTerm.location : "",
            title: searchTerm.tripquestion ? searchTerm.tripquestion : "",
            quesType: "trip"
          }
        })
      }
    }
  }, [])

  const searchQuetion = () => {
    if (title) {
      history.push(`/forum/1?tripquestion=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`)
    } else {
      history.push(`/forum/1`)
    }

    search({
      variables: {
        first: fetchLimit,
        after: null,
        bikename: "",
        location,
        title,
        quesType: "trip"
      }
    })
  }

  return (
    <>
      <Form onSubmit={() => searchQuetion()} className="post-input">
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
            <Button
              type="submit"
              color="red"

            >
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


    </>
  )
}
