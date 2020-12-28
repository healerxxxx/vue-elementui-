<template>
  <div class="im-editor">
    <div class="im-editor__toolbar">
      <input type="file" ref="referenceUpload" style="display:none" accept="image/*" @change="fileData" multiple />
      <li>
        <span class="icon-emoji" @click.stop="switchEmoji" :class="{'active': isEmoji}"></span>
        <emoji ref="emoji" v-model="isEmoji" @click="insertEmoji" />
      </li>
      <li><i class="el-icon-picture-outline" @click="chooseImg"></i></li>
      <li class="inline-command">
        <span @click="execCommand('bold')" :class="{'active': viewStyle.bold}"><b>B</b></span>
        <span @click="execCommand('italic')" :class="{'active': viewStyle.italic}"><b><i>I</i></b></span>
        <span @click="execCommand('underline')" :class="{'active': viewStyle.underline}"><b><u>U</u></b></span>
        <span @click="addLink"><b><u>A</u></b></span>
      </li>
    </div>
    <div
      class="im-editor__content"
      contenteditable="true"
      ref="textarea"
      @keydown="ctrlEnterEvent"
      @keyup="textareaSaveSelection(), setTagStyle(), getTextBeforeCursor()"
      @mouseup="textareaSaveSelection(), setTagStyle(), getTextBeforeCursor()"
      @mouseout="textareaSaveSelection"
      @paste="textareaPaste"
      @input="textareaInput"
      spellcheck="false"
      tabindex="0">
      <p><br /></p>
    </div>
    <el-button
      class="im-editor__send-button"
      :type="submitEnable ? 'primary' : 'info'"
      size="mini" @click="send">
      发送{{`${shortcutKey === 1 ? '(Ctrl+Enter)' : ''}${shortcutKey === 0 ? '(Enter)' : ''}`}}
    </el-button>
    <div class="quick-reply-box" ref="quickReply" :style="quickReplyStyle" v-show="quickReplyVisible">
      <li
        v-for="(item, index) in quickReplyList"
        :class="{'odd': index % 2 === 1}"
        :key="item.fastReplyId"
        @click="replaceQuickReply(item.content)">
        <span v-html="item.content"></span>
      </li>
    </div>
  </div>
</template>

<script>
import { saveSelection, getCurrentRange, lastSelectionRange, restoreSelection } from './selection'
import { removeScriptAndEvent } from '../../util/tool'
import { quickReply } from '../../util/api/settings'
import { position, offset } from 'caret-pos'
import Emoji from './Emoji'
function getCaretStyle () {
  let range = lastSelectionRange || getCurrentRange()
  let aimEle = range && range.commonAncestorContainer
  let tags = ['U', 'I', 'B']
  let result = []
  if (aimEle) {
    let tempEle = null
    if (aimEle.nodeType === 3) {
      aimEle = aimEle.parentNode
    }
    tempEle = aimEle
    while (tempEle && tempEle.nodeName && result.indexOf(tempEle.nodeName.toLowerCase()) === -1) {
      if (tags.indexOf(tempEle.nodeName) !== -1) {
        result.push(tempEle.nodeName)
      }
      tempEle = tempEle.parentNode
    }
  }
  let viewStyle = {
    'italic': result.indexOf('I') !== -1,
    'underline': result.indexOf('U') !== -1,
    'bold': result.indexOf('B') !== -1
  }
  return viewStyle
}

function elementMoveTo (ele) {
  if (window.getSelection) {
    // ele.focus()
    const range = window.getSelection()
    range.selectAllChildren(ele)
    range.collapseToEnd()
  } else if (document.selection) {
    const range = document.selection.createRange()
    range.moveToElementText(ele)
    range.collapse(false)
    range.select()
  }
  saveSelection()
}

