/**
 * @description: quill 扩展img对象，加入更多元素
 */

import Quill from 'quill'

const BlockEmbed = Quill.import('blots/block/embed')
// const ATTRIBUTES = ['ourl', 'src', 'owidth', 'oheight']

class ImageBlot extends BlockEmbed {
  static create (value) {
    let node = super.create()
    node.setAttribute('ourl', value.ourl)
    node.setAttribute('owidth', value.owidth)
    node.setAttribute('oheight', value.oheight)
    node.setAttribute('src', value.src)
    return node
  }
  static value (node) {
    return {
      ourl: node.getAttribute('ourl'),
      src: node.getAttribute('src'),
      owidth: node.getAttribute('owidth'),
      oheight: node.getAttribute('oheight')
    }
  }
}

ImageBlot.blotName = 'image'
ImageBlot.tagName = 'img'

export default ImageBlot
