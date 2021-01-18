import React from "react"
import MyEntriesGalleryItem from "./MyEntriesGalleryItem"
import Lightbox from "react-image-lightbox"
import "react-image-lightbox/style.css"
import { Image } from "semantic-ui-react"
import LikeUnlikePhotoContestImage from "./LikeUnlikePhotoContestImage"

function MyEntriesGallery({ photos = [], openShareModal, handleAddQuery, locationSearch, loading, handleRemoveQuery, redirectToAddPhotos, contestId, imageSlider, setActivePage, randomPhotos, setrandomPhotos, contestsClosed }) {

  const handleImageClick = index => {
    handleAddQuery(index, "MyEntries")
  }

  let imageId = 0;
  if (locationSearch && !loading) {
    photos.map((photo, key) => {
      if (photo.id == locationSearch) {
        imageId = key
      }
    })
    if (imageSlider === "") {
      setActivePage("Gallery")
    }
  }

  return (
    <div className="gallery-container">
      <div className="gallery-row">
        {photos?.map((item, index) => (
          <MyEntriesGalleryItem
            photo={item}
            key={index}
            index={index}
            handleImageClick={handleImageClick}
            openShareModal={openShareModal}
            contestId={contestId}
            randomPhotos={randomPhotos}
            setrandomPhotos={setrandomPhotos}
            contestsClosed={contestsClosed ? true : false}
          />
        ))}
        {!contestsClosed && photos.length < 3 && (
          <div className="gallery-item-container entries-photos">
            <div className="content-block">
              <div className="gallery-item-photo-container no-border-radius">
                <div className="bordered-bx" onClick={redirectToAddPhotos}>
                  <div className="add-bike">
                    <span className="svg-icon">
                      <img src="/assets/images/icons/gray/plus.svg" className="gray-color" alt="Add" width="22" height="21" />
                      <img src="/assets/images/icons/plus.svg" className="red-color" alt="Add" width="22" height="21" />
                    </span>
                    <div className="text-light">Upload a <br />photo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {locationSearch && !loading && photos[imageId] && imageSlider === "MyEntries" && (
        <Lightbox
          mainSrc={photos[imageId].imageUrl}
          nextSrc={photos[(imageId + 1) % photos.length].imageUrl}
          prevSrc={photos[(imageId + photos.length - 1) % photos.length].imageUrl}
          onCloseRequest={handleRemoveQuery}
          onMovePrevRequest={() => {
            handleAddQuery(photos[(+imageId + photos.length - 1) % photos.length].id, "MyEntries")
          }}
          onMoveNextRequest={() => {
            handleAddQuery(photos[(+imageId + 1) % photos.length].id, "MyEntries")
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
                contestsClosed={contestsClosed }
              />
            </section>
          }
          enableZoom
        />
      )
      }
    </div >
  )
}

export default MyEntriesGallery