export default {
  name: 'Editor',
  props: ['shortcutKey'],
  data () {
    return {
      content: '',
      isEmoji: false,
      viewStyle: {
        'italic': false,
        'underline': false,
        'bold': false
      },
      quickReplyVisible: false,
      quickReplyStyle: {},
      quickReplyList: [],
      quickReplyText: null,
      quickReplyTextEle: null
    }
  },
  computed: {
    submitEnable () {
      const { content } = this
      return content.length > 0 && content.length <= 1000 && content !== '<p><br /></p>' && content !== '<p><br/></p>' && content !== '<p><br></p>'
    }
  },
  components: {
    Emoji
  },
  created () {
    document.addEventListener('click', this.hideEmoji)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.hideEmoji)
  },
  watch: {
    quickReplyText (val) {
      console.log(val)
      if (val) {
        this.quickReplySearch(val).then(res => {
          this.quickReplyList = res
        })
      } else {
        this.quickReplyList = []
      }
      this.quickReplyVisible = !!val
    },
    quickReplyVisible (val) {
      if (val) {
        this.setQuickReplyPosition()
      }
    }
  },
  methods: {
    execCommand (command = 'insertHTML', val) {
      restoreSelection()
      this.$refs.textarea.focus()
      document.execCommand(command, false, val)
      saveSelection()
    },
    textareaPaste (e) {
      e.preventDefault()
      const { clipboardData } = e
      const text = clipboardData.getData('text')
      this.execCommand('insertText', removeScriptAndEvent(text))
    },
    textareaSaveSelection () {
      saveSelection()
    },
    setTagStyle () {
      this.viewStyle = getCaretStyle()
    },
    textareaInput (e) {
      this.content = e.target.innerHTML
      this.$emit('input', this.content)
    },
    switchEmoji () {
      this.isEmoji = !this.isEmoji
      this.$refs.textarea.focus()
      restoreSelection()
    },
    insertEmoji (emoji) {
      this.$refs.textarea.focus()
      restoreSelection()
      this.execCommand('insertHTML', emoji)
      saveSelection()
    },
    hideEmoji (e) {
      if (!this.$refs.emoji.$el.contains(e.target)) {
        this.isEmoji = false
        this.quickReplyVisible = false
      }
    },
    chooseImg () {
      this.$refs.referenceUpload.click()
    },
    fileData (e) {
      const files = e.target.files || e.dataTransfer.files
      Array.from(files).map(item => {
        this.$emit('send', 2, item)
      })
      this.$refs.referenceUpload.value = ''
    },
    addLink () {
      /* eslint-disable */
      this.$prompt('请输入网址', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^((http|https|ftp):\/\/)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)|\/|\?)*)?$/i,
        inputErrorMessage: '网址格式不正确'
      }).then(({ value }) => {
        this.execCommand('createlink', value)
      })
    },
    send () {
      if (this.content.length <= 0 || this.content.length > 1000 ) {
        return false
      }
      // this.$emit('send', 1, removeScriptAndEvent(this.content).replace(/<p>(<br(\s+)?(\/)?>)?<\/p>/gi, '').replace(/<div>(<br(\s+)?(\/)?>)?<\/div>/gi, ''))
      this.$emit('send', 1, removeScriptAndEvent(this.content))
      this.clear()
    },
    ctrlEnterEvent (e) {
      e = e || window.event
      const ec = e.keyCode || e.which
      if (e.shiftKey && (ec === 51 || e.code === 'Digit3')) {
        e.preventDefault()
        const id = new Date().getTime()
        if (document.selection && document.selection.createRange) {
          range = document.selection.createRange()
          range.pasteHTML(`<span id="quick-replay-${id}">#</span>&nbsp;`)
        } else {
          document.execCommand('insertHtml', false,`<span id="quick-replay-${id}">#</span>&nbsp;`)
        }
        const ele = document.getElementById(`quick-replay-${id}`)
        setTimeout(() => {
          if (ele.innerText === '##') {
            ele.innerText = '#'
            elementMoveTo(ele)
          }
        }, 0)
        elementMoveTo(ele)
        if (e.preventDefault) {
          e.preventDefault()
        } else {
          return false
        }
        // this.quickReplyVisible = true
      }
      if (this.shortcutKey === 1) {
        // ctrl + enter 发送
        if (e.ctrlKey && ec === 13) {
          this.send()
        }
      }
      if (this.shortcutKey === 0) {
        // ctrl + enter 换行
        if (ec === 13 && e.ctrlKey) {
          const node = document.createElement('p')
          node.innerHTML = '<br />'
          let oldNode = null
          const range = lastSelectionRange || getCurrentRange()
          let aimEle = range && range.commonAncestorContainer
          if (aimEle) {
            let tempEle = null
            if (aimEle.nodeType === 3) {
              aimEle = aimEle.parentNode
            }
            tempEle = aimEle
            while (tempEle && tempEle.nodeName) {
              if (tempEle.nodeName.toLowerCase() === 'p') {
                oldNode = tempEle
                break
              }
              tempEle = tempEle.parentNode
            }
          }
          oldNode.parentNode.insertBefore(node, oldNode.nextSibling)
          elementMoveTo(node)
        } else if (ec === 13) { // ctrl + enter 换行
          this.send()
          if (e.preventDefault) {
            e.preventDefault()
          } else {
            return false
          }
        }
      }
    },
    getTextBeforeCursor () {
      const range = lastSelectionRange || getCurrentRange()
      let aimEle = range && range.commonAncestorContainer
      if (aimEle) {
        let tempEle = null
        if (aimEle.nodeType === 3) {
          aimEle = aimEle.parentNode
        }
        tempEle = aimEle
        while (tempEle && tempEle.nodeName) {
          if (tempEle.nodeName.toLowerCase() === 'span' && tempEle.id) {
            this.quickReplyTextEle = tempEle
            const text = tempEle.innerText.replace('#', '')
            this.quickReplyText = text || null
            return
          }
          tempEle = tempEle.parentNode
        }
      }
      this.quickReplyText = null
      this.quickReplyTextEle = null
    },
    setQuickReplyPosition () {
      const ele = this.$refs.textarea
      const childEle = this.$refs.quickReply
      let parentW = ele.offsetWidth
      let parentH = ele.offsetHeight
      let childW = childEle.offsetWidth
      let childH = childEle.offsetHeight
      let left = 0
      let top = 0
      const pos = position(ele)
      const off = offset(ele)
      if (parentW - pos.left < childW) {
        left = off.left - childW
      } else {
        left = off.left
      }
      if (parentH - pos.top < childH) {
        top = off.top - childH
      } else {
        top = off.top + 20
      }
      this.quickReplyStyle = {
        left: left + 'px',
        top: top + 'px'
      }
    },
    clear () {
      this.$refs.textarea.innerHTML = '<p><br /></p>'
      this.content = ''
    },
    quickReplySearch (val) {
      return this.$service(quickReply.search, {
        method: 'post',
        data: {
          key: val
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(res.code + ':' + res.message))
        }
      }, err => {
        if (err) {
          return Promise.reject(new Error(err))
        }
      })
    },
    replaceQuickReply (val) {
      if (!this.quickReplyTextEle) return
      const fragment = document.createRange().createContextualFragment(val)
      this.quickReplyTextEle.parentNode.insertBefore(fragment, this.quickReplyTextEle)
      elementMoveTo(this.quickReplyTextEle)
      this.quickReplyTextEle.parentNode.removeChild(this.quickReplyTextEle)
      this.content = this.$refs.textarea.innerHTML
    }
  }
}
</script>

