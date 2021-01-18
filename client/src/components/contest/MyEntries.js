import React, { useState, useContext } from "react"
import { useQuery } from "@apollo/client"
import { FETCH_CONTEST_QUERY } from "../../common/gql_api_def"
import { AuthContext } from "../../context/auth"
import MyEntriesGallery from "../../components/contest/MyEntriesGallery"
import { useHistory } from "react-router-dom"
import "react-image-lightbox/style.css"
import { Container, Modal } from "semantic-ui-react"
import MaxUploadedPhotos from "../../components/contest/MaxUploadedPhotos"
import MyLikedGallery from "../../components/contest/MyLikedGallery"
import ContestsParticipate from "../../pages/ContestsParticipate"

const MyEntries = (props) => {
    const { user } = useContext(AuthContext)
    const [showUpload, setShowUpload] = useState(false)
    const history = useHistory()
    let photos = props.photos ? props.photos : []
    let contestsClosed = props.contestsClosed ? props.contestsClosed : false
    const [ismaxUploadLimitModal, setismaxUploadLimitModal] = useState(false)
    let myPhotos = photos.filter(p => p.username == user.username)

    const redirectToAddPhotos = () => {
        // setShowUpload(true)
        if (myPhotos.length < 3) {
            history.push(`/photo-contests/participate/${props.contestId}`)
        }
        // else {
        //     setismaxUploadLimitModal(true)
        // }
    }
    const closeMaxUploadModal = () => {
        setismaxUploadLimitModal(false)
    }
    let myLikedPhotos = []
    photos.map(photo => {
        let pushed = false;
        if (props.tempUnlikedImages) {
            if (props.tempUnlikedImages.length) {
                let unliked = props.tempUnlikedImages.filter(p => p.id == photo.id)
                if (unliked.length) {
                    unliked.map(u => {
                        myLikedPhotos.push(u)
                        pushed = true
                    })
                }
            }
        }
        if (photo.likes) {
            photo.likes.map(like => {
                if (like.username == user.username) {
                    if (!pushed) {
                        myLikedPhotos.push(photo)
                    }
                }
            })
        }
    })
    return (
        <div className="entries-container">
            {showUpload && <ContestsParticipate history={history} contestId={props.contestId} setShowUpload={setShowUpload} />}
            {!showUpload && <h2 className="text-center">Your photos</h2>}
            {user && !showUpload && (
                <MyEntriesGallery
                contestsClosed={contestsClosed}
                    photos={myPhotos}
                    openShareModal={props.openShareModal}
                    handleAddQuery={props.handleAddQuery}
                    locationSearch={props.locationSearch}
                    loading={props.loading}
                    handleRemoveQuery={props.handleRemoveQuery}
                    redirectToAddPhotos={redirectToAddPhotos}
                    contestId={props.contestId}
                    imageSlider={props.imageSlider}
                    setActivePage={props.setActivePage}
                    randomPhotos={props.randomPhotos}
                    setrandomPhotos={props.setrandomPhotos}
                />
            )}
            {!showUpload && <h2 className="text-center border-top-1">Photos you’ve liked</h2>}
            {user && !showUpload && (
                <MyLikedGallery
                    photos={myLikedPhotos}
                    openShareModal={props.openShareModal}
                    handleAddQuery={props.handleAddQuery}
                    locationSearch={props.locationSearch}
                    loading={props.loading}
                    handleRemoveQuery={props.handleRemoveQuery}
                    contestId={props.contestId}
                    imageSlider={props.imageSlider}
                    setActivePage={props.setActivePage}
                    unlikedPhotosFromSlider={props.unlikedPhotosFromSlider}
                    settempUnlikedImages={props.settempUnlikedImages}
                    randomPhotos={props.randomPhotos}
                    setrandomPhotos={props.setrandomPhotos}
                    contestsClosed={contestsClosed}
                />
            )}
            <Modal onClose={closeMaxUploadModal} open={ismaxUploadLimitModal} className="warning-modal" size="small">
                <MaxUploadedPhotos closeModal={closeMaxUploadModal} />
            </Modal>
        </div>
    )
}

export default MyEntries
