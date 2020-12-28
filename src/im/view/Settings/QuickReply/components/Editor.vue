<template>
  <div class="editor-wrapper">
    <div class="editor-wrapper__toolbar">
      <li>
        <span class="icon-emoji" @click.stop="switchEmoji" :class="{'active': isEmoji}"></span>
        <emoji ref="emoji" v-model="isEmoji" @click="insertEmoji" />
      </li>
      <li class="inline-command">
        <span @click="execCommand('bold')" :class="{'active': viewStyle.bold}"><b>B</b></span>
        <span @click="execCommand('italic')" :class="{'active': viewStyle.italic}"><b><i>I</i></b></span>
        <span @click="execCommand('underline')" :class="{'active': viewStyle.underline}"><b><u>U</u></b></span>
        <span @click="addLink"><b><u>A</u></b></span>
      </li>
    </div>
    <div
      class="editor-wrapper__content"
      contenteditable="true"
      ref="textarea"
      @keyup="textareaSaveSelection(), setTagStyle()"
      @mouseup="textareaSaveSelection(), setTagStyle()"
      @mouseout="textareaSaveSelection"
      @paste="textareaPaste"
      @input="textareaInput"
      spellcheck="false"
      tabindex="0">
      <p><br /></p>
    </div>
  </div>
</template>

<script>
import { saveSelection, getCurrentRange, lastSelectionRange, restoreSelection } from '../../../../component/im/selection'
import { removeScriptAndEvent } from '../../../../util/tool'
import Emoji from '../../../../component/im/Emoji'
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
export default {
  name: 'Editor',
  props: ['value'],
  data () {
    return {
      content: '',
      isEmoji: false,
      viewStyle: {
        'italic': false,
        'underline': false,
        'bold': false
      }
    }
  },
  components: {
    Emoji
  },
  created () {
    document.addEventListener('click', this.hideEmoji)
  },
  mounted () {
    if (this.value) {
      this.setContent(this.value)
    } else {
      this.clear()
    }
  },
  beforeDestroy () {
    document.removeEventListener('click', this.hideEmoji)
  },
  watch: {
    value (val) {
      if (val) {
        this.setContent(val)
      } else {
        this.clear()
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
      }
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
    clear () {
      this.$refs.textarea.innerHTML = '<p><br /></p>'
      this.content = ''
    },
    setContent (val) {
      val = !/<p>/gi.test(val) ? `<p>${val}</p>` : val
      this.$refs.textarea.innerHTML = val
      this.content = val
    }
  }
}
</script>

<style lang="scss">
.editor-wrapper {
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
          background: url("../../../../component/im/images/icon-emoji.svg") no-repeat;
          background-size: contain;
          &:hover {
            background: url("../../../../component/im/images/icon-emoji-hover.svg") no-repeat;
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
}
</style>
