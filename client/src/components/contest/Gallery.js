import React, { useState } from "react"
import GalleryItem from "./GalleryItem"
import Lightbox from "react-image-lightbox"
import "react-image-lightbox/style.css"
import { Image, Button } from "semantic-ui-react"
import LikeUnlikePhotoContestImage from "./LikeUnlikePhotoContestImage"

function Gallery({ photos = [], openShareModal, handleAddQuery, locationSearch, loading, handleRemoveQuery, contestId, randomPhotos, setrandomPhotos, changeFilterOption, contestsClosed }) {
  const [displayType, setDisplayType] = useState("random")
  const handleImageClick = index => {
    handleAddQuery(index)
  }
  let imageId = 0;
  if (locationSearch && !loading) {
    photos.map((photo, key) => {
      if (photo.id == locationSearch) {
        imageId = key
      }
    })
  }
  const handleTypeClick = index => {
    setDisplayType(index)
    changeFilterOption(index)
  }
  return (
    <>
      <div className="d-flex justify-content-between filter-block align-items-center">
        <Button type="button" basic={displayType !== "random"} onClick={() => handleTypeClick("random")} color="red">
          <img src={displayType !== "random" ? "/assets/images/icons/randomize-red.svg" : "/assets/images/icons/randomize.svg"} alt="Randomize" width="16" height="16" className="align-middle" />
          <span className="align-middle">Randomize</span>
        </Button>
        <Button.Group>
          <Button type="button" basic={displayType !== "most_recent"} color="red" onClick={() => handleTypeClick("most_recent")}>Most Recent</Button>
          <Button type="button" basic={displayType !== "most_liked"} color='red' onClick={() => handleTypeClick("most_liked")}>Most Liked</Button>
        </Button.Group>
      </div>

      <div className="gallery-container">
        <div className="gallery-row">
          {photos?.map((item, index) => (
            <GalleryItem
              photo={item}
              key={index}
              index={index}
              handleImageClick={handleImageClick}
              openShareModal={openShareModal}
              contestId={contestId}
              locationSearch={locationSearch}
              randomPhotos={randomPhotos}
              setrandomPhotos={setrandomPhotos}
              contestsClosed={contestsClosed}
            />
          ))}
          {locationSearch && !loading && photos[imageId] && (
            <Lightbox
              mainSrc={photos[imageId].imageUrl}
              nextSrc={photos[(imageId + 1) % photos.length].imageUrl}
              prevSrc={photos[(imageId + photos.length - 1) % photos.length].imageUrl}
              onCloseRequest={handleRemoveQuery}
              onMovePrevRequest={() => {
                handleAddQuery(photos[(+imageId + photos.length - 1) % photos.length].id)
              }}
              onMoveNextRequest={() => {
                handleAddQuery(photos[(+imageId + 1) % photos.length].id)
              }}
              imageCaption={
                <section className="user-actions-container">
                  <LikeUnlikePhotoContestImage
                    photo={photos[imageId]}
                    key={imageId}
                    index={imageId}
                    handleImageClick={handleImageClick}
                    openShareModal={openShareModal}
                    contestId={contestId}
                    randomPhotos={randomPhotos}
                    setrandomPhotos={setrandomPhotos}
                    contestsClosed={contestsClosed}
                  />
                </section>
              }
              enableZoom
            />
          )}
        </div>
      </div>
    </>
  )
}

export default Gallery
