import React from "react"
import { Tab, Dimmer, Loader } from "semantic-ui-react"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import CommonPost from "./CommonPost"

const PostPanes = (loadingPost, post) => {
  return [
    {
      menuItem: {
        key: "Bike",
        icon: (
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/bikes.svg" className="gray-color" alt="Bikes" width="24" height="20" />
            <img src="/assets/images/icons/bikes.svg" className="red-color" alt="Bikes" width="24" height="20" />
          </span>
        ),
        content: "Bike"
      },
      render: () => (
        <Tab.Pane>
          {loadingPost ? (
            <Dimmer active>
              <Loader />
            </Dimmer>
          ) : (
            <CommonPost post={post} postNewType={"BikePost"} />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: {
        key: "Trips",
        icon: (
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/trips.svg" className="gray-color" alt="Trips" width="20" height="20" />
            <img src="/assets/images/icons/trips.svg" className="red-color" alt="Trips" width="20" height="20" />
          </span>
        ),
        content: "Trips"
      },
      render: () => (
        <Tab.Pane>
          {loadingPost ? (
            <Dimmer active>
              <Loader />
            </Dimmer>
          ) : (
            <CommonPost post={post} postNewType={"TripPost"} />
          )}
        </Tab.Pane>
      )
    },
    {
      // menuItem: {
      //   key: "share",
      //   icon: (
      //     <span className="svg-icon">
      //       <img src="/assets/images/icons/gray/tags.svg" className="gray-color" alt="Share an update" width="22" height="20" />
      //       <img src="/assets/images/icons/tags.svg" className="red-color" alt="Share an update" width="22" height="20" />
      //     </span>
      //   ),
      //   content: "Share an update"
      // },
      render: () => (
        <Tab.Pane>
          {loadingPost ? (
            <Dimmer active>
              <Loader />
            </Dimmer>
          ) : (
            <CommonPost post={post} postNewType={"BasicPost"} />
          )}
        </Tab.Pane>
      )
    }
  ]
}

export default PostPanes
