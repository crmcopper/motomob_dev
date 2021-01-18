const { ApolloServer, PubSub } = require("apollo-server-express")
const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")
const express = require("express")
const Link = require("./models/Link")
const typeDefs = require("./graphql/typeDefs")
const resolvers = require("./graphql/resolvers")
require("newrelic")
require("dotenv").config()

const pubsub = new PubSub()
const app = express()

const PORT = process.env.PORT || 5000

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub })
})

//TODO: Logging/Error Handling for all messages coming through. See below: Merge with the context above?

//Apply middleware
server.applyMiddleware({
  app,
  path: "/gapi",
  bodyParserConfig: {
    //Handle more than default (1MB) payload size
    limit: "20mb"
  }
})
app.set("view engine", "pug")
app.set("views", "./views")

// Add another route for static links (that require meta-information)
// Check all incoming traffic for the preferred crawlers through the user-agent
sharedLinkRouter = express.Router()
app.use(function (req, res, next) {
  var ua = req.headers["user-agent"]
  if (/^(facebookexternalhit|twitterbot|WhatsApp|LinkedInBot)/gi.test(ua)) {
    sharedLinkRouter(req, res, next)
  } else {
    next()
  }
})

/**
 * In case of testing this locally, replace sharedLinkRouter with app and change first line to
 * const url = "https://www.motomob.me" + req.originalUrl
 */
sharedLinkRouter.get("*", function (req, res) {
  //  const url = req.protocol + "://" + req.headers.host + req.originalUrl
  const url = process.env.MOTOMOB_PREFIX + req.originalUrl
  Link.findOne({ url: url })
    .lean()
    .exec(function (err, linkD) {
      if (linkD && linkD.imageUrl) {
        //if you get back some attribute value = Link found
        res.render("bot", { url: linkD.url, title: linkD.title, description: linkD.description, imageUrl: linkD.imageUrl, type: linkD.type })
      } else {
        //Show a default image and motomob details (Error in mm:error)
        const defaultM = {
          title: "MotoMob.Me: Bikers Only",
          description:
            "Share your motorbiking adventures: get inspired! \
          A single platform for motorbikers: travel, bikes, forum, competitions, events, marketplace and much more.",
          url: url,
          //Remember - same URL used in Share.js/link.js
          imageUrl: process.env.DEFAULT_IMAGE_URL,
          type: "default",
          error: `Error in getting data for url: ${url} ` + err
        }
        res.render("bot", defaultM)
      }
    })
})

//Production build setup
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    //304 issue with trailing / in the url. When we type motomob.me, we get redirected to motomon.me/signiny.html/. This trailing /
    //results in 304 error.
    if (req.url.slice(0, -1) === "/") {
      console.log(`Moto: Remove trailing / for ${req.url}`)
      req.url = req.url.slice(0, -1) // remove the trailing /
    }

    //Redirect to https
    if (req.header("x-forwarded-proto") !== "https") res.redirect(`https://${req.header("host")}${req.url}`)
    else next()
  })

  //set static folder
  app.use(express.static("./client/build"))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

mongoose
  .connect(process.env.MONGOURL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log(`MongoDB Connected: ${process.env.MONGOURL}`)
    return app.listen({ port: PORT })
  })
  .then(res => {
    console.log(`Motomob Server running at endpoint ${server.graphqlPath}`)
  })
  .catch(err => {
    console.error(err)
  })
