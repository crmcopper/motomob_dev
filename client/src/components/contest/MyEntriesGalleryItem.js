import React, { useState, useContext } from "react"
import { Image, Grid, Modal, Button } from "semantic-ui-react"
import { FETCH_CONTEST_QUERY, DELETE_PHOTO_CONTEST_IMAGE } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import LikeUnlikePhotoContestImage from "./LikeUnlikePhotoContestImage"

function MyEntriesGalleryItem({ photo: { id, imageUrl, thumbUrl, likes } = {}, photo, handleImageClick, index, openShareModal, contestId, randomPhotos, setrandomPhotos, contestsClosed }) {

  const url = `${window.location.href}?image=${id}`

  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [deletePhoto, { loading }] = useMutation(DELETE_PHOTO_CONTEST_IMAGE, {
    update(store, { data: { deletePhotoContestImage } }) {
      const galleryData = store.readQuery({
        query: FETCH_CONTEST_QUERY,
        variables: { contestId }
      })
      let allPhotos = []
      if (galleryData.getContest.photos) {
        galleryData.getContest.photos.map((p) => {
          if (p.imageUrl == deletePhotoContestImage.imageUrl && p.username == deletePhotoContestImage.username) {
          } else {
            allPhotos.push(p)
          }
        })
      }

      let tempRandomPhotos = []
      randomPhotos.map(p => {
        if (p.imageUrl == deletePhotoContestImage.imageUrl && p.username == deletePhotoContestImage.username) {
        } else {
          tempRandomPhotos.push(p)
        }
      })
      setrandomPhotos(tempRandomPhotos)

      store.writeQuery({
        query: FETCH_CONTEST_QUERY,
        data: {
          getContest: {
            ...galleryData.getContest,
            photos: allPhotos,
          }
        }
      })
      setConfirmOpen(false)
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors)
    },
    variables: {
      contestId,
      imageUrl: imageUrl
    }
  })
  const closeModal = () => {
    setConfirmOpen(false)
  }
  return (
    <>
      <div className="gallery-item-container entries-photos">
        {!loading && !contestsClosed && (
          <span className="delete-photo-button" onClick={() => setConfirmOpen(true)}>
            <img src="/assets/images/close.svg" alt="Delete" width="16" height="16" />
          </span>
        )}
        <div className="content-block">
          <div className="gallery-item-photo-container" onClick={() => handleImageClick(id)}          >
            <img src={thumbUrl} alt="" />
          </div>
          <div className="d-flex justify-content-between gallery-actions">
            <LikeUnlikePhotoContestImage
              photo={photo}
              key={index}
              index={index}
              handleImageClick={handleImageClick}
              openShareModal={openShareModal}
              contestId={contestId}
              randomPhotos={randomPhotos}
              setrandomPhotos={setrandomPhotos}
              contestsClosed={contestsClosed}
            />
          </div>
        </div>
      </div>
      <Modal open={confirmOpen} className="warning-modal delete-photo-warning-modal" size="small">
        <Modal.Content className="warning-modal-content">
          <button className="close-button" onClick={closeModal}>
            <img src="/assets/images/icons/close-red.svg" className="red-color" alt="Close" width="16" height="16" fill="red" />
          </button>
          <h1>Are you sure?</h1>
          <p>Are you sure you want to delete the image? if you do you will loose any likes you earned from other riders.
        </p>
          <div className="buttons-container">
            <Button type="button" color="red" disabled={loading} onClick={deletePhoto}>
              Yes
          </Button>
            <Button type="button" className="btn-cancel white-addon" color="red" onClick={closeModal}>
              No
          </Button>
          </div>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default MyEntriesGalleryItem
