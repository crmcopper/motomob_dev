import React, { useState, useContext, useEffect } from "react"
import { useQuery } from "@apollo/client"
import { FETCH_CONTEST_QUERY } from "../../common/gql_api_def"
import GalleryNavigation from "../../components/contest/GalleryNavigation"
import Gallery from "../../components/contest/Gallery"
import Navigation from "../../layout/Navigation"
import ParticipateModal from "../../components/contest/ParticipateModal"
import { AuthContext } from "../../context/auth"
import { Dimmer, Loader, Modal } from "semantic-ui-react"
import ParticipateShareActions from "../../components/contest/ParticipateShareActions"
import PrizesCriteriaPage from "../../components/contest/PrizesCriteriaPage"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"

import { useLocation } from "react-router-dom"
import { parse } from "query-string"
import Share from "../../components/util/Share"
import MyEntries from "../../components/contest/MyEntries"
import moment from "moment"
import PastGallery from "../../components/contest/PastGallery"

function ContestGallery(props) {
  const contestId = props.match.params.contestId
  const contestsClosed = props.match.params.contestsClosed

  const { user } = useContext(AuthContext)
  const locationObject = useLocation()
  const locationSearch = parse(locationObject.search).image
  let photoContestsActiveTab = localStorage.getItem("photoContestsActiveTab")
  const [activePage, setActivePage] = useState(photoContestsActiveTab ? photoContestsActiveTab : "Gallery")
  const [isParticipateModalOpen, setParticipateModalOpen] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isImageShare, setImageShare] = useState(false)
  const [image, setImage] = useState("")
  const [filter, setFilter] = useState("random")
  const [imageSlider, setimageSlider] = useState("")
  const [tempUnlikedImages, settempUnlikedImages] = useState([])
  const [randomPhotos, setrandomPhotos] = useState([])
  const [contestData, setContestData] = useState({})

  let allPhotosToDisplay = []
  const { loading, data: { getContest: { title, photos, closingDate, imageUrl, sponsors, } = {} } = {} } = useQuery(FETCH_CONTEST_QUERY, {
    variables: { contestId },
    onCompleted: data => {
      setContestData(data.getContest)
      if (data.getContest.photos) {
        randominzePhotos(data.getContest.photos)
      }
    }
  })

  const randominzePhotos = photosArray => {
    let allPhotos = []
    if (photosArray.length) {
      photosArray.map(p => {
        allPhotos.push(p)
      })
    }
    if (allPhotos.length) {
      for (var i = 0; i < allPhotos.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (allPhotos.length - i))
        var temp = allPhotos[j]
        allPhotos[j] = allPhotos[i]
        allPhotos[i] = temp
      }
    }
    let sortByLikes = allPhotos.sort((a, b) => parseFloat(b.likes.length) - parseFloat(a.likes.length));
    setrandomPhotos(contestsClosed ? sortByLikes : allPhotos)
  }

  let myPhotos = []
  let remaingImages = 3
  if (filter === "most_recent") {
    allPhotosToDisplay = photos
  } else if (filter === "most_liked") {
    let mostLiked = []
    photos.map(p => {
      mostLiked.push(p)
    })
    mostLiked.sort(function (a, b) {
      return b.likes.length - a.likes.length
    })
    allPhotosToDisplay = mostLiked
  } else {
    allPhotosToDisplay = randomPhotos
  }
  if (allPhotosToDisplay && allPhotosToDisplay.length && user) {
    myPhotos = allPhotosToDisplay.filter(p => p.username == user.username)
    if (myPhotos.length <= 3) {
      remaingImages = 3 - myPhotos.length
    } else {
      remaingImages = 0
    }
  }

  const handleAddQuery = (imagePosition, sliderType = "") => {
    setimageSlider(sliderType)
    props.history.push(`${window.window.location.pathname}?image=${imagePosition}`)
  }

  const openParticipateModal = () => {
    if (user) {
      //setParticipateModalOpen(true)
      if (remaingImages === 0) {
        setActivePage("My entries")
        localStorage.setItem("photoContestsActiveTab", "My entries")
      } else {
        props.history.push({ pathname: `/photo-contests/participate/${contestId}` })
      }
    } else {
      setWarningModalOpen(true)
    }
  }

  const closeParticipateModal = () => {
    setParticipateModalOpen(false)
  }

  const openShareModal = (image, title, url, bool) => {
    setShareModalOpen(true)
    setUrl(url)
    setImage(image)
    setImageShare(bool)
  }

  const handleRemoveQuery = () => {
    if (contestsClosed) {
      props.history.push({
        pathname: `/photo-contests/${contestsClosed}/${contestId}`
      })
    } else {
      props.history.push({
        pathname: `/photo-contests/${contestId}`
      })
    }
  }

  const closeWarningModal = () => {
    if (activePage == "My entries") {
      setActivePage("Gallery")
      localStorage.setItem("photoContestsActiveTab", "Gallery")
    }
    setWarningModalOpen(false)
  }

  const closeShareModal = () => {
    setShareModalOpen(false)
  }

  const locationUrl = window.location.href

  const openNotLoggedInModal = () => {
    if (!isWarningModalOpen) {
      setWarningModalOpen(true)
    }
  }
  const changeFilterOption = option => {
    if (option === "random") {
      randominzePhotos(photos)
    }
    setFilter(option)
  }

  useEffect(() => {
    if (window.location.hash && window.location.hash == "#criteria") {
      setActivePage("Criteria")
    }
  }, [window.location])

  const unlikedPhotosFromSlider = (photoId, imageUrl, thumbUrl, username, liketype) => {
    let tempPhotos = []
    tempUnlikedImages.map(p => {
      if (p.id !== photoId) {
        tempPhotos.push(p)
      }
    })
    tempPhotos.push({
      id: photoId,
      imageUrl: imageUrl,
      thumbUrl: thumbUrl,
      username: username,
      likes: [
        {
          username: liketype === "like" ? user.username : "",
          id: user.id,
          avatarUrl: user.avatarUrl
        }
      ]
    })
    settempUnlikedImages(tempPhotos)
  }

  return (
    <Navigation contests>
      {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
          <div className="gallery-page-container">
            <div className="gallery-header-container" style={{ backgroundImage: `url(${imageUrl})` }}>
              {/* <Link to={"/photo-contests"} className="back-button">
                <img src="/assets/images/icons/back-to-gallery.svg" alt="" />
              </Link> */}
              <div className="container-layer-overlay" />
              <button className="actions-share pointer" onClick={(e) => openShareModal(imageUrl, title, locationUrl, e)}>
                <img
                  src="/assets/images/icons/share-white-icon.svg"
                  alt="Followers"
                  width="20"
                  height="20"
                />
              </button>
              <div className="content-centered-block">
                <div className="content-block">
                  <div className="text-center">
                    <div className="contest-title">{title}</div>
                    <div className="contest-subtitle">{`Closing on the ${moment(closingDate).format("YYYY MMM DD")}`}</div>
                    <ParticipateShareActions
                      openParticipateModal={openParticipateModal}
                      buttonText={contestsClosed ? "Closed" : "Upload Images (" + remaingImages + "/3)"}
                      displayRemaing={user ? true : false}
                      disabled={contestsClosed}
                      remaingImages={remaingImages}
                    />
                  </div>
                </div>
                <div className="contest-sponsors">
                  <span>Sposored by</span>
                  <div className="sponsors-logos">
                    {sponsors && sponsors.length > 0 && sponsors.map((sponsor, index) => {
                      return (
                        <div className="sponsor-logo-container" key={index}>
                          <img src={sponsor.imageUrl} alt={sponsor.name} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <GalleryNavigation setActivePage={setActivePage} activePage={activePage} contestId={contestId} changeFilterOption={changeFilterOption} />
            {activePage === "Gallery" ? (
              contestsClosed ?
                <PastGallery
                  contestsClosed={contestsClosed}
                  photos={allPhotosToDisplay}
                  openShareModal={openShareModal}
                  handleAddQuery={handleAddQuery}
                  locationSearch={locationSearch}
                  loading={loading}
                  handleRemoveQuery={handleRemoveQuery}
                  contestId={contestId}
                  randomPhotos={randomPhotos}
                  setrandomPhotos={setrandomPhotos}
                  changeFilterOption={changeFilterOption}
                />
                :
                <Gallery
                  contestsClosed={contestsClosed}
                  photos={allPhotosToDisplay}
                  openShareModal={openShareModal}
                  handleAddQuery={handleAddQuery}
                  locationSearch={locationSearch}
                  loading={loading}
                  handleRemoveQuery={handleRemoveQuery}
                  contestId={contestId}
                  randomPhotos={randomPhotos}
                  setrandomPhotos={setrandomPhotos}
                  changeFilterOption={changeFilterOption}
                />
            ) : (
                <>
                  {activePage === "My entries" ? (
                    <>
                      {user ? (
                        <MyEntries
                          contestsClosed={contestsClosed}
                          contestId={contestId}
                          photos={allPhotosToDisplay}
                          openShareModal={openShareModal}
                          handleAddQuery={handleAddQuery}
                          locationSearch={locationSearch}
                          loading={loading}
                          handleRemoveQuery={handleRemoveQuery}
                          setWarningModalOpen={setWarningModalOpen}
                          imageSlider={imageSlider}
                          setActivePage={setActivePage}
                          unlikedPhotosFromSlider={unlikedPhotosFromSlider}
                          settempUnlikedImages={settempUnlikedImages}
                          tempUnlikedImages={tempUnlikedImages}
                          randomPhotos={randomPhotos}
                          setrandomPhotos={setrandomPhotos}
                        />
                      ) : (
                          openNotLoggedInModal()
                        )}
                    </>
                  ) : (
                      <PrizesCriteriaPage
                        contestsClosed={contestsClosed}
                        contestId={contestId}
                        page={activePage}
                        contestData={contestData} />
                    )}
                </>
              )}
            <Modal onClose={closeParticipateModal} open={isParticipateModalOpen} className="participate-modal">
              <ParticipateModal closeModal={closeParticipateModal} title={title} user={user} contestId={contestId} />
            </Modal>
            <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
              <NotLoggedInModal closeModal={closeWarningModal} />
            </Modal>
            <Modal onClose={closeShareModal} open={isShareModalOpen} className="share-modal" size="mini">
              <Share
                url={url}
                title={title}
                imageUrl={image}
                description={"Check out this photo contests on MotoMob.me"}

                // description={"Check out this photo contests on MotoMob.me"}
                type={"photo-contests"}
                onClose={closeShareModal}
              />
            </Modal>
          </div>
        )}
    </Navigation>
  )
}

export default ContestGallery
