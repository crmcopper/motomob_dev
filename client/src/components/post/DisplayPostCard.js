import React, { useContext, useState, useEffect } from "react"
import { Grid, Header, Dropdown, Modal, Card, Responsive, Button } from "semantic-ui-react"
import ReactHtmlParser from "react-html-parser"
import Share from "../util/Share"
import moment from "moment"
import { Link } from "react-router-dom"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Avatar from "../util/Avatar"
import { AuthContext } from "../../context/auth"
import NotLoggedInModal from "../../components/contest/NotLoggedInModal"
import { SAVE_POST, LIKE_POST_MUTATION, FETCH_POST_QUERY } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import {
  LIKE,
  LIKES,
  SAVE,
  SAVES,
  AGO,
  COMMENTS,
  SHARE,
  EDIT,
  READ_MORE,
  ANSWERS,
  WARNING_DELETE_POST_TITLE,
  WARNING_DELETE_POST_CONTENT,
  WARNING_DELETE_FORUM_POST_TITLE,
  WARNING_DELETE_FORUM_POST_CONTENT
} from "../../util/user-messages"
import DeletePost from "./DeletePost"
import BasicPostModel from "./BasicPostModel"
import { useHistory } from "react-router-dom"
import PostLikeShare from "./PostLikeShare"

