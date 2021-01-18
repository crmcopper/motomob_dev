import moment from "moment"

export const validateBikePost = (title, body, bikes) => {
  const errors = {}

  if (title.trim() === "") {
    errors.title = "Give your post a catchy title..."
  }
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Add some content... Riders would like to read it."
  }
  if (!bikes.length) {
    errors.bikes = "Please select at least one bike."
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

export const validateTripPost = (title, body, bikes, location, when, days) => {
  const errors = {}

  if (title.trim() === "") {
    errors.title = "Give your post a catchy title..."
  }
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Add some content... Riders would like to read it."
  }
  if (!bikes.length) {
    errors.bikes = "Please select at least one bike."
  }
  if (!location.length) {
    errors.location = "Where did you go? Please select"
  }
  if (when.trim() === "" || !moment(when.trim(), "YYYY-MM-DD", true).isValid()) {
    errors.when = "When did you go on this trip?"
  }
  if (days === 0) {
    errors.days = "Tell us how long the trip was"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

export const validateBasicPost = body => {
  const errors = {}
  if (body.replace(/<\/p>|<p>|<br>| /g, "") === "") {
    errors.body = "Add some content... Riders would like to read it."
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

export const validateSearchForumPost = (title, bikes, locations, quesType) => {
  const errors = {}
  if (title.trim() === "") {
    errors.title = "Please provide the text to search"
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

export const validateForumPost = (title, body, bikes, locations, quesType) => {
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
export const validateSponsor = (name, description, imageUrl) => {
  const errors = {}

  if (name.trim() === "") {
    errors.name = "Please enter name."
  }
  if (description.trim() === "") {
    errors.description = "Please enter description."
  }
  if (imageUrl.trim() === "") {
    errors.imageUrl = "Please upload thumbnail image."
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

export const validateContest = (title, imageUrl, sponsors, closingDate, sponsor_description, prize_description, criteria_description) => {
  const errors = {}
  if (title.trim() === "") {
    errors.title = "Please enter name."
  }
  if (closingDate != null && typeof closingDate != "object" && closingDate.trim() === "") {
    errors.closingDate = "Please enter closingDate."
  }
  if (sponsors.length === 0) {
    errors.sponsors = "Please select sponsors."
  }
  if (sponsor_description === "<p><br></p>" || sponsor_description.trim() === "") {
    errors.sponsor_description = "Please enter sponsor description."
  }
  if (imageUrl.trim() === "") {
    errors.imageUrl = "Please upload image."
  }
  if (prize_description === "<p><br></p>" || prize_description.trim() === "") {
    errors.prize_description = "Please enter prize description."
  }
  if (criteria_description === "<p><br></p>" || criteria_description.trim() === "") {
    errors.criteria_description = "Please enter criteria description."
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}
