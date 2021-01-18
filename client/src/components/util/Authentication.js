import { useContext } from "react"
import { AuthContext } from "../../context/auth"

//TODO: You should redirect to the url you wanted initially.
const Authentication = ({ children }) => {
  const { user } = useContext(AuthContext)

  return user ? children : window.location.replace("/signin")
}

export default Authentication
