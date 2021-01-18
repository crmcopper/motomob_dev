import React, { useState, useContext } from "react"
import { useMutation } from "@apollo/client"
import { CREATE_BIKE } from "../common/gql_api_def"
import { useForm } from "../util/hooks"
import UploadBike from "../components/bike/UploadBike"
import { AuthContext } from "../context/auth"
import Adminbar from "../components/menu/Adminbar"

function BikeUpload() {
  const { user } = useContext(AuthContext)
  const isAdmin = user && user.admin

  const [errors, setErrors] = useState({})
  const [image, setImage] = useState()
  const [selectedBikesImages, setSelectedBikesImages] = useState([])

  const { onChange, onSubmit, values } = useForm(uploadCallback, {
    bikename: "",
    description: "",
    storyUrl: "",
    brand: "",
    category: [],
    isActive: true,
    pictureUrls: [],
    files: [],
    thumbFile: ""
  })

  const resetDropZone = () => {
    values.pictureUrls = []
    values.files = []
    setImage()
    setSelectedBikesImages([])
  }

  const [upload, { loading }] = useMutation(CREATE_BIKE, {
    update(_, { data: { upload: values } }) {
      // Post update, reset the pictureUrls, otherwise the upload of pictures has cumulative effect!
      resetDropZone()
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: values
  })

  function uploadCallback() {
    //console.log(values)
    upload()
  }

  return (
    <div className="ui container">
      <Adminbar />
      <div className="mob form">
        {!isAdmin ? (
          <h4>Tsk tsk! You're not allowed here....</h4>
        ) : (
          <UploadBike
            title="CJ, Upload the bikes!!"
            onSubmit={onSubmit}
            onChange={onChange}
            values={values}
            errors={errors}
            loading={loading}
            setImage={setImage}
            image={image}
            selectedBikesImages={selectedBikesImages}
            setSelectedBikesImages={setSelectedBikesImages}
          />
        )}
      </div>
    </div>
  )
}

export default BikeUpload
