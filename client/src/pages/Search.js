import React, { useState, useEffect } from "react"
import { Card, Tab } from "semantic-ui-react"
import { Link, useHistory } from "react-router-dom"
import SearchRiders from "../components/riders/SearchRiders"
import SearchTrip from "../components/trips/SearchTrip"
import Navigation from "../layout/Navigation"
import { SearchBikes } from "../components/bike/SearchBikes"

const Search = props => {
  //Same component fotr both admin and otherwise, null cheks are needed
  const tab = props.match?.params.tab ? props.match?.params.tab : 0
  const [tabIndex, setTabIndex] = useState(0)
  const history = useHistory()

  const changeTab = (e, { activeIndex }) => {
    setTabIndex(activeIndex)
    let path = `/search/${activeIndex}`
    history.push(path)
  }

  useEffect(() => {
    setTabIndex(tab)
  }, [tab])

  const panes = [
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
          <SearchBikes />
        </Tab.Pane>
      )
    },
    {
      menuItem: {
        key: "Riders",
        icon: (
          <span className="svg-icon">
            <img src="/assets/images/icons/gray/helmet.svg" className="gray-color" alt="Riders" width="20" height="20" />
            <img src="/assets/images/icons/helmet.svg" className="red-color" alt="Riders" width="20" height="20" />
          </span>
        ),
        content: "Riders"
      },
      render: () => (
        <Tab.Pane>
          <SearchRiders />
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
          <SearchTrip />
        </Tab.Pane>
      )
    }
  ]
  return (
    <>
      <Navigation>
        <Card fluid className="post-view search-bikes">
          <h1>Search for...</h1>
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} onTabChange={changeTab} className="tab-center" activeIndex={tabIndex} />
        </Card>
      </Navigation>
    </>
  )
}

export default Search
