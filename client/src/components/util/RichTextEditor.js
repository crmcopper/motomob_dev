import React, { useEffect } from "react"

import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"
import ImageResize from "quill-image-resize-module-react"
import { ImageDrop } from "quill-image-drop-module"
import RichTextEditiorPasteEvent from "./RichTextEditiorPasteEvent"
// import ImageFormat from "./ImageFormat"
// import { ImageActions } from "@xeger/quill-image-actions"
// import { ImageFormats } from "@xeger/quill-image-formats"

// Quill.register("modules/imageActions", ImageActions)
// Quill.register("modules/imageFormats", ImageFormats)
// Quill.register('modules/imageCompress', ImageCompress);
Quill.register("modules/imageResize", ImageResize)
Quill.register("modules/imageDrop", ImageDrop)
Quill.register("modules/clipboard", RichTextEditiorPasteEvent)
//TODO: 1. Unable to type text anywhere - keeps jumping onFocus. Console: addRange(): The given range isn't in document.
//TODO: 2. Save to local cache? Auto-save...

function RichTextEditor({ onBodyChange, value, placeholder, comment = false, focused = false, noTopBar = false }) {
  // Create a reference for Quill
  const formats = [
    "bold",
    "color",
    "float",
    "image",
    "italic",
    "link",
    "underline",
    "width",
    "strike",
    "background",
    "script",
    "blockquote",
    "align",
    "video",
    "indent",
    "clean",
    "list",
    "size",
    "style"
  ]
  const modules = {
    // ...
    // imageCompress: {
    //   quality: 0.7, // default
    //   maxWidth: 1000, // default
    //   maxHeight: 1000, // default
    //   imageType: 'image/jpeg', // default
    //   debug: true, // default
    // },
    imageResize: {
      //parchment: Quill.import('parchment')
      modules: ["Resize"]
    },
    imageDrop: true,
    // imageActions: {},
    toolbar: {
      container: noTopBar
        ? []
        : comment
          ? [["image", "video"]]
          : [
            ["bold", "italic", "underline", "strike"], // toggled buttons
            ["blockquote"], // blocks
            //[{ header: 1 }, { header: 2 }], // custom button values
            [{ size: ["small", false, "large", "huge"] }],
            [{ list: "ordered" }, { list: "bullet" }], // lists
            //[{ script: "sub" }, { script: "super" }], // superscript/subscript
            [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
            //[{ direction: "rtl" }], // text direction
            //[{ size: ["small", false, "large", "huge"] }], // custom dropdown
            //[{ header: [1, 2, 3, 4, 5, 6, false] }], // header dropdown
            [{ color: [] }, { background: [] }], // dropdown with defaults
            //[{ font: [] }], // font family
            [{ align: [] }], // text align
            //   ["clean"] // remove formatting
            [], //Giving some space for the image/video link
            ["link", "image", "video"],
            ["clean"]
          ],
      handlers: {
        //image: uploadAndThenDisplay
        //image: () => uploadAndThenDisplay(reactQuillRef),
      }
    },
    clipboard: {
      matchVisual: false
    }
  }

  const onChange = (content, delta, source, editor) => {
    //  console.log(editor.getHTML()) // rich text
    //  console.log(editor.getText()) // plain text
    //  console.log(editor.getLength()) // number of characters
    onBodyChange(editor.getHTML())
  }

  useEffect(() => {
    document.querySelectorAll(".ql-picker").forEach(tool => {
      tool.addEventListener("mousedown", function (event) {
        event.preventDefault()
        event.stopPropagation()
      })
    })
    document.querySelectorAll(".ql-picker-item").forEach(tool => {
      tool.addEventListener("mousedown", function (event) {
        let yPosition = window.pageYOffset
        let xPosition = window.pageXOffset
        setTimeout(function () {
          if (document.getElementsByClassName("ql-editor")) {
            document.getElementsByClassName("ql-editor")[0].click()
          }
          window.scrollTo(xPosition, yPosition)
        }, 100)
      })
    })

    document.querySelectorAll(".ql-action").forEach(tool => {
      tool.addEventListener("mousedown", function (event) {
        let yPosition = window.pageYOffset
        let xPosition = window.pageXOffset
        let scrolled = true
        setTimeout(function () {
          if (scrolled) {
            window.scrollTo(xPosition, yPosition)
          }
          scrolled = false
        }, 100)
      })
    })
  })
  return <ReactQuill theme="snow" modules={modules} onChange={onChange} placeholder={placeholder} value={value} formats={formats} ref={(e) => { if (e && focused) { e.focus() } }} />
}

export default RichTextEditor
