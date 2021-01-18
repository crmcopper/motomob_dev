import React, { useState, useEffect, useRef } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Popup, Button, Header } from "semantic-ui-react"
import axios from "axios"
import fileDownload from "js-file-download"
import { Link } from "react-router-dom"

export const ImageSlider = ({ images }) => {
  const [state, setState] = useState({
    nav1: null,
    nav2: null
  })

  const slider1 = useRef()
  const slider2 = useRef()

  useEffect(() => {
    setState({
      nav1: slider1.current,
      nav2: slider2.current
    })
  }, [])

  const { nav1, nav2 } = state

  let infinite = true
  let centermode = false
  let centerpadding = false
  let imglen = 4
  let sliderClass = "thumbnail"

  if (imglen > 3) {
    sliderClass = "thumbnail"
  } else if (imglen > 2) {
    sliderClass = "thumbnail slider-three"
    centermode = true
    centerpadding = "82px"
  } else if (imglen > 1) {
    sliderClass = "thumbnail slider-two"
  } else {
    sliderClass = "thumbnail slider-one"
  }
  if (images.length <= 4) {
    infinite = false
  }
  return (
    <>
      <Slider asNavFor={nav2} ref={slider => (slider1.current = slider)} arrows={false}>
        {images.length > 0 &&
          images.map((img, i) => {
            return (
              <div key={i}>
                <img src={img} alt="slide" width="544" height="340" />
              </div>
            )
          })}
      </Slider>
      <Slider
        asNavFor={nav1}
        ref={slider => (slider2.current = slider)}
        slidesToShow={imglen}
        arrows={true}
        swipeToSlide={true}
        focusOnSelect={true}
        className={sliderClass}
        infinite={infinite}
        centerMode={centermode}
        centerPadding={centerpadding}
      >
        {images &&
          images.length > 0 &&
          images.map((img, i) => {
            return (
              <div key={"thumbnail_" + i}>
                <img src={img} alt="slide" width="544" height="340" />
              </div>
            )
          })}
      </Slider>
    </>
  )
}

export const SingleImage = ({ images }) => {
  let img = images[0]
  return (
    <>
      <img src={img} alt="slide" width="544" height="340" className="full-img" />
    </>
  )
}

export const TripDetails = ({ when, days, offRoadPercentage, gpxData }) => {
  function downloadGpxFile(gpxData) {
    gpxData.map(file => {
      axios
        .get(file, {
          responseType: "blob"
        })
        .then(res => {
          fileDownload(res.data, file.substring(file.lastIndexOf("/") + 1))
        })
    })
  }
  return (
    <div className="gpx-map">
    <img src="/assets/images/gpx-map.png" alt="" className="gpx-bg" />
    {gpxData.length > 0 && ( <div className="download-gpx" onClick={() => { downloadGpxFile(gpxData) }}>
      <a className="ui button">
          <img
            src="/assets/images/icons/gpx-map.svg"
            className="red-color align-middle"
            alt="Download GPX"
            width="20"
            height="20"
          />
          <span className="align-middle">Download GPX</span>
      </a> 
    </div> )}
    <ul className="gpx-map-overlay">
        <li>Trip duration: <span>{days} days</span></li>
        <li>Trip start date: <span>{when}</span></li>
        <li>On Road/Off Road: <span>{100 - offRoadPercentage}/{offRoadPercentage}</span></li>
    </ul>
    </div>
  )
}

export const BikeDetails = ({ bikeData, postType }) => {
  return (
    <div className="bikes">
      {(postType === "BikeForumPost" || postType === "TripForumPost")?(
        <Header as="h4">Bikes:</Header>
      ):(
        <Header as="h2">Bikes</Header>
      )}
      {bikeData.length > 0 &&
        bikeData.map((img, i) => {
          let bikeLink = "/bike/" + img.bikeId
          return (
            (postType === "BikeForumPost" || postType === "TripForumPost")?(
              <div className="d-inline-block" key={"bike_" + i}>
                <Button basic>{img.bikename}</Button>
              </div>
            ):(
              <div key={"thumbnail_" + i} className="d-inline-block">
                <Popup
                  content={img.bikename}
                  trigger={
                    <Link to={bikeLink}  rel="noopener noreferrer">
                      <img src={img.thumbUrl} alt="slide" width="48" height="48" className="rounded" />
                      <span className="bikes-name">{img.bikename}</span>
                    </Link>
                  }
                  position="bottom left"
                />
              </div>
            )
          )
        })}
    </div>
  )
}

export const Location = ({ location, commentCount, gpxData, postType }) => {
  return (
    <>      
      {/* <div className="bike-details">
         <div className="d-inline-block">
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/followers.svg" className="align-middle" alt="fans" width="16" height="16" />
          </span>{" "}
          <span className="align-middle text-light">15k followers</span>
        </div> 
        <div className="d-inline-block">
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/chat.svg" className="align-middle" alt="fans" width="18" height="16" />
          </span>{" "}
          <span className="align-middle text-light">{commentCount} comments</span>
        </div>
      </div> */}
      {location.length > 0 && (
        <div className="bike-details location-list">
          {(postType === "BikeForumPost" || postType === "TripForumPost")?(
            <Header as="h4">Locations:</Header>
          ):(
            <div className="d-inline-block location-icon">
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/location.svg" className="align-middle" alt="location" width="11" height="16" />
              </span>
            </div>
          )}
          {location.map((l, i) => {
            return (
              <div className="d-inline-block" key={"thumbnail_" + i}>
                <Button basic>{l}</Button>
              </div>
            )
          })}
        </div>
      )}
      
    </>
  )
}
