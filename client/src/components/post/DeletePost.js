import React, { useState, useContext } from "react"
import { useMutation } from "@apollo/client"
import { Confirm, Dropdown } from "semantic-ui-react"
import {
  DELETE_POST_MUTATION,
  FETCH_POSTS_QUERY,
} from "../../common/gql_api_def"
import { AuthContext } from "../../context/auth"
import { fetchLimit } from "../../util/Constants"
import { useHistory } from "react-router-dom"

function DeletePost({
  postId,
  callback,
  title,
  header = "",
  deleteContent = "",
  parentAction,
  deletePost,
}) {
  const { user } = useContext(AuthContext)
  const usertag = user?.usertag || ""
  const userId = user?.id
  const history = useHistory()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [onDeletePost] = useMutation(DELETE_POST_MUTATION, {
    update(store, { data }) {
      setConfirmOpen(false)
      if (postId) {
        //TODO---we need to removed data from cache direclty
        try {
          //delete from posts
          const postsData = store.readQuery({
            query: FETCH_POSTS_QUERY,
            variables: {
              cursor: "",
              usertag,
              limit: fetchLimit,
              type: "posts",
            },
          })

          let allPosts = postsData.getPosts.posts
          let filterPostData = allPosts.filter((row) => row.id !== postId)

          store.writeQuery({
            query: FETCH_POSTS_QUERY,
            variables: {
              cursor: "",
              usertag,
              limit: fetchLimit,
              type: "posts",
            },
            data: {
              getPosts: [filterPostData, ...postsData.getPosts.posts],
            },
          })

        } catch (err) {
          console.log(err)
        }

        try {
          //delete from userTrips

          const userTripsPostsData = store.readQuery({
            query: FETCH_POSTS_QUERY,
            variables: {
              cursor: "",
              usertag: userId,
              limit: fetchLimit,
              type: "userTrips",
            },
          })

          let allUserTripsPosts = userTripsPostsData.getPosts.posts
          let filterTripsPostData = allUserTripsPosts.filter((row) => row.id !== postId)

          store.writeQuery({
            query: FETCH_POSTS_QUERY,
            variables: {
              cursor: "",
              usertag: userId,
              limit: fetchLimit,
              type: "userTrips",
            },
            data: {
              getPosts: [filterTripsPostData, ...userTripsPostsData.getPosts.posts],
            },
          })

        } catch (err) {
          console.log(err)
        }
        try {
          //delete from userPost

          const userPostsData = store.readQuery({
            query: FETCH_POSTS_QUERY,
            variables: {
              cursor: "",
              usertag: userId,
              limit: fetchLimit,
              type: "userPosts",
            },
          })

          let allUserPosts = userPostsData.getPosts.posts
          let filterUserPostData = allUserPosts.filter((row) => row.id !== postId)

          store.writeQuery({
            query: FETCH_POSTS_QUERY,
            variables: {
              cursor: "",
              usertag: userId,
              limit: fetchLimit,
              type: "userPosts",
            },
            data: {
              getPosts: [filterUserPostData, ...userPostsData.getPosts.posts],
            },
          })
        } catch (err) {
          console.log(err)
        }
        deletePost(postId)

      }
    },
    variables: {
      postId,
    },
  })

  return (
    <>
      <Dropdown.Item onClick={() => setConfirmOpen(true)}>
        <span className="svg-icon">
          <img
            src="/assets/images/icons/gray/remove-icon.svg"
            className="gray-color"
            alt="Delete"
            width="16"
            height="16"
          />
          <img
            src="/assets/images/icons/remove-icon.svg"
            className="red-color"
            alt="Delete"
            width="16"
            height="16"
          />
        </span> {title}
      </Dropdown.Item>
      {deleteContent !== "" ? (
        <Confirm
          closeIcon
          open={confirmOpen}
          className={(parentAction === "details" ? "delete-from-details " : "") + " delete-modal"}
          onCancel={() => setConfirmOpen(false)}
          header={header}
          content={deleteContent}
          onConfirm={onDeletePost}
          confirmButton="Yes"
        />
      ) : (
          <Confirm
            closeIcon
            open={confirmOpen}
            size="mini"
            className="confirm-modal"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={onDeletePost}
            confirmButton="Yes"
          />
        )}
    </>
  )
}

export default DeletePost
