import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import ContestsListItem from "../../components/contest/ContestsListItem"
import { FETCH_CONTESTS_QUERY } from "../../common/gql_api_def"
import ContestsNavBar from "../../components/contest/ContestsNavBar"
import Navigation from "../../layout/Navigation"
import { Dimmer, Loader, Modal } from "semantic-ui-react"
import Share from "../../components/util/Share"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

function Contests() {
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [image, setImage] = useState("")
  const [activeTab, setActiveTab] = useState("Contests")
  const [pastContest, setPastContest] = useState([])
  const [contests, SetContests] = useState([])
  const [isloading, SetIsloading] = useState(true)

  const { loading, data } = useQuery(FETCH_CONTESTS_QUERY, {
    variables: { isActive: true },
    onCompleted: result => {
      SetContests(result.getContests)
    }
  })

  const { getPastContest } = useQuery(FETCH_CONTESTS_QUERY, {
    variables: { isActive: true, contestsClosed: true },
    onCompleted: result => {
      setPastContest(result.getContests)
      SetIsloading(false)
    }
  })

  const openShareModal = (image, title, url, e) => {
    e.preventDefault()
    setShareModalOpen(true)
    setImage(image)
    setTitle(title)
    setUrl(url)
  }
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    swipeToSlide: true,
    adaptiveHeight: '100%'
  };
  const setActiveContest = (name) => {
    setActiveTab(name)
  }
  return (
    <Navigation contests>
      <div className="contests-page-container">
        <ContestsNavBar setActiveContest={setActiveContest} activeTab={activeTab} />
        {(loading || isloading) ? (
          <Dimmer active>
            <Loader />
          </Dimmer>
        ) : (
            activeTab === "Past contests" ?
              (
                pastContest.length > 0 ?
                  <Slider {...settings}>
                    {pastContest.map((item, index) => (
                      <ContestsListItem key={index} contest={item} openShareModal={openShareModal} contestsClosed={true} />
                    ))}
                  </Slider>
                  :
                  <div className="no-data">No Contests Available</div>
              )
              :
              contests.length > 0 ?
                <Slider {...settings}>
                  {contests.map((item, index) => (
                    <ContestsListItem key={index} contest={item} openShareModal={openShareModal} />
                  ))}
                </Slider>
                :
                <div className="no-data">No Contests Available</div>
          )}
        <Modal onClose={() => setShareModalOpen(false)} open={isShareModalOpen} className="share-modal" size="mini">
          <Share url={url} title={title} imageUrl={image} description={"Check out this photo competition on MotoMob.me"} type={"photo-contests"} onClose={() => setShareModalOpen(false)} />
        </Modal>
      </div>
    </Navigation >
  )
}

export default Contests