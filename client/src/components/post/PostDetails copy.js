import React, { useContext, useState, useEffect } from "react"
import { Header, Dropdown, Modal } from "semantic-ui-react"
import ReactHtmlParser from "react-html-parser"
import { Card, Responsive } from "semantic-ui-react"
import { AuthContext } from "../../context/auth"
import Share from "../util/Share"
import { SingleImage, TripDetails, BikeDetails, Location } from "../post/BikeSlider"
import moment from "moment"
import { Link } from "react-router-dom"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import ListBikeSlider from "../bike/ListBikeSlider"
import Avatar from "../util/Avatar"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { SAVE_POST, FETCH_POST_QUERY, LIKE_POST_MUTATION, FETCH_NEXT_PREV_TRIP } from "../../common/gql_api_def"
import {
  LIKE,
  LIKES,
  SAVE,
  SAVES,
  AGO,
  COMMENTS,
  SHARE,
  EDIT,
  ANSWERS,
  WARNING_DELETE_POST_TITLE,
  WARNING_DELETE_POST_CONTENT,
  WARNING_DELETE_FORUM_POST_TITLE,
  WARNING_DELETE_FORUM_POST_CONTENT
} from "../../util/user-messages"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { useHistory } from "react-router-dom"
import BasicPostModel from "./BasicPostModel"
import DeletePost from "./DeletePost"
import { store } from "react-notifications-component"

