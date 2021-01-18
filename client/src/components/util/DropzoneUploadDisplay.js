import React, { useState } from "react"
import Image from "semantic-ui-react/dist/commonjs/elements/Image"

const DropzoneUploadDisplay = ({ imageUrl }) => {
  const [imageSrc, setImageSrc] = useState()
  let reader = new FileReader()

  reader.onload = function () {
    setImageSrc(reader.result)
  }

  reader.readAsDataURL(imageUrl)

  return (
      <Image src={imageSrc} alt={imageUrl.name} />
  )
}

export default DropzoneUploadDisplay
