import React from "react"
import Dropzone from "react-dropzone"

//TODO: The style should move to scss outside of this file
const CustomDropzone = ({ children, multipleUpload, acceptedFiles, onDrop, showStyle }) => {
  let style = {}
  if (showStyle) {
    style = {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 30px",
      borderWidth: 2,
      borderRadius: 2,
      borderColor: "#eeeeee",
      borderStyle: "dashed",
      backgroundColor: "#fafafa",
      color: "#bdbdbd",
      outline: "none",
      transition: "border .24s ease-in-out",
      minHeight: "127px",
      margin: "auto",
      textAlign: "center",
      fontSize: "14px",
      fontFamily: "futurabook",
      justifyContent: "center"
    }
  } else {
    style = {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#fafafa",
      color: "#bdbdbd",
      outline: "none",
      margin: "auto",
      textAlign: "center",
      fontSize: "14px",
      fontFamily: "futurabook",
      justifyContent: "center"
    }
  }
  return (
    <Dropzone multiple={multipleUpload} accept={acceptedFiles} onDrop={acceptedFiles => onDrop(acceptedFiles)}>
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps({ style })} className="pointer">
          <input {...getInputProps()} id="picFile" />
          {children}
        </div>
      )}
    </Dropzone>
  )
}

export default CustomDropzone
