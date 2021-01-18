import React, { useEffect, useState } from "react"
import { useMutation } from "@apollo/client"

import { LIKE_POST_MUTATION } from "../common/gql_api_def"

function LikePost({ user, post: { id, likeCount, likes } }) {
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (user && likes.find((like) => like.username === user.username)) {
      setLiked(true)
    } else setLiked(false)
  }, [user, likes])

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id }
  })

  return (
    <div>
      {liked ? <i className="star red icon" onClick={likePost}></i> : <i className="star icon" onClick={likePost}></i>}
      {likeCount}
    </div>
  )
}

export default LikePost
