import React from "react"
import { Image, Card } from "semantic-ui-react"
import Navigation from "../../layout/Navigation"
import { images } from "../../util/Constants"

export function ComingSoonCard({ src }) {
  return (
    <Card fluid className="post-view">
      <Card.Content extra>
        <div className="comingSoonCard">
          <h1 className="cominSoonTitle">Coming Soon...</h1>
          <center>
            <Image src={src} className="comingSoonImage" fluid />
          </center>
          <center>
            <h4 className="comingSoonText">
              As you start to use MotoMob, you will see that some features are not yet complete.
              <p></p>
              We are working at breakneck speed to get them completed. We thank you for your patience and support as we continue to expand the platform.
              <p></p>
              You can see what we are working on here:{" "}
              <a target="_blank" href="/roadmap.html">
                Motomob Roadmap
              </a>
            </h4>
          </center>
        </div>
      </Card.Content>
    </Card>
  )
}

const ComingSoon = () => {
  return (
    <Navigation>
      <ComingSoonCard src={images[Math.floor(Math.random() * (images.length - 1))]} />
    </Navigation>
  )
}

export default ComingSoon