<style lang="scss">
.im-editor {
  position: relative;
  border: 1px solid #ccc;
  background: #ffff;
  &__toolbar {
    line-height: 1;
    padding: 6px 0;
    font-size: 0;
    border-bottom: 1px solid #ccc;
    &:after {
      content: "";
      display: table;
      clear: both;
    }
    li {
      float: left;
      height: 24px;
      font-size: 24px;
      position: relative;
      margin: 6px;
      span,
      i {
        cursor: pointer;
        &:hover,
        &.active {
          color: #62B074;
        }
      }
      span {
        &.icon-emoji {
          width: 24px;
          height: 24px;
          display: inline-block;
          background: url("./images/icon-emoji.svg") no-repeat;
          background-size: contain;
          &:hover {
            background: url("./images/icon-emoji-hover.svg") no-repeat;
            background-size: contain;
          }
        }
      }
      &.inline-command {
        border: 1px solid #ccc;
        height: 22px;
        line-height: 22px;
        font-size: 0;
        span {
          display: inline-block;
          vertical-align: middle;
          width: 22px;
          height: 22px;
          line-height: 22px;
          text-align: center;
          font-size: 14px;
        }
        span + span {
          border-left: 1px solid #ccc;
        }
        &.active {
          color: #62B074;
        }
      }
    }
  }
  &__content {
    height: 178px;
    padding: 10px;
    outline: 0;
    font-size: 14px;
    color: #333333;
    position: relative;
    word-wrap: break-word;
    word-break: break-all;
    overflow: auto;
    -webkit-user-select: text;
    user-select: text;
    p,
    div {
      margin-bottom: 1em;
    }
    img {
      max-width: 100%;
    }
    a {
      color: #62B074;
      text-decoration: underline;
    }
  }
  &__send-button {
    position: absolute;
    bottom: 14px;
    right: 14px;
  }
}
.quick-reply-box {
  max-width: 400px;
  max-height: 150px;
  position: fixed;
  border: 1px solid #eee;
  z-index: 10000;
  overflow: auto;
  top: 0;
  left: 0;
  li {
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    background: #fbfbfb;
    &.odd {
      background: #f0f0f0;
    }
    &:hover {
      background: #e5e5e5!important;
    }
  }
}
</style>
