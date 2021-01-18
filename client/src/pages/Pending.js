import React, { useContext, useEffect, useState } from "react"
import { useMutation } from "@apollo/client"
import { CONFIRM_EMAIL_MUTATION } from "../common/gql_api_def"
import { AuthContext } from "../context/auth"

//import UserBikes, { bikesPanes } from "../components/profile/UserBikes"

const Pending = props => {
  const context = useContext(AuthContext)
  const token = props.match.params.token
  const [errors, setErrors] = useState({})

  const [confirmEmail] = useMutation(CONFIRM_EMAIL_MUTATION, {
    variables: { token },
    update: (store, { data: { confirmEmail: user } }) => {
      context.login(user)
      props.history.push("/")
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    }
  })
  //call the mutation
  useEffect(() => {
    if (token) {
      confirmEmail()
    }
  }, [token])

  return <>{token ? JSON.stringify(errors) : <h2>Please check your email for further actions</h2>}</>
}

export default Pending
