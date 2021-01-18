import React, { useReducer, createContext } from "react"
import { refreshTokenTime } from "../util/Constants"
import axios from "axios"
import { print } from "graphql"
import { REFRESH_TOKEN } from "../common/gql_api_def"

//Keep a valariable that indicates whether to refresh or not. Default: true
let isRefreshing = true

//If user exists in localstorage, use it
let user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : ""

//Save the access token in memory only. Provide accessors to set/get the token
let token = ""
const setAccessToken = tiktok => {
  console.log("Refreshing token... ")
  token = tiktok
}
export const getAccessToken = () => {
  return token
}

//If there is a user in the local storage, check the token validity
if (user) {
  // Refresh the access token; the user closed the browser and didnt log out!
  getRefreshToken(user.refreshToken)
} else {
  isRefreshing = false
}

//TODO: We dont need this anymore, do we?
const initialState = {
  user: user
}

const AuthContext = createContext({
  user: user, //loaded from localstorage, if available
  login: (user, isFirstTime = true) => {},
  logout: () => {}
})

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload
      }
    case "LOGOUT":
      return {
        ...state,
        user: null
      }
    default:
      return state
  }
}
function getRefreshToken(refreshToken) {
  if (!refreshToken) {
    //no point proceeding if there's no refresh token
    return
  }

  const headers = {
    "Content-Type": "application/json"
  }

  const data = {
    query: print(REFRESH_TOKEN),
    variables: { refreshToken }
  }

  axios
    .post(process.env.REACT_APP_SERVER_URL, data, {
      headers: headers
    })
    .then(response => {
      const tok = response.data.data.refreshAccessToken
      if (tok) {
        setAccessToken(tok)
      } else {
        //remove from local storage if no token returned
        localStorage.removeItem("user")
        isRefreshing = false
      }

      //Now that we've set the token, let's set another timeout
      if (isRefreshing) {
        setTimeout(() => {
          getRefreshToken(refreshToken)
        }, refreshTokenTime)
      }
    })
    .catch(error => {
      console.log(error)

      if (isRefreshing) {
        console.log("Network Error...got to keep trying!")
        setTimeout(() => {
          getRefreshToken(refreshToken)
        }, refreshTokenTime)
      }
    })
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  function login(user, isFirstTime = true) {
    if (!isFirstTime) {
      //updated from EditUser: Replace all and retain the token
      //Get from local storage, update only the fields returned by the user object
      const tempUser = JSON.parse(localStorage.getItem("user"))
      const updatedUser = { ...tempUser, ...user }
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } else {
      //Store in memory and then remove it from user object
      setAccessToken(user.token)
      user.token = "<No way!>"
      localStorage.setItem("user", JSON.stringify(user))
      dispatch({
        type: "LOGIN",
        payload: user
      })

      isRefreshing = true
      //Set timeout for refresh
      setTimeout(() => {
        getRefreshToken(user.refreshToken)
      }, refreshTokenTime)
    }
  }

  function logout() {
    isRefreshing = false
    localStorage.removeItem("user")
    dispatch({ type: "LOGOUT" })
  }

  return <AuthContext.Provider value={{ user: state.user, login, logout }} {...props} />
}

export { AuthContext, AuthProvider }
