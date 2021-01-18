import React, { useCallback, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import CustomDropzone from "../../components/util/CustomDropzone"
import { Image} from "semantic-ui-react"
import DropzoneUploadDisplay from "../../components/util/DropzoneUploadDisplay"
import { uploadFileSizeLimit } from "../../util/Constants"

const activeStyle = {
  borderColor: "#2196f3"
}

const acceptStyle = {
  borderColor: "#00e676"
}

const rejectStyle = {
  borderColor: "#ff1744"
}

function UploadPhoto({ values = {}, setImage, image }) {
  const onDrop = useCallback(
    acceptedFiles => {
      if(acceptedFiles[0].size <= uploadFileSizeLimit){
        values.imageUrl = `${acceptedFiles[0].name}`
        setImage(acceptedFiles)
      } else {
        values.imageUrl = ""
        setImage("")
      }
    },
    [values.imageUrl]
  )

  const { isDragActive, isDragAccept, isDragReject } = useDropzone({ onDrop })

  

  return (
    <CustomDropzone multipleUpload={false} acceptedFiles={"image/*"} onDrop={onDrop} showStyle={true}>
      <div>
        {!image ? (
          <>
            <Image src="/assets/images/icons/image-upload-icon.svg" alt="Upload image"></Image>
              <div className="drop-label">
                Drop your image here, or <span className="text-red">Browse</span>
              </div>
              <em>Supports JPG, PNG</em>
          </>
        ) : (
          <div className="upload-img">
          <DropzoneUploadDisplay imageUrl={image[0]} />
          </div>
        )}
      </div>
    </CustomDropzone>  
  )
}

export default UploadPhoto
