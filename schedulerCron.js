require("dotenv").config()
var mongoose = require("mongoose")
const scheduler = require("./scheduler")
const { log } = require("./util/logger")
;(async () => {
  console.log("create new connection into db....")
  await mongoose.connect(process.env.MONGOURL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
  var myArgs = process.argv.slice(2)
  if (myArgs[0] === "daily") {
    log("Running Daily cron", "", "info", "cron")
    await scheduler.dailyEmailNotification()
  } else if (myArgs[0] === "weekly") {
    log("Running Weekly cron", "", "info", "cron")
    await scheduler.weeklyEmailNotification()
  } else {
    log("Invalid Freq.", "", "error", "cron")
  }
  console.log("Closing db connection....")
  await mongoose.connection.close()
  return
})()
