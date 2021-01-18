import React, { useState } from "react"
import { useMutation } from "@apollo/client"
import { useForm } from "../util/hooks"
import { RESET_PASSWORD_MUTATION } from "../common/gql_api_def"
import { URL_SIGN_IN, ERROR_USER_EMAIL_INCORRECT } from "../util/user-messages"
import { Button, Form, Grid, Responsive } from "semantic-ui-react"
import { Link } from "react-router-dom"
import Header from "../layout/Header"
import Lottie from "../util/Lottie"

const ResetPassword = props => {
  const token = props.match.params.token
  const [errors, setErrors] = useState({})
  const { onChange, onSubmit, values } = useForm(resetPasswordCallback, {
    email: "",
    password: "",
    token: token
  })

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION, {
    update(_, { data }) {
      props.history.push(URL_SIGN_IN)
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: values
  })

  function resetPasswordCallback() {
    resetPassword()
  }
  const [passwordShown, setPasswordShown] = useState(false)
  const toggleShowPass = () => {
    setPasswordShown(passwordShown ? false : true)
  }

  return (
    <>
      <div className="landing-bx d-flex justify-content-between">
        <Header />
        <div className="form-bx">
          <div className="d-flex align-items-center">
            <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
              <h1 className="text-center">Create new password</h1>

              <Form.Field>
                <label>Your Email Address</label>
                <input
                  placeholder="Your email address"
                  name="email"
                  type="text"
                  value={values.email}
                  error={errors.email ? true : false}
                  onChange={onChange}
                  className={errors?.email ? "error" : ""}
                />
                {errors?.email && <span className="error-message">{errors.email}</span>}
              </Form.Field>
              <Form.Field>
                <label>Password</label>
                <div className="pass_show no-label">
                  <input
                    placeholder="Password"
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
            </Form>
            {Object.keys(errors).length > 0 && Object.values(errors).indexOf(ERROR_USER_EMAIL_INCORRECT) !== -1 && (
              <div className="ui error message">
                <ul className="list">
                  {Object.values(errors).map(value => {
                    if (value === ERROR_USER_EMAIL_INCORRECT) {
                      return <li key={value}>{value}</li>
                    }
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Responsive maxWidth={767} className="bg-left">
          <h1 className="text-center">MotoMob.me</h1>
          <p className="text-center">bikers only</p>
          <Lottie></Lottie>
        </Responsive>
      </div>
    </>
  )
}

export default ResetPassword
