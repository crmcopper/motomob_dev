import React, { useContext, useState, useEffect } from "react"
import { Button, Form, Checkbox } from "semantic-ui-react"
import { useMutation } from "@apollo/client"
import { Link, useHistory } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { useForm } from "../util/hooks"
import { URL_SIGN_UP } from "../util/user-messages"
import { SIGN_IN_USER, RESEND_EMAIL } from "../common/gql_api_def"
import { useLocation } from "react-router-dom"
import { GA_Event } from "../util/google-analytics"
import { BTN_TEXT_NOW, BTN_TEXT_SIGN_IN, BTN_TEXT_SIGN_UP } from "../util/user-messages"

function SignInWithEmail({ props }) {
  const context = useContext(AuthContext)
  const [errors, setErrors] = useState({})
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const [emailMessageModalOpen, setEmailMessageModalOpen] = useState(false)
  const history = useHistory()
  const openEmailMessageModal = e => {
    setEmailMessageModalOpen(true)
  }
  const { onChange, onSubmit, values } = useForm(signinUserCallback, {
    username: "",
    password: ""
  })
  let location = useLocation()
  useEffect(() => {
    setRedirectUrl((location.state && location.state.redirectUrl) || "")
  }, [location.state])

  const [signinUser, { loading }] = useMutation(SIGN_IN_USER, {
    update(_, { data: { signin: user } }) {
      context.login(user)
      props.history.push(redirectUrl)
    },
    onError(err) {
      setUserId(err.graphQLErrors[0].extensions.userId)
      setUserEmail(err.graphQLErrors[0].extensions.userEmail)

      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: values
  })

  function signinUserCallback() {
    signinUser()
  }
  const [passwordShown, setPasswordShown] = useState(false)
  const toggleShowPass = () => {
    setPasswordShown(passwordShown ? false : true)
  }

  const [resendEmail] = useMutation(RESEND_EMAIL, {
    variables: { userId: userId },
    update(store, { data }) {
      //Resend email event log: GA
      GA_Event("Login", "Email confirmation resent", "Register")
      openEmailMessageModal()
    }
  })
  //console.log('values', values)
  return (
    <>
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <Form.Field>
          <label>Username/Email</label>
          <input
            placeholder="Username or Email"
            name="username"
            type="text"
            value={values.username}
            className={errors.username ? "error" : ""}
            onChange={onChange}
          />

          {errors?.username && <span className="error-message">{errors.username}</span>}
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
        <Form.Field className="d-flex justify-content-between">
          <Checkbox label="Remember Me" />
          <Link className="text-red" to="/forgot-password">
            Forgot password?
          </Link>
        </Form.Field>

        {values.password && values.username ? (
          <Button type="submit" color="red">
            {BTN_TEXT_SIGN_IN}
          </Button>
        ) : (
          <Button type="submit" className="disabled" disabled color="red">
            {BTN_TEXT_SIGN_IN}
          </Button>
        )}
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map(value => {
              return <li key={value}>{value}</li>
            })}
          </ul>
        </div>
      )}
      <div className="text-center bottom-fixed">
        Don't have an account yet?{" "}
        <Link className="text-red" to={URL_SIGN_UP}>
          {BTN_TEXT_SIGN_UP} {BTN_TEXT_NOW}
        </Link>
      </div>
    </>
  )
}

export default SignInWithEmail
