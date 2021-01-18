import axios from "axios"
import imageCompression from 'browser-image-compression';
const imageExt = ['image/png', 'image/jpeg']
//Iterate over the length of the (files) array and upload
export const uploadToS3 = async (files, signedMetaData) => {
  let failedFiles = []
  for (let i = 0; i < files.length; i++) {
    try {
      const options = {
        headers: {
          "Content-Type": files[i].type, //TODO: For all files? Dont need to sign with type?
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
      if(imageExt.includes(files[i].type)) {
        const compressionOptions = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        }
        const compressedImg =  await imageCompression(files[i], compressionOptions)
        await axios.put(signedMetaData[i].signedRequest, compressedImg, options)  
      } else {
        await axios.put(signedMetaData[i].signedRequest, files[i], options)
      }
    } catch (err) {
      console.log(err)
      failedFiles.push(signedMetaData[i])
      // throw err
    }
  }
  return failedFiles
}
//---Upload image from RichTextArea
export const uploadToS3ForRichText = async (
  files,
  signedMetaData,
  reactQuillRef
) => {
  for (let i = 0; i < files.length; i++) {
    try {
      const options = {
        headers: {
          "Content-Type": files[i].type, //TODO: For all files? Dont need to sign with type?
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      }

      await axios
        .put(signedMetaData[i].signedRequest, files[i], options)
        .then((result) => {
          //Display in editor
          const editor = reactQuillRef.getEditor()
          //editor.enable(true)

          const range = editor.selection.getRange()
          //const range = reactQuillRef.getEditorSelection()

          editor.insertEmbed(range.index, "image", signedMetaData[0].url)
          //editor.enable(false)
        })
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}
//Basic randomisation (a bit)
export const formatFilename = (filename) => {
  const randomString = Math.random().toString(36).substring(2, 7)
  filename = filename.split(".")
  filename[0] = `${randomString}-${filename[0]}`
  filename = filename.join(".")
  filename = filename.toLowerCase().replace(/[^a-z0-9.]/g, "-")
  return filename.substring(0, 60)
}
