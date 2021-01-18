import React, { useState } from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import "semantic-ui-css/semantic.min.css"
import "./_App.scss"

import { AuthProvider } from "./context/auth"
import AuthRoute from "./util/AuthRoute"
import Authentication from "./components/util/Authentication"
import ReactNotification from "react-notifications-component"
import "react-notifications-component/dist/theme.css"
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import Pending from "./pages/Pending"
import ResetPassword from "./pages/ResetPassword"
import SinglePost from "./pages/SinglePost"
import BikeUpload from "./pages/BikeUpload"
import Search from "./pages/Search"
import BikeProfile from "./pages/BikeProfile"
import Profile from "./pages/Profile"
import CreatePost from "./pages/CreatePost"
import EditPost from "./pages/EditPost"
import EditForumPost from "./pages/EditForumPost"
import Contests from "./pages/competition/Contests"
import ContestGallery from "./pages/competition/ContestGallery"
import ComingSoon from "./pages/static/ComingSoon"
import Settings from "./pages/Settings"
import EditProfileDetails from "./pages/EditProfileDetails"
import CreateContest from "./pages/competition/CreateContest"
import CreateSponsor from "./pages/competition/CreateSponsor"
import SearchForum from "./pages/SearchForum"
import CreateForumPost from "./pages/CreateForumPost"
import ContestsParticipate from "./pages/ContestsParticipate"
import NotificationsList from "./layout/NotificationsList"
import EmailNotification from "./components/settings/EmailNotification"
import Agreements from "./components/settings/Agreements"
import PostCompetition from "./pages/PostCompetition"
import MyQuestions from "./pages/MyQuestions"
import { URL_SIGN_IN, URL_HOME, URL_SIGN_UP, URL_FORGOT_PASSWORD, URL_SIGN_UP_PENDING_TOKEN, URL_SIGN_UP_PENDING } from "./util/user-messages"
import UserLeaveConfirmation from "./components/util/UserLeaveConfirmation"
import TripDetails from "./components/profile/trips/TripDetails"

function App() {
  const [confirmOpen, setConfirmOpen] = useState(true)
  return (
    <AuthProvider>
      <ReactNotification />
      <Router
        getUserConfirmation={(message, callback) => {
          return UserLeaveConfirmation(message, callback, confirmOpen, setConfirmOpen)
        }}
      >
        <Switch>
          <Route exact path={URL_HOME} component={Home} />
          <AuthRoute exact path={URL_SIGN_IN} component={SignIn} />
          <AuthRoute exact path={URL_SIGN_UP} component={SignUp} />
          <AuthRoute exact path={URL_FORGOT_PASSWORD} component={ForgotPassword} />
          <AuthRoute exact path="/reset-password/:token" component={ResetPassword} />
          <AuthRoute exact path={[{ URL_SIGN_UP_PENDING }, URL_SIGN_UP_PENDING_TOKEN]} component={Pending} />
          <Route exact path="/posts/:postId" component={SinglePost} />
          <Route exact path="/search/:tab" component={Search} />
          <Route exact path="/bike/:bikeId" component={BikeProfile} />
          <Route exact path="/photo-contests" component={Contests} />
          <Route exact path="/photo-contests/:contestId" component={ContestGallery} />
          <Route exact path="/photo-contests/participate/:contestId" component={ContestsParticipate} />
          <Route exact path="/photo-contests/:contestsClosed/:contestId" component={ContestGallery} />


          <Route exact path="/forum" component={SearchForum} />
          <Route exact path="/post/forum" component={CreateForumPost} />
          {/* <Route exact path="/post-competition" component={PostCompetition} /> */}
          <Route exact path="/notifications" component={NotificationsList} />
          <Route exact path="/trips/:userId/:tripName" component={TripDetails} />

          <Authentication>
            <Route exact path="/admin/upload" component={BikeUpload} />
            <Route exact path="/admin/contest" component={CreateContest} />
            <Route exact path="/admin/sponsor" component={CreateSponsor} />
            <Route exact path={["/profile/:userId", "/profile/:userId/:tab"]} component={Profile} />
            <Route exact path={"/post/edit/:postId"} component={EditPost} />
            <Route exact path="/forum/edit/:postId" component={EditForumPost} />
            <Route exact path={"/edit-profile/:userId"} component={EditProfileDetails} />
            <Route exact path="/settings" component={Settings} />
            <Route exact path="/settings/email-notification" component={EmailNotification} />
            <Route exact path="/settings/agreements" component={Agreements} />
            <Route exact path={["/post/create/", "/post/create/:tab"]} component={CreatePost} />
            <Route exact path="/coming-soon" component={ComingSoon} />
            <Route exact path="/myquestions" component={MyQuestions} />
          </Authentication>
        </Switch>
      </Router>
    </AuthProvider>
  )
}

export default App
