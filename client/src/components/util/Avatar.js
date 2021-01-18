import React, { useContext } from "react"
import { Image } from "semantic-ui-react"

import { AuthContext } from "../../context/auth"

const Avatar = ({ profileUser }) => {
  const { user } = useContext(AuthContext)
  const DEFAULT_AVATAR = "/assets/images/richard-pic.png"
  //If profileUser is passed (A user is viewing another user's profile), use it.
  let avatarData = ""

  if (profileUser) {
    if (profileUser.avatarUrl === "") {
      //Dont know how this happens,  but if it does, default it
      avatarData = <Image src={DEFAULT_AVATAR} rounded bordered alt={profileUser.username} />
    } else {
      avatarData = <Image src={profileUser.avatarUrl} rounded bordered alt={profileUser.username} />
    }
  } else if (user && user.avatarUrl !== "") {
    avatarData = <Image src={user.avatarUrl} rounded bordered alt={user.username} />
  } else {
    avatarData = <Image src={DEFAULT_AVATAR} rounded bordered alt={user?.username} />
  }
  return avatarData
}

export default Avatar
