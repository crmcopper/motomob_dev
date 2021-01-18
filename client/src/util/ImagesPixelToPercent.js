export const ImagesPixelToPercent = async body => {
    let editorWidth = 1154
    if(document.getElementsByClassName("ql-editor") && document.getElementsByClassName("ql-editor").length){
      editorWidth = document.getElementsByClassName("ql-editor")[0].offsetWidth - 30
    }
    const imgRex = /<img.*?src="(.*?)"[^>]+>/g
    let img
    const widthRex = /width=".*?.?"/
    while ((img = imgRex.exec(body))) {
      if (!img[0].match(/style=.*?width*?/)) {
        let widthAttr = widthRex.exec(img[0])
        if (widthAttr && widthAttr[0]) {
          let width = widthAttr[0].replace(/"/g, "").split("=")
          if (width && width[1] && !width[1].match("%") && !isNaN(width[1])) {
            let newWidth = "width=" + ((parseInt(width[1]) / editorWidth) * 100).toFixed(2) + "%"
            body = body.replace(img[0], img[0].replace(widthAttr[0], newWidth))
          }
        }
      }
    }
    return body
}