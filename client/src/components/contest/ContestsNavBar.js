import React, { useEffect, useState } from "react"
import { Menu } from "semantic-ui-react"
import { Link, useHistory } from "react-router-dom"

function ContestsNavBar({ setActiveContest, activeTab }) {

  const updateActiveContest = (name) => {
    setActiveContest(name)
    localStorage.setItem("ContestsType", name)
  }
  return (
    <div className="contests-navigation">
      <Menu pointing secondary>
        <Menu.Menu>
          <Menu.Item name="Contests"
            active={activeTab === "Contests"}
            onClick={(e, { name }) => updateActiveContest(name)}
            // to={`/photo-contests`}
            as={Link}
          />
          {/* <Menu.Item
            name="Participating"
            active={activeTab === "Participating"}
            onClick={(e, { name }) => updateActiveContest(name)}
            as={Link} /> */}

          <Menu.Item
            as={Link}
            name="Past contests"
            active={activeTab === "Past contests"}
            onClick={(e, { name }) => updateActiveContest(name)}
          // to={`/closed-photo-contests`}
          />
        </Menu.Menu>
      </Menu>
    </div>
  )
}

export default ContestsNavBar
