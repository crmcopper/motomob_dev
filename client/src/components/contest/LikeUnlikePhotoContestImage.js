import React, { useState, useContext } from "react"
import { FETCH_CONTEST_QUERY, LIKE_UNLIKE_PHOTO_CONTEST_IMAGE } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import { AuthContext } from "../../context/auth"
import { Modal } from "semantic-ui-react"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { useLocation } from "react-router-dom"
import { parse } from "query-string"
import Avatar from "../util/Avatar"
import { Header } from "semantic-ui-react"

function LikeUnlikePhotoContestImage({
  photo: { avatarUrl, userImg, id, imageUrl, thumbUrl, username, likes } = {},
  index, openShareModal, contestId, unlikedPhotosFromSlider, randomPhotos, setrandomPhotos, contestsClosed }) {
  const locationObject = useLocation()
  const locationSearch = parse(locationObject.search).image
  let url = `${window.location.href}?image=${id}`
  if (locationSearch) {
    url = `${window.location.href}`
  }
  const { user } = useContext(AuthContext)
  const [errors, setErrors] = useState({})
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)

  const [likeUnlikePhoto, { loading }] = useMutation(LIKE_UNLIKE_PHOTO_CONTEST_IMAGE, {
    update(store, { data: { likeUnlikePhotoContestImage } }) {
      const galleryData = store.readQuery({
        query: FETCH_CONTEST_QUERY,
        variables: { contestId }
      })
      let tempRandomPhotos = []
      randomPhotos.map(p => {
        let tempPhoto = {
          id: p.id,
          username: p.username,
          imageUrl: p.imageUrl,
          thumbUrl: p.thumbUrl,
          avatarUrl: p.avatarUrl,
          likes: p.likes ? p.likes : [],
        }
        if (tempPhoto.imageUrl === likeUnlikePhotoContestImage.imageUrl && tempPhoto.thumbUrl === likeUnlikePhotoContestImage.thumbUrl) {
          let tempLikes = []
          if (tempPhoto.likes) {
            tempPhoto.likes.map(u => {
              tempLikes.push(u)
            })
            if (tempPhoto.likes.find(like => like.username === user.username)) {
              let tLikes = []
              tempLikes.map(l => {
                if (l.username !== user.username) {
                  tLikes.push(l)
                }
              })
              tempLikes = tLikes
            } else {
              tempLikes.push({
                username: user.username,
                id: user.id,
                avatarUrl: user.avatarUrl
              })
            }
          } else {
            tempLikes.push({
              username: user.username,
              id: user.id,
              avatarUrl: user.avatarUrl
            })
          }
          tempPhoto.likes = tempLikes
          tempRandomPhotos.push(tempPhoto)
        } else {
          tempRandomPhotos.push(tempPhoto)
        }
      })
      setrandomPhotos(tempRandomPhotos)


      let allPhotos = []
      if (galleryData.getContest.photos) {
        galleryData.getContest.photos.map((p) => {
          let tempPhoto = {
            id: p.id,
            username: p.username,
            imageUrl: p.imageUrl,
            thumbUrl: p.thumbUrl,
            likes: p.likes ? p.likes : [],
          }
          if (tempPhoto.imageUrl == likeUnlikePhotoContestImage.imageUrl && tempPhoto.thumbUrl == likeUnlikePhotoContestImage.thumbUrl) {
            let tempLikes = []
            if (tempPhoto.likes) {
              tempPhoto.likes.map(u => {
                tempLikes.push(u)
              })
              if (tempPhoto.likes.find(like => like.username === user.username)) {
                let tLikes = []
                tempLikes.map(l => {
                  if (l.username !== user.username) {
                    tLikes.push(l)
                  }
                })
                tempLikes = tLikes
              } else {
                tempLikes.push({
                  username: user.username,
                  id: user.id,
                  avatarUrl: user.avatarUrl
                })
              }
            } else {
              tempLikes.push({
                username: user.username,
                id: user.id,
                avatarUrl: user.avatarUrl
              })
            }
            tempPhoto.likes = tempLikes
            allPhotos.push(tempPhoto)
          } else {
            allPhotos.push(p)
          }
        })
      }
      store.writeQuery({
        query: FETCH_CONTEST_QUERY,
        data: {
          getContest: {
            ...galleryData.getContest,
            photos: allPhotos,
          }
        }
      })
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors)
    },
    variables: {
      contestId: contestId,
      imageUrl: imageUrl,
      thumbUrl: thumbUrl,
    }
  })

  const openNotLoggedInModal = () => {
    setWarningModalOpen(true)
  }
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }
  const storeunlikedPhotosFromSlider = (id, imageUrl, thumbUrl, username, liketype) => {
    if (unlikedPhotosFromSlider) {
      unlikedPhotosFromSlider(id, imageUrl, thumbUrl, username, liketype)
    }
  }
  const userd = {
    avatarUrl: userImg ? userImg : avatarUrl
  }
  const likeAction = (id, imageUrl, thumbUrl, username, type) => {
    if (!contestsClosed) {
      likeUnlikePhoto()
      storeunlikedPhotosFromSlider(id, imageUrl, thumbUrl, username, type)
    }
  }
  return (
    <>
      <Header>
        <Avatar profileUser={userd} width='50' /> <span className="align-middle">{username}</span>
      </Header>
      <div>
        <span className="svg-icon align-middle" onClick={() => openShareModal(imageUrl, "", url, true)}>
          <img src="/assets/images/icons/gray/share-with.svg" className="gray-color align-middle" alt="Share" width="20" height="20" />
          <img src="/assets/images/icons/share-with.svg" className="red-color align-middle" alt="Share" width="20" height="20" />
        </span>
        <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
          <NotLoggedInModal closeModal={closeWarningModal} />
        </Modal>
        {user ? (
          <>
            {likes && likes.find(like => like.username === user.username) ? (
              <span className="svg-icon align-middle"
                onClick={() => { likeAction(id, imageUrl, thumbUrl, username, "unlike") }}>
                <img src="/assets/images/icons/heart.svg" className="gray-color align-middle" alt="Heart" width="20" height="20" />
                <img src="/assets/images/icons/heart.svg" className="red-color align-middle" alt="Heart" width="20" height="20" />
              </span>
            ) : (
                <span className="svg-icon align-middle"
                  onClick={() => { likeAction(id, imageUrl, thumbUrl, username, "like") }}>
                  <img src="/assets/images/icons/gray/heart.svg" className="gray-color align-middle" alt="Heart" width="20" height="20" />
                  <img src="/assets/images/icons/gray/heart.svg" className="red-color align-middle" alt="Heart" width="20" height="20" />
                </span>
              )}
          </>
        ) : (
            <span className="svg-icon align-middle" onClick={() => openNotLoggedInModal()}>
              <img src="/assets/images/icons/gray/heart.svg" className="gray-color align-middle" alt="Heart" width="20" height="20" />
              <img src="/assets/images/icons/heart.svg" className="red-color align-middle" alt="Heart" width="20" height="20" />
            </span>
          )}
        <span className="text-light align-middle">
          {likes ? likes.length : 0}
        </span>
      </div>
    </>
  )
}

export default LikeUnlikePhotoContestImage
