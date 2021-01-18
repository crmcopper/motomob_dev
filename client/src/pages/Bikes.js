import React from "react"
import { Container } from "semantic-ui-react"
import Search from "./Search"

//Let's keep the name same as the filename to avoid confusion (even if it is admin)
const Bikes = () => {
  // const { user } = useContext(AuthContext)
  //TODO add isAdmin parameter from context after fix of MD-53 Users data from context is lost after page reloading**/

  return (
    <Container>
      <Search />
    </Container>
  )
}

export default Bikes
