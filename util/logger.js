const { parseCookies } = require("./cookieParser")
const winston = require("winston")
let os = require("os")
let _ = require("lodash")
const moment = require("moment")
const ignoreMap = {
  post: [
    "body",
    "previewMedia",
    "previewBody",
    "postType",
    "name",
    "userbikes",
    "avatarUrl",
    "bikes",
    "pictureUrls",
    "location",
    "when",
    "days",
    "offRoadPercentage",
    "gpxFiles",
    "postag",
    "likeCount",
    "commentCount",
    "saveCount",
    "savedtag",
    "embedPicture",
    "additionalTag"
  ],
  comment: ["body", "name", "avatarUrl", "userbikes", "replies", "likes", "likeCount", "dislikes", "dislikeCount"],
  user: ["password"]
}
var S3StreamLogger = require("s3-streamlogger").S3StreamLogger

var s3_info_stream = new S3StreamLogger({
  bucket: process.env.AWS_S3_BUCKET,
  name_format: `%Y-%m-%d-%H-%M-%S-%L-${os.hostname()}.log`,
  access_key_id: process.env.S3_KEY_ID,
  folder: "logs/",
  secret_access_key: process.env.S3_SECRET_KEY
})

const logger = winston.createLogger({
  level: winston.config.syslog.levels,
  format: winston.format.json(),
  transports: [new winston.transports.Stream({ stream: s3_info_stream, level: "info" })]
})

const log = (message, context, lvl, type) => {
  var result = _.omit(context != "" ? context.req.body.variables : {}, ignoreMap[type])
  if (lvl === "error") {
    logger.error({
      message,
      data: result,
      headers: {
        cookies: context != "" ? parseCookies(context.req) : ""
      },
      timestamp: moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    })
  } else if (lvl === "info") {
    logger.info({
      message,
      data: result,
      headers: {
        cookies: context != "" ? parseCookies(context.req) : ""
      },
      timestamp: moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    })
  } else {
    logger.debug({
      message,
      data: result,
      headers: {
        cookies: context != "" ? parseCookies(context.req) : ""
      },
      timestamp: moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    })
  }
}

module.exports = {
  log
}
