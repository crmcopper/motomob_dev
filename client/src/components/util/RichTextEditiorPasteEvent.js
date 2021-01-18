import Quill from "quill"
const Clipboard = Quill.import("modules/clipboard")
class RichTextEditiorPasteEvent extends Clipboard {
  onPaste(e) {
    var cursorPosition = window.pageYOffset
    super.onPaste(e)

    setTimeout(function () {
      //scroll set on cursor position
      window.scrollTo(0, cursorPosition)
    }, 10)
  }
}

export default RichTextEditiorPasteEvent
