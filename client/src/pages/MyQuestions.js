import React, { useContext, useState, useEffect } from "react"
import Navigation from "../layout/Navigation"
import { AuthContext } from "../context/auth"
import { Grid, Dimmer, Loader } from "semantic-ui-react"
import { useQuery } from "@apollo/client"
import { FETCH_MYQUESTIONS_QUERY } from "../common/gql_api_def"
import { fetchLimit } from "../util/Constants"
import { ListQuestions } from "../components/question/ListQuestion"
import { useInfiniteScroll } from "../util/hooks"

const MyQuestions = props => {
  const {user} = useContext(AuthContext)
  const [questions, setQuestions] = useState([])
  const [cursor, setCursor] = useState("")
  const [isFetching, setIsFetching] = useInfiniteScroll()

  const { loading, data, fetchMore } = useQuery(FETCH_MYQUESTIONS_QUERY, {
    variables: { userId:user.id, cursor: "",limit: fetchLimit},
    skip: user?false:true
  })
  //Initial pull
  useEffect(() => {
    if (data) {
      setQuestions(data.getMyQuestions.posts || [])
      setCursor(data.getMyQuestions.cursor || "")
    }
  }, [data])

  useEffect(() => {
    if (cursor && isFetching) {
      fetchMore({
        query: FETCH_MYQUESTIONS_QUERY,
        variables: {
          cursor: cursor,
          limit: fetchLimit,
          userId:user.id
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          let _updatedPostConnection = fetchMoreResult.getMyQuestions
          setCursor(_updatedPostConnection.cursor)
          _updatedPostConnection = [...questions, ..._updatedPostConnection.posts]
          setQuestions(_updatedPostConnection)
        }
      })
    }
  }, [isFetching])

  return (
    <Navigation>
      <Grid.Row>        
        <Grid.Column>
          <h2>My Questions</h2>
          {loading ? (
            <Dimmer active>
              <Loader />
            </Dimmer>
          ):(
            <ListQuestions questions={questions} />
          )}
        </Grid.Column>
      </Grid.Row>
    </Navigation>
  )
}
export default MyQuestions
