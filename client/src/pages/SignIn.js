import React, { useContext, useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { GA_Event } from "../util/google-analytics"
import { Responsive, Dimmer, Loader } from "semantic-ui-react"
import { useMutation } from "@apollo/client"
import FacebookDiaLog from "./modal/FacebookDiaLog"
import Header from "../layout/Header"
import UserProfile from "../components/forms/UserProfile"
import SignInWithEmail from "./SignInWithEmail"
import GoogleDialog from "./modal/GoogleDialog"
import { SIGN_IN_WITH_PROVIDER, SIGN_UP_USER, RESEND_EMAIL } from "../common/gql_api_def"
import { useForm } from "../util/hooks"
import { defaultAvtarBase64 } from "../util/Constants"
import { BTN_TEXT_SIGN_IN, BTN_TEXT_NOW, H1_TEXT_MOTOMOBME, P_TEXT_BIKERS_ONLY } from "../util/user-messages"
import { uploadProfileImage } from "../util/base64-aws-util"
import { AuthContext } from "../context/auth"
import ThanksModal from "./modal/ThanksModal"
import Lottie from "../util/Lottie"

function SignIn(props) {
  const context = useContext(AuthContext)
  const [showEmail, setShowEmail] = useState(true)
  const [registerDescription, setRegisterDescription] = useState(true)
  const [showLocation, setShowLocation] = useState(true)
  const [showName, setShowName] = useState(true)
  const [showPassword, setShowPassword] = useState(true)
  //default open sign in options
  const [signinOrSignupOptions, setsigninOrSignupOptions] = useState(true)
  const [accessToken, setAccessToken] = useState("")
  const [errors, setErrors] = useState({})
  const [userId, setUserId] = useState("")
  const [socailMediaLoader, setSocialMediaLoader] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")
  const [emailMessageModalOpen, setEmailMessageModalOpen] = useState(false)
  const [files, setFiles] = useState([]) // to upload to AWS and subsequently store in Mongo (user table) as a Url
  const [image, setImage] = useState()
  const [ownBikes, setBikesData] = useState([])
  const [location, setLocationData] = useState("")
  const [imageBase64Data, setimageBase64Data] = useState("")
  const [uploadImageLoading, setuploadImageLoading] = useState(false)
  let getlocation = useLocation()
  const [provider, setProvider] = useState("")

  useEffect(() => {
    setRedirectUrl((getlocation.state && getlocation.state.redirectUrl) || "")
  }, [getlocation.state])

  const openEmailMessageModal = () => {
    setEmailMessageModalOpen(true)
    setsigninOrSignupOptions(true)
  }

  const [signinWithProvider, { loadingForProvider }] = useMutation(SIGN_IN_WITH_PROVIDER, {
    update(_, { data: { signinWithProvider: user } }) {
      setSocialMediaLoader(false)
      context.login(user)
      props.history.push(redirectUrl)
    },
    onError(err) {
      setSocialMediaLoader(false)
      console.log("err", err)
      if (err.graphQLErrors[0].message === "USER_NOT_FOUND") {
        values.name = err.graphQLErrors[0].extensions.name
        values.access_token = err.graphQLErrors[0].extensions.access_token
        values.email = err.graphQLErrors[0].extensions.email
        values.provider = err.graphQLErrors[0].extensions.provider
        setsigninOrSignupOptions(false)
        err.graphQLErrors[0].extensions.email ? setShowEmail(false) : setShowEmail(true)
        err.graphQLErrors[0].extensions.name ? setShowName(false) : setShowName(true)

        setShowPassword(false)
        setShowLocation(true)
        setRegisterDescription(false)
      }
    },
    variables: { access_token: accessToken, provider }
  })

  // const [signinWithGoogleMutation, { loadingforgoogle }] = useMutation(SIGN_IN_WITH_GOOGLE, {
  //   update(_, { data: { signinWithGoogle: user } }) {
  //     context.login(user)
  //     props.history.push(redirectUrl)
  //   },
  //   onError(err) {
  //     console.log(err)
  //     if (err.graphQLErrors[0].message === 'USER_NOT_FOUND') {
  //       values.name = err.graphQLErrors[0].extensions.name
  //       values.access_token = err.graphQLErrors[0].extensions.access_token
  //       values.email = err.graphQLErrors[0].extensions.email
  //       values.provider = err.graphQLErrors[0].extensions.provider
  //       setsigninOrSignupOptions(false)
  //       err.graphQLErrors[0].extensions.email ? setShowEmail(false) : setShowEmail(true)
  //       err.graphQLErrors[0].extensions.name ? setShowName(false) : setShowName(true)
  //       setShowPassword(false)
  //       setShowLocation(true)
  //       setRegisterDescription(false)
  //     }
  //   },
  //   variables: { access_token: accessToken }
  // })

  const { onChange, onSubmit, values } = useForm(registerUser, {
    name: "",
    username: "",
    email: "",
    avatarUrl: "/assets/images/richard-pic.png",
    avatarFilename: "",
    password: "",
    location: "",
    ownBikes: [],
    usertag: "",
    provider: "",
    access_token: ""
  })
  function getAccessToken(data) {
    setAccessToken(data)
  }

  const [addUser, { loading }] = useMutation(SIGN_UP_USER, {
    update(_, { data: { signup: user } }) {
      if (user.status !== "normal") {
        //At this stage, upload picture here using the ID returned
        //https://motomob-test.s3.eu-west-2.amazonaws.com/avatars/5f68d1403d94aa70c47d93a6
        uploadProfilePicture(user, showEmail)
      } else if (user.status === "normal" && (user.facebookId || user.googleId)) {
        uploadProfilePicture(user, false)
      } else {
        //Email verification has arrived: all well!
        context.login(user)
        props.history.push("/")
      }
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: {
      ...values,
      ownBikes
    }
  })
  function setParentBikeData(data) {
    setBikesData(data || [])
  }

  function setParentLocation(data) {
    setLocationData(data || "")
  }

  /* upload profile image to server */
  async function uploadProfilePicture(user, openConfirmEmailPopup) {
    let imagePath = ""
    if (imageBase64Data) {
      imagePath = imageBase64Data
    } else {
      imagePath = defaultAvtarBase64
    }
    if (imagePath && user.id) {
      setuploadImageLoading(true)
      const imageUpload = await uploadProfileImage(imagePath, user.id)
      if (imageUpload) {
        setuploadImageLoading(false)
      }
    } else {
      setuploadImageLoading(false)
    }
    //If user enter email address then open confirm email message popup
    if (openConfirmEmailPopup) {
      setsigninOrSignupOptions(false)
      openEmailMessageModal()
    } else {
      context.login(user)
      props.history.push("/")
    }
  }

  function registerUser() {
    if (image) {
      addUser()
    } else {
      addUser()
    }
  }

  const [resendEmail] = useMutation(RESEND_EMAIL, {
    variables: { userId: userId },
    update(store, { data }) {
      //Resend email event log: GA
      GA_Event("Login", "Email confirmation resent", "Register")
      openEmailMessageModal()
    }
  })

  const onSigninWithFb = () => {
    setSocialMediaLoader(true)
    setProvider("facebook")
    signinWithProvider()
  }

  const onsigninWithGoogle = () => {
    setSocialMediaLoader(true)
    setProvider("google")
    signinWithProvider()
  }

  const goBack = () => {
    setsigninOrSignupOptions(true)
    setEmailMessageModalOpen(false)
  }
  return (
    <>
      <div className=" landing-bx d-flex justify-content-between ">
        <Header />
        {signinOrSignupOptions && !emailMessageModalOpen ? (
          <div className="form-bx loading">
            <div className="d-flex align-items-center">
              <div className="fluid-width">
                {socailMediaLoader && (
                  <Dimmer active className="bg-color">
                    <Loader />
                  </Dimmer>
                )}

                <h1 className="text-center">
                  {BTN_TEXT_SIGN_IN} {BTN_TEXT_NOW}!
                </h1>
                <GoogleDialog onSigninOrSignup={onsigninWithGoogle} values={values} accessToken={getAccessToken} />
                <FacebookDiaLog onSigninOrSignup={onSigninWithFb} values={values} accessToken={getAccessToken} />
                <div className="or-wrap">OR</div>

                <SignInWithEmail props={props} />
              </div>
            </div>
          </div>
        ) : (
          <UserProfile
            onSubmit={onSubmit}
            onChange={onChange}
            values={values}
            errors={errors}
            image={image}
            showEmail={showEmail}
            showName={showName}
            showPassword={showPassword}
            showLocation={showLocation}
            registerDescription={registerDescription}
            loading={loading}
            loadingForProvider={loadingForProvider}
            setBikesData={setParentBikeData}
            setLocationData={setParentLocation}
            uploadImageLoading={uploadImageLoading}
            goBack={goBack}
          />
        )}
        {emailMessageModalOpen && <ThanksModal userEmail={values.email} props={props} />}
        <Responsive maxWidth={767} className="bg-left">
          <h1 className="text-center">{H1_TEXT_MOTOMOBME}</h1>
          <p className="text-center">{P_TEXT_BIKERS_ONLY}</p>
          <Lottie></Lottie>
        </Responsive>
      </div>
    </>
  )
}
export default SignIn
