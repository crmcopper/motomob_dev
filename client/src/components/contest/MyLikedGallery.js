import React from "react"
import MyLikedGalleryItem from "./MyLikedGalleryItem"
import Lightbox from "react-image-lightbox"
import "react-image-lightbox/style.css"
import { Image, Grid } from "semantic-ui-react"
import LikeUnlikePhotoContestImage from "./LikeUnlikePhotoContestImage"
import { parseHTML } from "cheerio"

function MyLikedGallery({ photos = [], openShareModal, handleAddQuery, locationSearch, loading, handleRemoveQuery, contestId, imageSlider, setActivePage, unlikedPhotosFromSlider,settempUnlikedImages, randomPhotos, setrandomPhotos,contestsClosed }) {

  const handleImageClick = index => {
    handleAddQuery(index,"MyLiked")
  }

  let imageId = 0;
  if(locationSearch && !loading ){
    photos.map((photo,key)=>{
      if(photo.id == locationSearch){
        imageId = key
      }
    })
    if(imageSlider === ""){
      setActivePage("Gallery")
    }
  }

  return (
    <div className="gallery-container">
      <div className="gallery-row">
      {photos?.map((item, index) => (
        <MyLikedGalleryItem
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
      ))}
      </div>
      {locationSearch && !loading && photos[imageId] && imageSlider === "MyLiked" && (
        <Lightbox
          mainSrc={photos[imageId].imageUrl}
          nextSrc={photos[(imageId + 1) % photos.length].imageUrl}
          prevSrc={photos[(imageId + photos.length - 1) % photos.length].imageUrl}
          onCloseRequest={()=>{handleRemoveQuery();if(settempUnlikedImages){settempUnlikedImages([])}}}
          onMovePrevRequest={() => {
            handleAddQuery(photos[(+imageId + photos.length - 1) % photos.length].id,"MyLiked")
          }}
          onMoveNextRequest={() => {
            handleAddQuery(photos[(+imageId + 1) % photos.length].id,"MyLiked")
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
                  unlikedPhotosFromSlider={unlikedPhotosFromSlider}
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
  )
}

export default MyLikedGallery
