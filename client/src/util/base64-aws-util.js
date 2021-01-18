//TODO: Move the keys to a secure location and npm un aws-sdk

import aws from "aws-sdk"
import cheerio from "cheerio"
import { S3Folders } from "./Constants"
import imageCompression from "browser-image-compression"

const s3 = new aws.S3({
  region: process.env.REACT_APP_AWS_S3_REGION,
  accessKeyId: process.env.REACT_APP_S3_KEY_ID,
  secretAccessKey: process.env.REACT_APP_S3_SECRET_KEY
})

export const upload = async (key, data, type, compress = false) => {
  let params = {}
  if (compress) {
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }
    const compressedImg = await imageCompression(dataURLtoFile(data, key), compressionOptions)
    params = {
      ACL: "public-read",
      Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
      Body: compressedImg,
      Key: key,
      ContentType: `image/${type}`
    }
  } else {
    params = {
      ACL: "public-read",
      Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
      Body: data,
      Key: key,
      ContentEncoding: "base64",
      ContentType: `image/${type}`
    }
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

export const getNewBody = async body => {
  //TODO: AWS/S3 location for test and production should be different
  return new Promise(async (resolve, reject) => {
    const $ = cheerio.load(body) //surround it with one <p> as we've stripped it all off above
    var image = $("img")
    var video = $("iframe")
    let previewMedia = ""
    let embededPictureUrls = []
    for (let index = 0; index < image.length; index++) {
      const element = image[index]
      if (element.attribs.src.indexOf("data:image") !== -1) {
        //const base64Data = new Buffer.from(element.attribs.src.replace(/^data:image\/\w+;base64,/, ""), "base64")
        const type = element.attribs.src.split(";")[0].split("/")[1]
        const { Location } = await upload(`posts/${Date.now()}.${type}`, element.attribs.src, type, true)
        element.attribs.src = Location
        embededPictureUrls.push(Location)
      } else {
        embededPictureUrls.push(element.attribs.src)
      }
    }

    if (video.length) {
      previewMedia = $.html(video[0])
    } else if (embededPictureUrls.length) {
      previewMedia = `<img src=${embededPictureUrls[0]} />`
    } else {
      previewMedia = ""
    }

    var exp = /((href|src)=["']|)(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
    body = body.replace(exp, function () {
      return arguments[1] ? arguments[0] : '<a href="' + arguments[3] + '">' + arguments[3] + "</a>"
    })
    resolve({ nbody: $("body").html(), previewMedia, embedPicture: embededPictureUrls[0] ? embededPictureUrls[0] : "" })
  })
}

export const uploadProfileImage = async (body, userId) => {
  return new Promise(async (resolve, reject) => {
    const base64Data = new Buffer.from(body.replace(/^data:image\/\w+;base64,/, ""), "base64")
    const type = "jpeg"
    const { Location } = await upload(`${S3Folders.users}/${userId}`, base64Data, type)
    resolve(Location)
  })
}

export const uploadContestsThumbImage = async (body, imageName) => {
  return new Promise(async (resolve, reject) => {
    const base64Data = new Buffer.from(body.replace(/^data:image\/\w+;base64,/, ""), "base64")
    const type = "jpeg"
    const { Location } = await upload(`${S3Folders.contests}/${imageName}`, base64Data, type)
    resolve(Location)
  })
}

export const uploadTripThumbImage = async (body, imageName) => {
  return new Promise(async (resolve, reject) => {
    const base64Data = new Buffer.from(body.replace(/^data:image\/\w+;base64,/, ""), "base64")
    const type = "jpeg"
    const { Location } = await upload(`${S3Folders.posts}/${imageName}`, base64Data, type)
    resolve(Location)
  })
}
