import React, { useState } from "react"
import { Modal, Divider } from "semantic-ui-react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { useMutation } from "@apollo/client"
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinIcon,
  LinkedinShareButton,
  WhatsappIcon,
  WhatsappShareButton
} from "react-share"
import { CREATE_SHARED_LINK_MUTATION } from "../../common/gql_api_def"

function Share({ url, onClose, description, type, title, imageUrl }) {
  const [copied, setcopied] = useState(false)

  const [createSharedLink] = useMutation(CREATE_SHARED_LINK_MUTATION, {
    variables: {
      url,
      title: title ? title : "",
      imageUrl,
      type,
      description
    },
    update: (store, { data }) => {
      //on successful creation of the link, set copied to true
      if (data.createSharedLink.url) {
        setcopied(true)
      }
    },
    onError(err) {
      console.log(err)
    }
  })

  const createLinkandDisplayCopy = () => {
    //Create a link in the DB and then mark as copied
    createSharedLink()
    setcopied(true)
  }
  let popUpTitle = "Share Post"
  if (type === "photo-contests") {
    popUpTitle = "Share Gallery"
  } else if (type == "trip") {
    popUpTitle = "Share Trip"

  }
  return (
    <>
      <Modal.Header>
        <span>{popUpTitle}</span>
        <button className="close-button" onClick={onClose}>
          <img src="/assets/images/icons/close-red.svg" className="red-color" alt="Close" width="16" height="16" fill="red" />
        </button>
      </Modal.Header>
      <Modal.Content>
        <CopyToClipboard text={url} onCopy={createLinkandDisplayCopy}>
          <button className="button-url">{url}</button>
        </CopyToClipboard>
        <CopyToClipboard text={url} onCopy={createLinkandDisplayCopy}>
          <button className="button-copy">
            {copied && "Copied"}
            {!copied && "Copy Link"}
          </button>
        </CopyToClipboard>

        <Divider horizontal>Or</Divider>
        <div className="share-actions">
          <FacebookShareButton url={url} quote={description}>
            <FacebookIcon size={36} round />
          </FacebookShareButton>
          <TwitterShareButton url={url} title={description}>
            <TwitterIcon size={36} round />
          </TwitterShareButton>
          <WhatsappShareButton url={url} title={description}>
            <WhatsappIcon size={36} round />
          </WhatsappShareButton>
          <LinkedinShareButton url={url} title={description}>
            <LinkedinIcon size={36} round />
          </LinkedinShareButton>
        </div>
      </Modal.Content>
    </>
  )
}

export default Share
