import React, { useState } from "react"
import { Modal } from "semantic-ui-react"
import UploadBike from "../../bike/UploadBike"
import { useForm } from "../../../util/hooks"
import { EDIT_BIKE, S3_SIGN_MUTATION } from "../../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import { formatFilename, uploadToS3 } from "../../../util/s3"
import { S3Folders } from "../../../util/Constants"

const EditBike = ({ children, bike }) => {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [image, setImage] = useState()
  const [selectedBikesImages, setSelectedBikesImages] = useState([])
  const [files, setFiles] = useState([]) // to upload to AWS and subsequently store in Mongo (user table) as a Url

  const { onChange, onSubmit, values } = useForm(uploadCallback, {
    bikeId: bike.id,
    bikename: bike?.bikename || "",
    description: bike?.description || "",
    storyUrl: bike?.storyUrl || "",
    brand: bike.brand || "",
    category: !!bike.category?.length ? bike.category : [],
    isActive: bike.isActive,
    pictureUrls: [],
    files: [],
    thumbUrl: bike?.thumbUrl || "",
    thumbFile: "",
    prodStartYear: bike?.prodStartYear || "",
    prodEndYear: bike?.prodEndYear || ""
  })

  const [upload, { loading: editProfileLoading }] = useMutation(EDIT_BIKE, {
    update(store, { data }) {
      //Not needed at all!
      //debugger
      // const bikes = store.readQuery({ query: FETCH_BIKE_BY_NAME_QUERY, variables: {} })

      // store.writeQuery({
      //   query: FETCH_BIKE_BY_NAME_QUERY,
      //   data: {
      //     getBikeByName: bikes
      //   }
      // })

      setOpen(false)
    },
    onError(err) {
      console.log(err)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: values
  })

  const [s3Sign, { loading: uploadFilesLoading }] = useMutation(S3_SIGN_MUTATION, {
    update(store, { data: { s3Sign } }) {
      uploadToS3(values.files, s3Sign)

      values.files = []
      values.pictureUrls = []
      setFiles([])
    },
    onError(err) {
      console.log(err)
    },
    variables: { files: files }
  })

  function uploadCallback() {
    if (!!values?.files?.length) {
      //prep the file to send for S3 signature
      let _file
      values.files.map((file, key) => {
        _file = { name: `${S3Folders.bikes}/${formatFilename(file.name)}`, type: file.type }
        files.push(_file)
        values.pictureUrls[key] = _file.name
      })
    }

    if (image) {
      //prep the file to send for S3 signature
      const _file = { name: `${S3Folders.bike_thumbnails}/${values.bikeId}`, type: image[0].type }
      values.thumbUrl = _file.name
      values.thumbFile = image[0].name
      values.files.push(image[0])
      files.push(_file)
    }

    if (!!files.length) {
      setFiles(files)
      s3Sign()
    }

    upload()
  }

  return (
    <Modal size="small" closeIcon open={open} onClose={() => setOpen(false)} onOpen={() => setOpen(true)} trigger={children}>
      <Modal.Header>Edit bike</Modal.Header>
      <Modal.Content scrolling>
        <UploadBike
          bike={bike}
          onSubmit={onSubmit}
          onChange={onChange}
          values={values}
          errors={errors}
          loading={uploadFilesLoading || editProfileLoading}
          setImage={setImage}
          image={image}
          selectedBikesImages={selectedBikesImages}
          setSelectedBikesImages={setSelectedBikesImages}
        />
      </Modal.Content>
    </Modal>
  )
}

export default EditBike