function PostDetails({ post }) {
  const [postData, setPostData] = useState(post)
  const {
    id,
    body,
    createdAt,
    title,
    name,
    commentCount,
    pictureUrls,
    gpxFiles,
    userbikes,
    postType,
    location,
    when,
    days,
    offRoadPercentage,
    bikes,
    username,
    userId,
    avatarUrl,
    saveCount,
    likeCount,
    savedtag,
    likes,
    tripName
  } = postData
  let profileUser = {
    avatarUrl: avatarUrl,
    username: username
  }

  const history = useHistory()
  const { user } = useContext(AuthContext)
  const postLink = `/posts/${id}`
  const [liked, setLiked] = useState(false)
  //take off the last charactrer ('/')
  const url = window.location.href //here the full url is the one we need, unlike in home page
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [follow, setFollow] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [show, setShow] = useState(false)
  const [useSaveCount, setUseSaveCount] = useState(0)
  const [type, setType] = useState("")
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [total, setTotal] = useState(false)
  const [current, setCurrent] = useState(false)

  const [getNextPrevTrip, { data }] = useLazyQuery(FETCH_NEXT_PREV_TRIP)

  const openShareModal = e => {
    setShareModalOpen(true)
  }
  useEffect(() => {
    //---get post data this time we need to save count in other const
    setUseSaveCount(saveCount)
  }, [saveCount])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (user && savedtag && savedtag.includes(user.username)) {
      setFollow(true)
    } else {
      setFollow(false)
    }
  }, [post])

  useEffect(() => {
    //---on page load we have checked comment & ans already liked or not
    if (likes && user) {
      const item = likes.find(item => item.username == user.username)
      if (item && Object.keys(item).length > 0) {
        setLiked(true)
      } else {
        setLiked(false)
      }
    } else setLiked(false)
  }, [likes])

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  const routeChange = userId => {
    let path = `/profile/${userId}`
    history.push(path)
  }

  const [savePost] = useMutation(SAVE_POST, {
    update(store, { data }) {
      let newPostData = data.savePost
      console.log("Save Data", newPostData)
      // setPostData(data.savePost)
    },
    variables: { postId: id }
  })

  //---call likePost mutation
  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id },
    update: (store, { data }) => {
      console.log("likePost", data.likePost)
      // setPostData(data.likePost)
    }
  })

  function saveAction() {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      setFollow(!follow)
      savePost()
    }
  }
  function likeAction() {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      {
        liked ? setLiked(false) : setLiked(true)
      }
      likePost()
    }
  }

  const deletePost = () => {
    store.addNotification({
      title: "Success",
      message: "Your post was deleted!",
      type: "success",
      insert: "top",
      container: "top-center",
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
      dismiss: {
        duration: 5000,
        onScreen: true,
        showIcon: true
      }
    })
    history.goBack()
  }

  /*get next prev trip  */
  const { datamain } = useQuery(FETCH_NEXT_PREV_TRIP, {
    variables: { userId: userId, tripName: tripName ? tripName : "", postId: id, type: type },
    onCompleted: (result) => {
      if (result.getNextPrevTrip) {
        let newPostData = result.getNextPrevTrip;
        setTotal(newPostData.total)
        setCurrent(newPostData.current)

        setHasNext(newPostData.hasNext)
        setHasPrev(newPostData.hasPrev)
      }
    }
  })

  const nextPrevAction = (type) => {
    getNextPrevTrip({ variables: { userId: userId, tripName: tripName, postId: id, type: type } })
  }

  useEffect(() => {
    if (data) {
      if (data.getNextPrevTrip) {
        let newPostData = data.getNextPrevTrip;
        setHasNext(newPostData.hasNext)
        setHasPrev(newPostData.hasPrev)
        setTotal(newPostData.total)
        setCurrent(newPostData.current)
        if (newPostData.postData) {
          setPostData(newPostData.postData)
          let dt = newPostData.postData;
          history.push(`/posts/${dt.id}`)
        }
      }
    }
  }, [data])


  return (
    <>
      {
        tripName &&
        <div className="d-flex justify-content-between align-items-center trip-head">
          <button className="ui button prev-btn" disabled={!hasPrev} onClick={e => { nextPrevAction("prev") }}>Prev Post</button>
          <div><a href={"/trips/" + tripName}>{tripName}</a></div>
          <button className="ui button next-btn" disabled={!hasNext} onClick={e => { nextPrevAction("next") }}>Next Post</button>
        </div>
      }
      {
        post && tripName &&
        <span style={{ float: "right", margin: "5px" }}>{current}/{total}</span>
      }

      <Card fluid className={(postType === "BikeForumPost" || postType === "TripForumPost" ? "forum-post " : "") + " post-view bike-profile"}>

        <Header className="post-pointer" onClick={() => routeChange(userId)} as="h4" image>
          {postType !== "BikeForumPost" && postType !== "TripForumPost" && <Avatar profileUser={profileUser} userId={userId} />}
          <Header.Content>
            {postType !== "BikeForumPost" && postType !== "TripForumPost" && (
              <>
                <Responsive maxWidth={991}>
                  <Header as="h2">{name}</Header>
                  <Header.Subheader>
                    <span className="text-light">@{username}</span>
                  </Header.Subheader>
                </Responsive>
                <Responsive minWidth={992}>
                  <Header as="h2">
                    {name} <span className="text-light">@{username}</span>
                  </Header>
                  <Header.Subheader>{userbikes}</Header.Subheader>
                </Responsive>
              </>
            )}
            {(postType === "BikeForumPost" || postType === "TripForumPost") && (
              <Header as="h2">
                <span className="text-light">Q:</span> {title}
              </Header>
            )}
            <div className="post-head">
              <span className="post-date">
                {user && user.username === username && (
                  <>
                    <span className="svg-icon pointer">
                      <Dropdown
                        pointing
                        className="link item align-middle"
                        icon={
                          <span className="svg-icon">
                            <img src="/assets/images/icons/gray/dots.svg" className="gray-color" alt="More Vertical" width="5" height="25" />
                            <img src="/assets/images/icons/dots.svg" className="red-color" alt="More Vertical" width="5" height="25" />
                          </span>
                        }
                      >
                        <Dropdown.Menu>
                          {postType !== "BasicPost" && (
                            <>
                              {postType !== "BikeForumPost" && postType !== "TripForumPost" ? (
                                <Dropdown.Item as={Link} to={`/post/edit/${id}`}>
                                  <span className="svg-icon">
                                    <img src="/assets/images/icons/gray/edit-icon.svg" className="gray-color" alt="Edit" width="18" height="18" />
                                    <img src="/assets/images/icons/edit-icon.svg" className="red-color" alt="Edit" width="18" height="18" />
                                  </span>{" "}
                                  {EDIT}
                                </Dropdown.Item>
                              ) : (
                                  <Dropdown.Item as={Link} to={`/forum/edit/${id}`}>
                                    <span className="svg-icon">
                                      <img src="/assets/images/icons/gray/edit-icon.svg" className="gray-color" alt="Edit" width="18" height="18" />
                                      <img src="/assets/images/icons/edit-icon.svg" className="red-color" alt="Edit" width="18" height="18" />
                                    </span>{" "}
                                    {EDIT}
                                  </Dropdown.Item>
                                )}
                            </>
                          )}
                          {postType === "BasicPost" && <BasicPostModel show={show} title="Edit" postNewType={postType} post={post} addNewPost={false} />}

                          {user && user.username === username && (
                            <DeletePost
                              postId={id}
                              title="Delete"
                              header={
                                postType === "BikeForumPost" || postType === "BikeForumPost" ? WARNING_DELETE_FORUM_POST_TITLE : WARNING_DELETE_POST_TITLE
                              }
                              deleteContent={
                                postType === "BikeForumPost" || postType === "BikeForumPost" ? WARNING_DELETE_FORUM_POST_CONTENT : WARNING_DELETE_POST_CONTENT
                              }
                              parentAction="details"
                              deletePost={deletePost}
                            />
                          )}
                          {/*
                          <Dropdown.Item>
                            <span className="svg-icon">
                              <img
                                src="/assets/images/icons/gray/hide-icon.svg"
                                className="gray-color"
                                alt="Hide"
                                width="20"
                                height="20"
                              />
                              <img
                                src="/assets/images/icons/hide-icon.svg"
                                className="red-color"
                                alt="Hide"
                                width="20"
                                height="20"
                              />
                            </span> {HIDE}
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <span className="svg-icon">
                              <img
                                src="/assets/images/icons/gray/report-icon.svg"
                                className="gray-color"
                                alt="Report"
                                width="20"
                                height="20"
                              />
                              <img
                                src="/assets/images/icons/report-icon.svg"
                                className="red-color"
                                alt="Report"
                                width="20"
                                height="20"
                              />
                            </span> {REPORT}
                          </Dropdown.Item> */}
                        </Dropdown.Menu>
                      </Dropdown>
                    </span>
                  </>
                )}
              </span>
            </div>
          </Header.Content>
        </Header>
        {postType !== "BikeForumPost" && postType !== "TripForumPost" && (
          <Header className="post-title" as="h2">
            {title}
          </Header>
        )}
        <div className="bike-slider">
          {/* ListBikeSlider for multiple images */}
          {pictureUrls.length > 1 && <ListBikeSlider images={pictureUrls} />}
          {/* SingleImage for a image */}
          {pictureUrls.length === 1 && <SingleImage images={pictureUrls} />}
        </div>

        <div className="post-body">
          <div className="quill ">
            <div className="ql-container ql-snow ql-disabled">
              <div className="ql-editor">{ReactHtmlParser(body)}</div>
            </div>
          </div>
          {/* List of bikes avtar which are selected when create post */}
          {bikes.length > 0 && <BikeDetails bikeData={bikes} postType={postType} />}

          {postType === "TripPost" && <TripDetails when={when} gpxData={gpxFiles} days={days} offRoadPercentage={offRoadPercentage} />}
          <Location location={location} commentCount={commentCount} gpxData={gpxFiles} postType={postType} />
        </div>
        <div className="post-details">
          <Link to={postLink}>
            <div className="d-flex justify-content-between">
              <ul className="post-action">
                <li>{likeCount ? likeCount : 0} {LIKES}</li>
                {postType === "BikeForumPost" || postType === "TripForumPost" ? (
                  <>
                    <li>{useSaveCount ? useSaveCount : 0} {SAVES}</li>
                    <li>{commentCount ? commentCount : 0} {ANSWERS}</li>
                  </>
                ) : (
                    <>
                      <li>{commentCount ? commentCount : 0} {COMMENTS}</li>
                      <li>{useSaveCount ? useSaveCount : 0} {SAVES}</li>
                    </>
                  )}
              </ul>
              <span className="post-time">
                {moment(createdAt).fromNow(true)} {AGO}
              </span>
            </div>
          </Link>
          <Card.Content extra>
            <div className="d-flex justify-content-between">
              <div>
                {liked ? (
                  <>
                    <span className="svg-icon pointer" onClick={() => likeAction()}>
                      <img src="/assets/images/icons/like-icon.svg" className="align-middle" alt="Save" width="18.947" height="20" />
                      <span className="align-middle">{LIKE}</span>
                    </span>
                  </>
                ) : (
                    <>
                      <span className="svg-icon pointer" onClick={() => likeAction()}>
                        <img src="/assets/images/icons/gray/like-icon.svg" className="gray-color align-middle" alt="Save" width="18.947" height="20" />
                        {/* <img src="/assets/images/icons/like-icon.svg" className="red-color align-middle" alt="Save" width="18.947" height="20" /> */}
                        <span className="align-middle">{LIKE}</span>
                      </span>
                    </>
                  )}

                {follow ? (
                  <span className="svg-icon pointer" onClick={() => saveAction()} >
                    <img src="/assets/images/icons/save-icon.svg" className="align-middle" alt="Like" width="20" height="20" />
                    <span className="align-middle">{SAVE}</span>
                  </span>
                ) : (
                    <span className="svg-icon pointer" onClick={() => saveAction()}>
                      <img src="/assets/images/icons/gray/save-icon.svg" className="gray-color align-middle" alt="Like" width="20" height="20" />
                      {/* <img src="/assets/images/icons/save-icon.svg" className="red-color align-middle" alt="Like" width="20" height="20" /> */}
                      <span className="align-middle">{SAVE}</span>
                    </span>
                  )}
                <span className="svg-icon pointer" onClick={openShareModal}>
                  <img src="/assets/images/icons/gray/share-icon.svg" className="gray-color align-middle" alt="Share" width="20" height="20" />
                  {/* <img src="/assets/images/icons/share-icon.svg" className="red-color align-middle" alt="Share" width="20" height="20" /> */}
                  <span className="align-middle">{SHARE}</span></span>
              </div>
            </div>
          </Card.Content>
        </div>
      </Card>
      <Modal onClose={() => setShareModalOpen(false)} open={isShareModalOpen} className="share-modal" size="mini">
        <Share url={url} title={title ? title : "Motomob.me: Join the community for bikers"} description={"Check out this post on MotoMob.me"} type={"post"} onClose={() => setShareModalOpen(false)} />
      </Modal>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default PostDetails
