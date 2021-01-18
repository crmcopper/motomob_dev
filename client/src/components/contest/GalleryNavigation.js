import React, { useContext } from "react"
import { Menu, Dropdown } from "semantic-ui-react"
import { AuthContext } from "../../context/auth"
import { HashLink } from "react-router-hash-link"
import { Link } from "react-router-dom"

function GalleryNavigation({
  setActivePage,
  activePage,
  contestId,
  changeFilterOption,
}) {
  const { user } = useContext(AuthContext)

  const updateActivePage = (name) => {
    var ele = document.getElementById("gallery-navigation");
    window.scrollTo({ left: ele.offsetLeft, top: ele.offsetTop-80, behavior: 'smooth', });
    setActivePage(name)
    localStorage.setItem("photoContestsActiveTab", name)
  }
  return (
    <div className="gallery-navigation"  id="gallery-navigation">
      <Menu pointing secondary>
        {/* <Dropdown text="Filter" icon="filter" className="filter-menu">
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => changeFilterOption("most_liked")}>Most liked</Dropdown.Item>
            <Dropdown.Item onClick={() => changeFilterOption("most_recent")}>
              Most recent
            </Dropdown.Item>
            <Dropdown.Item onClick={() => changeFilterOption("random")}>
              Randomize
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}
        <Menu.Menu className="tab-menu">
          <Menu.Item
            name="Gallery"           
            active={activePage === "Gallery"}
            onClick={(e, { name }) => updateActivePage(name)}
          />
          <Menu.Item
            name="Prizes"
            active={activePage === "Prizes"}
            onClick={(e, { name }) => updateActivePage(name)}
          />
          <Menu.Item
            name="Criteria"
            active={activePage === "Criteria"}
            onClick={(e, { name }) => updateActivePage(name)}
            //as={HashLink}
            to={`/photo-contests/${contestId}#criteria`}
          //smooth
          />
          <Menu.Item
            name="Sponsors"
            active={activePage === "Sponsors"}
            onClick={(e, { name }) => updateActivePage(name)}
          />
          <Menu.Item
            name="My entries"
            active={activePage === "My entries"}
            onClick={(e, { name }) => updateActivePage(name)}
          />
        </Menu.Menu>
      </Menu>
    </div>
  )
}

export default GalleryNavigation
