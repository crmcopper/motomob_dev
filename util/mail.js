// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require("@sendgrid/mail")
const { FROM_EMAIL } = require("./config")
const { log } = require("./logger")

sgMail.setApiKey(process.env.SG_KEY)

module.exports.send = (to, subject, text, html) => {
  try {
    //making it easer to see which ones are in production. Using AWS_s3 bucket as NODE_ENV does not easily distnguish between prod/stage
    subject = process.env.AWS_S3_BUCKET === "motomob" ? subject : "--" + process.env.AWS_S3_BUCKET + "--" + subject

    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html
    }

    sgMail
      .send(msg)
      .then(() => {
        log(`Email sent to ${to}`, "", "info")
        console.log(`Email sent to ${to}`)
      })
      .catch(error => {
        console.log(error)
      })
  } catch (err) {
    console.log(err)
  }
}

// const msg = {
//   to: "test@example.com",
//   from: "test@example.com",
//   subject: "Sending with Twilio SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>"
// }
