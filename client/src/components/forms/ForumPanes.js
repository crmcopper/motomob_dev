import React from "react"
import { Tab, Dimmer, Loader } from "semantic-ui-react"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import { AskBikeQuestion } from "../question/AskBikeQuestion"
import { AskTripQuestion } from "../question/AskTripQuestion"

const ForumPanes = (loadingPost, post) => {
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
              <AskBikeQuestion post={post} />
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
              <AskTripQuestion post={post} />
            )}
        </Tab.Pane>
      )
    },

  ]
}
export default ForumPanes