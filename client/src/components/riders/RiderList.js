import React from "react"
import { Header, Card } from "semantic-ui-react"
import Avatar from "../util/Avatar"
import { Link } from "react-router-dom"
function RiderList({ riderData }) {
  let profileUser = {
    avatarUrl: riderData.avatarUrl,
    username: riderData.username
  }
  return (
    <>
      <Card fluid className="post-view rider-list">
        <Header as={Link} to={`/profile/${riderData.id}`}>
          <Avatar profileUser={profileUser} />
          <Header.Content>
            {riderData.name} <span className="text-light"></span>
            <Header.Subheader>{riderData.bikes}</Header.Subheader>
            <Link to={`/profile/${riderData.id}`} className="svg-icon arrow-right">
              <img src="/assets/images/icons/arrow.svg" className="align-middle" alt="Arrow" width="15" height="15" />
            </Link>
            <div className="bike-details">
              <div className="d-inline-block">
                <span className="svg-icon">
                  <img src="/assets/images/icons/gray/atsign.svg" className="align-middle" alt="atsign" width="16" height="16" />
                </span>
                <span className="align-middle text-light">{riderData.username}</span>
              </div>
              <div className="d-inline-block">
                <span className="svg-icon">
                  <img src="/assets/images/icons/gray/followers.svg" className="align-middle" alt="star" width="16" height="16" />
                </span>
                <span className="align-middle text-light">{riderData.followersCount ? riderData.followersCount : 0} Followers</span>
              </div>
              {riderData.location && (
                <div className="d-inline-block">
                  <span className="svg-icon">
                    <img src="/assets/images/icons/gray/location.svg" className="align-middle" alt="location" width="11" height="16" />
                  </span>
                  <span className="align-middle text-light">{riderData.location}</span>
                </div>
              )}
            </div>
          </Header.Content>
        </Header>
      </Card>
    </>
  )
}

export default RiderList
