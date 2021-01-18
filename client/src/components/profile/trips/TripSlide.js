import React, { useState, useEffect, useContext, useRef } from "react"
import DisplayTripCard from "../../post/DisplayTripCard"
import { Card } from "semantic-ui-react"
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AuthContext } from "../../../context/auth";
import { fetchLimit } from "../../../util/Constants";
import { FETCH_TRIP_BY_NAME_QUERY } from "../../../common/gql_api_def";
import { useLazyQuery } from "@apollo/client";

const TripSlide = ({ post, tripName, parentAction, deletePost }) => {
  const { user } = useContext(AuthContext)
  const userId = user?.id
  const [postData, setPostData] = useState(post)
  const [nextPage, setnextPage,] = useState(2)
  const [getPostsByTripName, { data }] = useLazyQuery(FETCH_TRIP_BY_NAME_QUERY)
  const myInput = useRef();

  function deletePostFromSlide(id) {
    setPostData(postData.filter(post => post.id !== id))
    deletePost()
  }

  useEffect(() => {
    if (data && data.getPostsByTripName && nextPage) {
      let tripData = data.getPostsByTripName;
      setnextPage(tripData.nextPage)
      let allPostData = [...postData, ...tripData.posts]
      setPostData(allPostData)
    }
  }, [data])

  useEffect(() => {
    if (post) {
      setPostData(post)
    }
  }, [post])

  function NextArrow(props) {
    const { className, onClick, currentSlide } = props;
    if (postData.length - 1 === currentSlide && myInput.current) {
      myInput.current.classList.remove('centerMode')
    }
    const onNextButton = () => {
      if (postData.length > currentSlide + 1) {
        onClick()
        if (postData.length - currentSlide === 2 && nextPage) {
          getPostsByTripName({ variables: { pageNo: nextPage, userId: userId, limit: fetchLimit, tripName: tripName } })
        }
      }
    }
    return (
      <div>
        <div className="slider-length">{currentSlide + 1}/{postData.length}</div>
        <div className={className} onClick={onNextButton}></div>
      </div>
    );
  }

  function PrevArrow(props) {
    const { className, style, currentSlide, onClick } = props;
    if (postData.length > currentSlide && myInput.current) {
      myInput.current.classList.add('centerMode')
    }
    return (<div className={className} onClick={onClick}></div>);
  }

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <div className="centerMode overflow-hidden" ref={myInput} >
      <Slider {...settings}  >
        {postData.map((post, i) => (
          <Card fluid className="post-view fixed-view" key={i}>
            <DisplayTripCard post={post} parentAction={parentAction} deletePost={deletePostFromSlide} />
          </Card>
        ))}
      </Slider>
    </div>
  )
}

export default TripSlide
