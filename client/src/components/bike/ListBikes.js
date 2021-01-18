import React, { useContext } from "react"
import EditBike from "../../components/admin/bikes/EditBike"
import { Link } from "react-router-dom"
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon"
import { Dimmer, Loader } from "semantic-ui-react"
import { AuthContext } from "../../context/auth"

const BikeItem = ({ bike }) => {
  const { user } = useContext(AuthContext)
  const isAdmin = user && user.admin

  return (
    <div className="item bike-item">
      <Link to={"/bike/" + bike.id} className="image">
        <img src={bike?.thumbUrl} alt={bike.bikename} />
      </Link>
      <div className="content">
        <Link to={"/bike/" + bike.id} className="header">
          {bike.bikename}
        </Link>
        {!isAdmin ? (
          <>
            <div className="extra">
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/followers.svg" className="align-middle" alt="fans" width="16" height="16" />
              </span>
              <span className="align-middle">34k followers</span>
            </div>
            <div className="extra">
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/post.svg" className="align-middle" alt="Articles" width="16" height="16" />
              </span>
              <span className="align-middle">View posts</span>
            </div>
            <div className="extra">
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/trips.svg" className="align-middle" alt="Trips" width="16" height="16" />
              </span>
              <span className="align-middle">View trips</span>
            </div>
          </>
        ) : (
          <div className="extra">
            <EditBike bike={bike}>
              <Icon name="edit" size="large" className="pointer" />
            </EditBike>
          </div>
        )}
      </div>
    </div>
  )
}

const ListBikes = ({ bikes, isAdmin, isFetching, loading }) => {
  return (
    <div className="ui items">
      {bikes && bikes.map(bike => <BikeItem key={bike.id} bike={bike} isAdmin={isAdmin} />)}
      {isFetching ||
        (loading && (
          <Dimmer active>
            <Loader />
          </Dimmer>
        ))}
    </div>
  )
}

export default ListBikes
