const { ERROR_USER_FB_EMAIL, ERROR_USER_GOOGLE_EMAIL } = require("../util/user-messages")

//This function extracts the bike names (at most 2) for display
module.exports.getBikesStringForAvatar = bikes => {
  return bikes
    .slice(0, 2)
    .map(bike => bike.bikename)
    .join(", ")
}

module.exports.validateSignUpInput = (name, username, email, password, location, ownBikes, provider) => {
  const errors = {}
  if (name.trim() === "") {
    errors.name = "Name must not be empty"
  }
  if (username.trim() === "") {
    errors.username = "User name must not be empty"
  } else {
    const regEx = /^[a-z0-9]{4,15}$/
    if (!username.match(regEx)) {
      errors.username = "Username must be between 4-15 characters in length, start with a letter and should only include lowercase letters and numbers"
    }
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty"
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
    if (!email.match(regEx)) {
      errors.email = "Please provide a valid email address"
    }
  }
  if (!provider && password === "") {
    errors.password = "Password must not empty"
  }

  if (!location) {
    errors.location = "Location must not empty"
  }

  //Check if ownbikes  has a value. When this is called from EditProfile, there are no bikes
  if (ownBikes && ownBikes.length === 0) {
    errors.ownBikes = "Atleast one bike must be selected"
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateSignInInput = (username, password, user) => {
  const errors = {}
  if (username.trim() === "") {
    errors.username = "Username must not be empty"
  }
  //if user not remember which account have already sing up or sign in that time we have given suggestion message

  if (username && !password && user && user.facebookId) {
    errors.username = ERROR_USER_FB_EMAIL
  }
  if (username && !password && user && user.googleId) {
    errors.username = ERROR_USER_GOOGLE_EMAIL
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty"
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateForgotPassword = email => {
  const errors = {}
  if (email.trim() === "") {
    errors.email = "Email must not be empty"
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
    if (!email.match(regEx)) {
      errors.email = "Please provide a valid email address"
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}
module.exports.validateResetPassword = (sendEmail, email, password) => {
  const errors = {}
  if (email.trim() === "") {
    errors.email = "Email must not be empty"
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
    if (!email.match(regEx)) {
      errors.email = "Please provide a valid email address"
    }
  }
  if (email && sendEmail && sendEmail !== email) {
    errors.sendEmail = "Invalid email address entered"
  }
  // console.log('password', password)
  if (password === "") {
    errors.password = "Password must not empty"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateEditBike = bikename => {
  const errors = {}

  if (!bikename) {
    errors.bikename = "Bikename must not be empty"
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateBikePost = (title, body, bikes) => {
  const errors = {}

  if (title.trim() === "") {
    errors.title = "Please provide a title for your post"
  }
  // if (body.trim() === "") {
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Please create some content"
  }
  if (!bikes.length) {
    errors.bikes = "Please select at least one bike"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateTripPost = (title, body, bikes, location, when, days) => {
  const errors = {}

  if (title.trim() === "") {
    errors.title = "Please provide a title for your post"
  }
  // if (body.trim() === "") {
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Please create some content"
  }
  if (!bikes.length) {
    errors.bikes = "Please select at least one bike"
  }
  if (!location.length) {
    errors.location = "Please provide location details"
  }
  if (when.trim() === "") {
    errors.when = "Please provide a start date of the trip"
  }
  if (days === 0) {
    errors.days = "Please provide length of the trip in days"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateBasicPost = (title, body) => {
  const errors = {}
  // if (body.trim() === "") {
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Please provide some content"
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateForumPost = (title, body, bikes, location, quesType) => {
  const errors = {}
  if (title.trim() === "") {
    errors.title = "Please provide a title for your post"
  }
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Please provide some content"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateSearchForumPost = (bikename, location, title, quesType) => {
  const errors = {}
  if (title.trim() === "") {
    errors.title = "Please provide the text to search"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}
