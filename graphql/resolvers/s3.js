const aws = require("aws-sdk")

const s3 = new aws.S3({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.S3_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_KEY
})

const s3Params = {
  Bucket: process.env.AWS_S3_BUCKET,
  Expires: 6000,
  ACL: "public-read"
}

module.exports = {
  Query: {},
  Mutation: {
    async s3Sign(_, { files }) {
      /**
       * files: [
       *          {name: "one.jpeg",  type: "image/jpeg"},
       *          {name: "two.gif",   type: "image/gif"}
       *        ]
       *
       * NOTE: list of files to upload. This comes with the proper key/folder prefix required by S3 (Client responsibility)
       */
      const signedDocs = []
      try {
        files.map(file => {
          s3Params.Key = file.name
          s3Params.ContentType = file.type //Wont be "image/jpeg" all the time

          signedDocs.push({
            filename: file.name,
            signedRequest: s3.getSignedUrl("putObject", s3Params),
            url: process.env.FILE_STORE_PREFIX + file.name
          })
        })
      } catch (err) {
        console.log(err)
        throw err
      }
      return signedDocs
    }
  }
}
