import React, { useState } from "react"
import { useMutation, useLazyQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import { Modal, Form } from "semantic-ui-react"
import { useForm } from "../../util/hooks"
import { ADD_CONTEST_PHOTO, FETCH_CONTEST_QUERY, S3_SIGN_MUTATION, FETCH_BIKE_BY_NAME_QUERY } from "../../common/gql_api_def"
import UploadPhoto from "./UploadPhoto"
import Avatar from "../util/Avatar"
import { S3Folders } from "../../util/Constants"
import { formatFilename, uploadToS3 } from "../../util/s3"
import MultiSearchSelect from "../post/MultiSearchSelect"

function ParticipateModal({ closeModal, title, contestId }) {
  const [errors, setErrors] = useState({})
  const [image, setImage] = useState("")
  const files = []
  const [tempSearch, settempSearch] = useState("")
  const [bikes, setbikes] = useState([])
  const [bikesSelected, setbikesSelected] = useState([])
  const [searchBikeByName, { data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)

  const { onSubmit, values } = useForm(uploadCallback, {
    imageUrl: "",
    contestId: contestId,
    bikesSelected: [],
    bikes: [],
    tempSearch: ""
  })

  const resetDropZone = () => {
    values.imageUrl = ""
  }

  function uploadCallback() {
    if (image) {
      files.push({ name: `${S3Folders.contests}/${formatFilename(image[0].name)}`, type: image[0].type })
    }

    if (!!files.length) {
      s3Sign()
    }
  }

  const [upload] = useMutation(ADD_CONTEST_PHOTO, {
    update(store, { data: { addPhotoToContest } }) {
      closeModal()

      const galleryData = store.readQuery({
        query: FETCH_CONTEST_QUERY,
        variables: { contestId }
      })

      store.writeQuery({
        query: FETCH_CONTEST_QUERY,
        data: {
          getContest: {
            ...galleryData.getContest,
            photos: [addPhotoToContest, ...galleryData.getContest.photos]
          }
        }
      })
      resetDropZone()
      setErrors({})
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors)
    },
    variables: {
      imageUrl: values.imageUrl,
      contestId: contestId,
      bikeId: bikesSelected.length > 0 ? bikesSelected[0].bikeId : "",
      bikename: bikesSelected.length > 0 ? bikesSelected[0].bikename : "",
      thumbUrl: bikesSelected.length > 0 ? bikesSelected[0].thumbUrl : ""
    }
  })

  const [s3Sign] = useMutation(S3_SIGN_MUTATION, {
    update(store, { data: { s3Sign } }) {
      uploadToS3(image, s3Sign)
      values.imageUrl = s3Sign[0].url

      upload()
    },
    onError(err) {
      console.log(err)
    },
    variables: { files: files }
  })

  /* received searched bike list */
  let searchedWhichBike = []
  if (data) {
    for (let b = 0; b < data.getBikeByName.length; b++) {
      searchedWhichBike.push({
        id: data.getBikeByName[b].id,
        label: data.getBikeByName[b].bikename,
        image: data.getBikeByName[b].thumbUrl ? data.getBikeByName[b].thumbUrl : "https://react.semantic-ui.com/images/wireframe/image.png",
        description: ""
      })
    }
  }
  // console.log(bikesSelected)
  return (
    <>
      <Modal.Header>
        <div className="header-content-container">
          <div className="user-picture">
            <Avatar />
          </div>
          <div className="modal-header-title-block">
            <span className="title">Enter the contest</span>
            <span className="modal-subtitle">{title}</span>
          </div>
        </div>
        <button className="close-button" onClick={closeModal}>
          <img src="/assets/images/icons/close-red.svg" className="red-color" alt="Close" width="16" height="16" fill="red" />
        </button>
      </Modal.Header>
      <Modal.Content className="participate-modal-content">
        <Modal.Description>
          <Form className={"post-input bike-post-input form-container"}>
            <UploadPhoto values={values} setImage={setImage} image={image} />

            <div className="text-block"></div>

            <MultiSearchSelect
              searchable={true}
              showTags={true}
              multiSelect={true}
              onSelect={e => {
                //  console.log(e)
                let bikes = []
                let bikesSelected = []
                if (e.length) {
                  e.map((bike, i) => {
                    if (i < 1) {
                      bikes.push({
                        bikeId: bike.bikeId ? bike.bikeId : bike.id,
                        bikename: bike.bikename ? bike.bikename : bike.label,
                        image: bike.image ? bike.image : bike.image
                      })
                      bikesSelected.push({
                        bikeId: bike.bikeId ? bike.bikeId : bike.id,
                        bikename: bike.bikename ? bike.bikename : bike.label,
                        thumbUrl: bike.image ? bike.image : bike.image
                      })
                    }
                  })
                }
                setbikes(bikes)
                setbikesSelected(bikesSelected)
              }}
              options={searchedWhichBike}
              placeholder="Which bike?"
              selected={bikes}
              onUserInput={value => {
                if (value.length > 1 && tempSearch !== value) {
                  settempSearch(value)
                  searchBikeByName({ variables: { bikename: value } })
                }
              }}
              error={errors?.bikes ? true : false}
            />

            <div className="text-block">
              <span className="title">Criteria</span>
              <p className="text-paragraph">
                Will be showcased as a recommended photographer in the community and featured in our social media.{" "}
                <Link to={"#!"} className="link">
                  Criteria
                </Link>
              </p>
            </div>
            <div className="text-block">
              <span className="title">Terms & conditions</span>
              <p className="text-paragraph">
                Will be showcased as a recommended photographer in the community and featured in our social media.{" "}
                <Link to={"#!"} className="link">
                  Terms & Conditions
           </Link>
              </p>
            </div>
            <p className="light-text">Will be showcased as a recommended photographer in the community and featured in our social media.</p>
            <button className="agree-participate-button" type="submit" onClick={onSubmit} disabled={!image || bikesSelected.length === 0}>
              Agree & Participate
            </button>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </>
  )
}

export default ParticipateModal
