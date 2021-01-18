import React from "react"
import { Card, Menu } from "semantic-ui-react"
import Navigation from "../../layout/Navigation"
import history from "../util/history"
import { TERMS_OF_SERVICE, OUR_POLICIES, COMPETTIONS_TERMS_OF_USE } from "../../util/user-messages"

const Agreements = () => {
  return (
    <Navigation>
      <Card fluid className="post-view setting-view">
        <span className="svg-icon arrow-left pointer" >
          <img src="/assets/images/icons/arrow-left.svg" className="align-middle" alt="Arrow" width="17" height="17" onClick={() => history.goBack()} />
        </span>
        <Card.Content extra>
          <h1>Settings <img src="/assets/images/icons/arrow-black.svg" className="align-middle" alt="Arrow" width="16" height="16" /> <span>Agreements</span></h1>
          <p>Following are the legal agreements between MotoMob and you.</p>
          <Menu text vertical className="agreements-menu">
            <Menu.Item
              as="a" href="/terms.html" target="_blank"
              name={TERMS_OF_SERVICE}
            />
            <Menu.Item
              as="a" href="/policies.html"
              target="_blank"
              name={OUR_POLICIES}
            />
            <Menu.Item
              as="a"
              href="/competition-terms-of-use.html"
              target="_blank"
              name={COMPETTIONS_TERMS_OF_USE}
            />
          </Menu>
        </Card.Content>
      </Card>
    </Navigation>

  )
}

export default Agreements
