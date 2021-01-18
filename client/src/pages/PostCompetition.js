import React, { useContext } from "react"
import { Card } from "semantic-ui-react"
import Navigation from "../layout/Navigation"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { URL_SIGN_UP, URL_SIGN_IN, BTN_TEXT_SIGN_IN, BTN_TEXT_SIGN_UP } from "../util/user-messages"

function PostCompetition() {
  const { user } = useContext(AuthContext)
  return (
    <Navigation>
      <Card fluid className="post-competition">
        <Card.Content>
          <Card.Header as="h1">
            Are you a motorbiker? <br />
            Fancy earning <span className="text-red">$1,000 USD</span>?
          </Card.Header>
          <p>It’s simple. The author of the most liked post on MotoMob will earn $1,000 USD.</p>
          <p>
            All you have to do is <Link to="/post/create">write a post on MotoMob</Link>. You can write as many posts as you like. It can be a post about your
            motorbike and/or about a trip you have done on your bike.
          </p>
          <div className="d-block text-center ">
            {!user && (
              <>
                <Link className="ui red white-addon button no-border" to={URL_SIGN_UP}>
                  {BTN_TEXT_SIGN_UP}
                </Link>
                <Link
                  className="ui red button no-border"
                  to={{
                    pathname: `${URL_SIGN_IN}`,
                    state: { redirectUrl: window.location.pathname }
                  }}
                >
                  {BTN_TEXT_SIGN_IN}
                </Link>
              </>
            )}
          </div>
          <Card.Header as="h3">What is the duration of the promotion? </Card.Header>
          <Card.Description>From the 20th of October 2020 till the 20th of December 2020. The money should be in your account before Xmas.</Card.Description>
          <Card.Header as="h3">What do I need to do to earn the prize?</Card.Header>
          <ol>
            <li>
              Create an account on MotoMob (if you don’t already have one). You can sign up <Link to={URL_SIGN_UP}>here</Link>
            </li>
            <li>Complete your account (profile picture, bikes, etc.)</li>
            <li>
              <Link to="/post/create">Create a post.</Link>
              <ol type="a">
                <li>You can create as many posts as you like. Obviously, fewer engaging posts are better than a lot of mediocre ones.</li>
                <li>
                  A bike post is about a bike. Select the “Bike” option in the “Create a Post” page. You can write about your bike. E.g.:
                  <b />
                  <Link to="/posts/5f6f134bc8b10f00179809eb">On Paper a perfect bike, from the factory it is shite! The Honda CRF 450L</Link>
                </li>
                <li>
                  A trip post is about an adventurous trip you have done. Select the “Trip” option in the “Create a Post” page. E.g.:
                  <b />
                  <Link to="/posts/5f6f1b63c8b10f00179809ee"> Adventure bikers paradise: Portugal - Part 1</Link>
                </li>
                <li>Make sure your post is engaging and interesting. Use images, and videos. But remember not to overdo it.</li>
              </ol>
            </li>
            <li>Share your post with your friends and encourage them to like it!</li>
          </ol>
          <Card.Header as="h3">How will I get paid? </Card.Header>
          <Card.Description>
            We prefer sending the cash using PayPal or a similar payment service. Depending on the country you reside in, we can do a bank transfer. This can be
            discussed in greater details if you win.
          </Card.Description>
          <Card.Header as="h2">GOOD LUCK!!! </Card.Header>
          <Card.Header as="h3">What are the terms and criteria?</Card.Header>
          <ol>
            <li>
              Check out our exhaustive terms of use page <a href="/competition-terms-of-use.html">here</a>
            </li>
            <li>When you write a post on MotoMob between the duration of the competition, you are automatically enrolled in the competition.</li>
            <li>The competition is open to anyone from any country.</li>
            <li>The post must be posted on the platform between 20th October 2020 and 20th December 2020 to be eligible.</li>
            <li>
              Crossing a minimum threshold of a 100 likes, the post with the most likes (hearts) earned by 20th December 00:00 GMT will be deemed the winner.
            </li>
            <li>
              The post needs to be genuine, authentic, original work by you that describes your experiences. Our team will review every single post to see if it
              matches our quality threshold.
            </li>
            <li>
              Just like the post, we will employ machine learning algorithms to ascertain user votes authenticity. Any fraudulent accounts will be removed along
              with any ‘likes’.
            </li>
            <li>Finally, we retain the right to take all and any steps necessary to ensure the competition is fair and impartial.</li>
          </ol>
        </Card.Content>
      </Card>
    </Navigation>
  )
}

export default PostCompetition
