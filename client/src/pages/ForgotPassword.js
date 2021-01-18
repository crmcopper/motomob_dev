import React, { useState } from "react"
import { Button, Form, Grid, Responsive } from "semantic-ui-react"
import { useMutation } from "@apollo/client"
import { Link } from "react-router-dom"
import { useForm } from "../util/hooks"
import { FORGOT_PASSWORD } from "../common/gql_api_def"
import { URL_SIGN_IN, ERROR_USER_EMAIL_NOT_EMPTY, ERROR_USER_EMAIL_NOT_FOUND } from "../util/user-messages"
import ThanksModal from "./modal/ThanksModal"
import Header from "../layout/Header"
import Lottie from "../util/Lottie"

function ForgotPassword(props) {
  const [errors, setErrors] = useState({})
  const [emailMessageModalOpen, setEmailMessageModalOpen] = useState(false)
  const openEmailMessageModal = e => {
    setEmailMessageModalOpen(true)
  }
  const { onChange, onSubmit, values } = useForm(forgotPasswordCallback, {
    email: ""
  })
  function forgotPasswordCallback() {
    forgotPassword()
  }

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
    update(_, { data: { signin: user } }) {
      openEmailMessageModal()
    },
    onError(err) {
      if (err) {
        setErrors(err.graphQLErrors[0].extensions.exception.errors)
      }
    },
    variables: values
  })

  return (
    <>
      <div className="landing-bx d-flex justify-content-between">
        <Header />
        {!emailMessageModalOpen && (
          <div className="form-bx">
            <div className="d-flex align-items-center">
              <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
                <h1 className="text-center">Forgot Password?</h1>
                <p className="text-center text-light-dark">We will email you a link to reset your password.</p>
                <br></br>
                <Form.Field>
                  <label>Your Email Address</label>
                  <input
                    placeholder="The email address associated with your account"
                    type="email"
                    name="email"
                    value={values.email}
                    error={errors.email ? true : false}
                    onChange={onChange}
                    className={errors?.email ? "error" : ""}
                  />
                  {errors?.email && <span className="error-message">{errors.email}</span>}
                </Form.Field>
                <br></br>
                <Grid columns="equal">
                  <Grid.Column>
                    <Link className="ui red white-addon button" to={URL_SIGN_IN}>
                      Cancel
                    </Link>
                  </Grid.Column>
                  <Grid.Column>
                    <Button type="submit" color="red">
                      Send
                    </Button>
                  </Grid.Column>
                </Grid>
                {Object.keys(errors).length > 0 &&

                  (
                    <div className="ui error message">
                      <ul className="list">
                        {Object.values(errors).map(value => {
                          // if (value !== ERROR_USER_EMAIL_NOT_FOUND && value !== ERROR_USER_EMAIL_NOT_EMPTY) {
                          return <li key={value}>{value}</li>

                        })}
                      </ul>
                    </div>
                  )}
              </Form>
            </div>
          </div>
        )}

        {emailMessageModalOpen && <ThanksModal userEmail={values.email} props={props} hasAction="forgotPassword" />}
        <Responsive maxWidth={767} className="bg-left">
          <h1 className="text-center">MotoMob.me</h1>
          <p className="text-center">bikers only</p>
          <Lottie></Lottie>
        </Responsive>
      </div>
    </>
  )
}

export default ForgotPassword
