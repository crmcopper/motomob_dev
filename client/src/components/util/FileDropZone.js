import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"

function FileDropzone() {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    //  console.log(acceptedFiles)

    acceptedFiles.forEach(file => {
      const reader = new FileReader()

      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        //   console.log(binaryStr)
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} style={{ height: "50px" }} />
      {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
    </div>
  )
}

export default FileDropzone
