import React, { useState, useContext } from "react"
import { useMutation } from "@apollo/client"
import { useForm } from "../../util/hooks"
import { EDIT_USER, S3_SIGN_MUTATION, FETCH_USER_QUERY } from "../../common/gql_api_def"
import ProfileForm from "../forms/ProfileForm"
import { AuthContext } from "../../context/auth"
import { uploadToS3 } from "../../util/s3"
import { uploadProfileImage } from "../../util/base64-aws-util"
import { useHistory } from "react-router-dom"

const EditProfile = ({ user }) => {
  const history = useHistory()
  const [errors, setErrors] = useState({})
  const context = useContext(AuthContext)
  const [image, setImage] = useState()
  const [files, setFiles] = useState([])
  const [location, setLocationData] = useState(user.location ? user.location : "")
  const [imageBase64Data, setimageBase64Data] = useState("")
  const [uploadImageLoading, setuploadImageLoading] = useState(false)
  const { onChange, onChangeCustom, onSubmit, values, onRadioChange } = useForm(editUser, {
    userId: user?.id,
    name: user?.name || "",
    username: user?.username,
    email: user?.email,
    usertag: user?.usertag,
    location: user?.location,
    avatarUrl: user?.avatarUrl,
    avatarFile: ""
  })

  const [updateUser, { loading }] = useMutation(EDIT_USER, {
    update(proxy, { data }) {
      setErrors({})
      //Update cache(?)
      data.getUser = data.editUser
      data.getUser.id = user.id
      context.login(data.editUser, false)
      const tempUser = JSON.parse(localStorage.getItem("user"))
      const updatedUser = { ...tempUser, ...data.editUser }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      values.avatarUrl = "" //unset, to be sure of a reload scenario
      proxy.writeQuery({
        query: FETCH_USER_QUERY,
        variables: { userId: user.id },
        data: {
          getUser: data.editUser
        }
      })
      history.push(`/profile/${user.id}`)
    },
    onError(err) {
      console.log(err)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: { ...values }
  })

  const [s3Sign] = useMutation(S3_SIGN_MUTATION, {
    variables: { files: files },
    update(store, { data }) {
      const { s3Sign } = data
      uploadToS3(image, s3Sign)

      //set filename in user table
      values.avatarUrl = s3Sign[0].url
      //update user data
      updateUser()

      setImage()
      setFiles([])
    },
    onError(err) {
      console.log(err)
    }
  })

  /* upload profile image to server */
  async function uploadProfilePicture() {
    if (imageBase64Data !== "") {
      setuploadImageLoading(true)
      const imageUpload = await uploadProfileImage(imageBase64Data, values.userId)
      setuploadImageLoading(false)
      values.avatarUrl = imageUpload
      updateUser()
      setImage()
      setFiles([])
    } else {
      updateUser()
    }
  }

  function editUser() {
    if (image) {
      //Use UserId so that the avatarUrl is always the same and the updated image is used
      // files.push({ name: `${S3Folders.users}/${values.userId}`, type: image[0].type })
      // s3Sign()
      uploadProfilePicture()
    } else {
      updateUser()
    }
  }

  function setParentLocation(data) {
    setLocationData(data || "")
  }
  return (
    <>
      <ProfileForm
        user={user}
        onSubmit={onSubmit}
        onChange={onChange}
        values={values}
        errors={errors}
        showEmail={false}
        showIcon={true}
        showPassword={false}
        showUsertag={false}
        image={image}
        setImage={setImage}
        buttonTitle="Change"
        loading={loading}
        setLocationData={setParentLocation}
        setimageBase64Data={setimageBase64Data}
        uploadImageLoading={uploadImageLoading}
        onRadioChange={onRadioChange}
        readonly={true}
      />
    </>
  )
}

export default EditProfile
