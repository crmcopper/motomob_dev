import React, { useState } from "react"
import GalleryItem from "./GalleryItem"
import Lightbox from "react-image-lightbox"
import "react-image-lightbox/style.css"
import { Image, Button } from "semantic-ui-react"
import LikeUnlikePhotoContestImage from "./LikeUnlikePhotoContestImage"

function PastGallery({ photos = [], openShareModal, handleAddQuery, locationSearch, loading, handleRemoveQuery, contestId, randomPhotos, setrandomPhotos, changeFilterOption, contestsClosed }) {
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
  return (
    <>
      <div className="entries-container">
        {/* <h2 className="text-center">New Gallery TOP 3 </h2> */}
        <div className="gallery-container single-photo">
          <div className="gallery-row">
            {photos.length > 0 &&
              <div className="gallery-item-container">
                <div className="content-block">
                  <div className="d-flex justify-content-between gallery-actions">
                    <LikeUnlikePhotoContestImage
                      photo={photos[0]}
                      key={0}
                      index={0}
                      handleImageClick={handleImageClick}
                      openShareModal={openShareModal}
                      contestId={contestId}
                      randomPhotos={randomPhotos}
                      setrandomPhotos={setrandomPhotos}
                      contestsClosed={contestsClosed}
                    />
                  </div>
                  <div className="gallery-item-photo-container" onClick={() => handleImageClick(photos[0].id)}                  >
                    <div className="madal">
                      <img src={"/assets/images/icons/gold-medal-1.svg"} alt="Gold Medal" width="80.338" height="95.044" />
                    </div>
                    <img src={photos[0].thumbUrl} alt="" />
                  </div>
                </div>
              </div >
            }
          </div>
        </div>
        <div className="gallery-container double-photo">
          <div className="gallery-row">
            {photos && photos.length > 1 && photos.map((item, index) => (
              index >= 1 && index < 3 &&
              <div className="gallery-item-container" key={index}>
                <div className="content-block">
                  <div className="gallery-item-photo-container" onClick={() => handleImageClick(item.id)}                  >
                    <div className="madal">
                      <img src={"/assets/images/icons/gold-medal-" + (index + 1) + ".svg"} alt="Gold Medal" width="80.338" height="95.044" />
                    </div>
                    <img src={item.thumbUrl} alt="" />
                  </div>
                  <div className="d-flex justify-content-between gallery-actions">
                    <LikeUnlikePhotoContestImage
                      photo={item}
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
            ))}
          </div>
        </div>

        <h2 className="text-center border-top-1">Top Entries</h2>
      </div>
      <div className="gallery-container">
        <div className="gallery-row">
          {photos && photos.length > 2 && photos.map((item, index) => (
            index > 2 &&
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

export default PastGallery