function DisplayPostCard({ post, parentAction, deletePost }) {
  const [postData, setPostData] = useState(post)
  const {
    createdAt,
    id,
    username,
    name,
    userId,
    title,
    commentCount,
    pictureUrls,
    avatarUrl,
    postType,
    savedtag,
    saveCount,
    previewBody,
    previewMedia,
    likeCount,
    likes,
    location,
    userbikes,
    bikes,
    when
  } = postData

  const { user } = useContext(AuthContext)
  const postLink = `/posts/${id}`
  const history = useHistory()
  //take off the last charactrer ('/')
  const url = window.location.href.slice(0, -1) + postLink
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [follow, setFollow] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [useSaveCount, setUseSaveCount] = useState(0)

  const [header, setHeader] = useState("")
  const [content, setContent] = useState("")
  const [liked, setLiked] = useState(false)

  const routeChange = userId => {
    let path = `/profile/${userId}`
    history.push(path)
  }

  const postChange = (postLink, event) => {
    //  console.log(event)
    if (event.target === event.currentTarget) {
      // handle
      history.push(postLink)
    }
  }

  useEffect(() => {
    //---get post data this time we need to save count in other const
    setUseSaveCount(saveCount)
  }, [saveCount])

  /* close sign in first modal */
  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  const openShareModal = e => {
    setShareModalOpen(true)
  }

  useEffect(() => {
    if (postType === "BikeForumPost" || postType === "TripForumPost") {
      setHeader("Are you sure you want to delete your question?")
      setContent(
        "We recommend that you keep all the questions so other riders can refer to it in the future. If you delete the question, all the answers and other related information will be lost."
      )
    }
  }, [postType])
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
      const item = likes.find(item => item.username === user.username)
      if (item && Object.keys(item).length > 0) {
        setLiked(true)
      } else {
        setLiked(false)
      }
    } else setLiked(false)
  }, [likes])

  //---call savePost mutation
  const [savePost] = useMutation(SAVE_POST, {
    variables: { postId: id },
    update(store, { data }) {
      let newPostData = data.savePost
      setPostData(newPostData)
    }
  })

  //---call likePost mutation
  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id },
    update: (store, { data }) => {
      setPostData(data.likePost)
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

  function likeAction(event) {
    if (!user) {
      setWarningModalOpen(true)
    } else {
      {
        liked ? setLiked(false) : setLiked(true)
      }
      likePost()
    }
  }

  const CardIconSection = () => {
    return (
      <div className="post-details">
        <Link to={postLink}>
          <div className="d-flex justify-content-between">
            <ul className="post-action">
              <li>
                {likeCount ? likeCount : 0} {LIKES}
              </li>
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
            {parentAction === "searchTrips" ? (
              <span className="post-time">{when}</span>
            ) : (
                <span className="post-time">
                  {moment(createdAt).fromNow(true)} {AGO}
                </span>
              )}
          </div>
        </Link>
        {postType !== "BikeForumPost" && postType !== "TripForumPost" && (
          <Card.Content extra className="post-pointer" onClick={e => postChange(postLink, e)}>
            {/* {liked ? (
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
                    <img src="/assets/images/icons/like-icon.svg" className="red-color align-middle" alt="Save" width="18.947" height="20" />
                    <span className="align-middle">{LIKE}</span>
                  </span>
                </>
              )}

            {follow ? (
              <>
                <span className="svg-icon pointer" onClick={() => saveAction()}>
                  <img src="/assets/images/icons/save-icon.svg" className="align-middle" alt="Like" width="20" height="20" />
                  <span className="align-middle">{SAVE}</span>
                </span>
              </>
            ) : (
                <>
                  <span className="svg-icon pointer" onClick={() => saveAction()}>
                    <img src="/assets/images/icons/gray/save-icon.svg" className="gray-color align-middle" alt="Like" width="20" height="20" />
                    <img src="/assets/images/icons/save-icon.svg" className="red-color align-middle" alt="Like" width="20" height="20" />
                    <span className="align-middle">{SAVE}</span>
                  </span>
                </>
              )}

            <span className="svg-icon pointer" onClick={openShareModal} >
              <img src="/assets/images/icons/gray/share-icon.svg" className="gray-color align-middle" alt="Share" width="20" height="20" />
              <img src="/assets/images/icons/share-icon.svg" className="red-color align-middle" alt="Share" width="20" height="20" />
              <span className="align-middle">{SHARE}</span>
            </span> */}
            <PostLikeShare
              liked={liked}
              follow={follow}
              saveAction={saveAction}
              likeAction={likeAction}
              openShareModal={openShareModal}
            />
          </Card.Content>
        )}
      </div>
    )
  }

  let profileUser = {
    avatarUrl: avatarUrl,
    username: username
  }
  let videoExists = false
  let videoPost = ""

  let webText = ""
  let mobileText = ""
  let webTextLimit = 185
  let mobileTextLimit = 95
  if (previewBody && previewBody != null) {
    if (postType === "BikeForumPost" || postType === "TripForumPost") {
      webTextLimit = 559
      mobileTextLimit = 559
    }
    webText = previewBody.substring(0, webTextLimit)

    mobileText = previewBody.substring(0, mobileTextLimit)
    if (previewBody.includes("iframe")) {
      videoExists = true
    }
  }

  const BikesLocations = () => {
    return (
      (postType === "BikeForumPost" || postType === "TripForumPost") &&
      (!!bikes.length || !!location.length) && (
        <div className="bikes-location-list">
          {!!bikes.length && <Header as="h4">Bikes:</Header>}
          {!!bikes.length &&
            bikes.map((b, i) => (
              <div className="d-inline-block" key={"bike_" + i}>
                <Button basic>{b.bikename}</Button>
              </div>
            ))}
          {!!location.length && <Header as="h4">Locations:</Header>}
          {!!location.length &&
            location.map((l, i) => (
              <div className="d-inline-block" key={"location_" + i}>
                <Button basic>{l}</Button>
              </div>
            ))}
        </div>
      )
    )
  }

  return (
    <>
      <Header className="post-pointer" onClick={() => routeChange(userId)} image>
        {parentAction !== "trips" &&
          <Avatar profileUser={profileUser} />
        }
        <Header.Content>
          {parentAction !== "trips" &&
            <Responsive maxWidth={991}>
              <Header as="h2">{name} </Header>
              <Header.Subheader>
                <span className="text-light">@{username}</span>
              </Header.Subheader>
            </Responsive>
          }
          {parentAction !== "trips" &&
            <Responsive minWidth={992}>
              <Header as="h2">
                {name} <span className="text-light">@{username}</span>
              </Header>
              <Header.Subheader>{userbikes}</Header.Subheader>
            </Responsive>
          }
          <span className="post-date">
            {/* //TODO: Added permissions for admin to delete posts. This should be replaced with procer ACLs. Temp Fix */}
            {user && (user.username === username || user.admin === true) && (
              <Dropdown
                pointing
                className="link item"
                icon={
                  <span className="svg-icon">
                    <img src="/assets/images/icons/gray/dots.svg" className="gray-color" alt="More Vertical" width="5" height="25" />
                    <img src="/assets/images/icons/dots.svg" className="red-color" alt="More Vertical" width="5" height="25" />
                  </span>
                }
              >
                <Dropdown.Menu>
                  {/* //TODO: Hiding this for now as it makes no sense and does not work. In addition, the implementation is weak! */}
                  {/* {!window.location.pathname.includes("profile") && <Dropdown.Item>report post</Dropdown.Item>}
                  {!window.location.pathname.includes("profile") && <Dropdown.Item>hide post</Dropdown.Item>} */}

                  {user && user.username === username && postType != "BasicPost" && (
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
                              <img src="/assets/images/icons/gray/edit-icon.svg" className="gray-color" alt="Edit" width="16" height="16" />
                              <img src="/assets/images/icons/edit-icon.svg" className="red-color" alt="Edit" width="16" height="16" />
                            </span>{" "}
                            {EDIT}
                          </Dropdown.Item>
                        )}
                    </>
                  )}
                  {user && user.username === username && postType === "BasicPost" && (
                    <BasicPostModel title="Edit" postNewType={postType} post={post} addNewPost={false} />
                  )}
                  {user && (user.username === username || user.admin === true) && (
                    <DeletePost
                      postId={id}
                      title="Delete"
                      header={postType === "BikeForumPost" || postType === "BikeForumPost" ? WARNING_DELETE_FORUM_POST_TITLE : WARNING_DELETE_POST_TITLE}
                      deleteContent={
                        postType === "BikeForumPost" || postType === "BikeForumPost" ? WARNING_DELETE_FORUM_POST_CONTENT : WARNING_DELETE_POST_CONTENT
                      }
                      parentAction={parentAction}
                      deletePost={deletePost}
                    />
                  )}
                  {/* <Dropdown.Item>
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
            )}
          </span>
        </Header.Content>
      </Header>
      {!videoExists && (
        <Link to={postLink}>
          {
            <Header className="post-title fixline" as="h2">
              {(postType === "BikeForumPost" || postType === "TripForumPost") && <span className="text-light">Q:</span>}
              {title}
            </Header>
          }
          <div className={(postType === "BikeForumPost" || postType === "TripForumPost" ? "forum-post " : "") + " post-body"} id={id}>
            <Responsive minWidth={992}>
              <p>
                {ReactHtmlParser(webText)}
                {previewBody && previewBody.length > webTextLimit && (
                  <>
                    {" "}
                    ... <span className="text-red">{READ_MORE}</span>
                  </>
                )}
              </p>
            </Responsive>
            <Responsive maxWidth={991}>
              <p>
                {ReactHtmlParser(mobileText)}
                {previewBody && previewBody.length > mobileTextLimit && (
                  <>
                    {" "}
                    ... <span className="text-red">{READ_MORE}</span>
                  </>
                )}
              </p>
            </Responsive>
            {postType !== "BikeForumPost" && postType !== "TripForumPost" && ReactHtmlParser(previewMedia)}
            {BikesLocations()}
          </div>
        </Link>
      )}
      {videoExists && (
        <>
          <Link to={postLink}>
            <Header className="post-title fixline" as="h2">
              {(postType === "BikeForumPost" || postType === "TripForumPost") && <span className="text-light">Q:</span>}
              {title}
            </Header>
          </Link>
          <div className={(postType === "BikeForumPost" || postType === "TripForumPost" ? "forum-post " : "") + " post-body video_post"} id={id}>
            <Link to={postLink} className="d-block">
              <Responsive minWidth={992}>
                <p>
                  {ReactHtmlParser(webText)}
                  {previewBody && previewBody.length > webTextLimit && (
                    <>
                      {" "}
                      ... <span className="text-red">{READ_MORE}</span>
                    </>
                  )}
                </p>
              </Responsive>
              <Responsive maxWidth={991}>
                <p>
                  {ReactHtmlParser(mobileText)}
                  {previewBody && previewBody.length > mobileTextLimit && (
                    <>
                      {" "}
                      ... <span className="text-red">{READ_MORE}</span>
                    </>
                  )}
                </p>
              </Responsive>
              {postType !== "BikeForumPost" && postType !== "TripForumPost" && ReactHtmlParser(previewMedia)}
              {BikesLocations()}
            </Link>
          </div>
        </>
      )}
      {postType === "BasicPost" && (
        <Link to={postLink} className="d-block">
          <Grid columns="equal" className="post-thumbnail">
            {pictureUrls.map(
              (image, key) =>
                key < 5 &&
                key != 0 && (
                  <Grid.Column key={key}>
                    <div className="thumb-img">
                      <img src={image} alt="Close" />
                      {pictureUrls.length > 4 && key === 4 && <span className="overlay-block">+{pictureUrls.length - 4}</span>}
                    </div>
                  </Grid.Column>
                )
            )}
          </Grid>
        </Link>
      )}
      <CardIconSection />
      <Modal onClose={() => setShareModalOpen(false)} open={isShareModalOpen} className="share-modal" size="mini">
        {<Share url={url} title={title ? title : "Motomob.me: Join the community for bikers"} description={"Check out this post on MotoMob.me"} type={"post"} onClose={() => setShareModalOpen(false)} />}
      </Modal>
      <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
        <NotLoggedInModal closeModal={closeWarningModal} />
      </Modal>
    </>
  )
}

export default DisplayPostCard
