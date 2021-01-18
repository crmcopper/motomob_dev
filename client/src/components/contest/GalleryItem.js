import React from "react"
import LikeUnlikePhotoContestImage from "./LikeUnlikePhotoContestImage"

function GalleryItem({ photo, handleImageClick, index, openShareModal, contestId, randomPhotos, setrandomPhotos, contestsClosed }) {
  photo = {
    ...photo,
    userImg: photo.avatarUrl,
  };
  return (
    <div className="gallery-item-container">
      <div className="content-block">
        <div className="gallery-item-photo-container" onClick={() => handleImageClick(photo.id)}>
          <img src={photo.thumbUrl} alt="" />
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
    </div >
  )
}

export default GalleryItem
