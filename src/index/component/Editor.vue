<template>
  <div class="editor">
    <div ref="quillEditor"></div>
    <div ref="quillEditorTemp" style="display:none;"></div>
    <div class="quill-limit">
      <span>注：{{wordLimitString}}建议上传图片宽高不超1000px, 大小不超1M</span>
      <span style="float:right;">已输入{{wordCount}}字</span>
    </div>
  </div>
</template>

<script>
import _Quill from 'quill'
import ImageBlot from './ImageBlot'
import { getWordCount } from '../util/tool'
import { uploadImg } from '../util/commonQuery'
import 'quill/dist/quill.snow.css'
_Quill.register(ImageBlot)

export default {
  name: 'Editor',
  props: {
    value: {
      type: 'String',
      default: ''
    },
    height: {
      type: 'Number',
      default: 250
    },
    wordLimitString: {
      type: 'String',
      default: ''
    }
  },
  data () {
    return {
      quill: null,
      quillTemp: null,
      content: null,
      wordCount: 0,
      quillUpdateImg: false,
      editorOption: {
        theme: 'snow',
        boundary: document.body,
        placeholder: '',
        modules: {
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'image', 'clean'] // 加粗 斜体 下划线 删除线 图片 清除格式
            ],
            handlers: {
              image: this.handlersImage
            }
          },
          clipboard: {
            matchers: [
              [Node.ELEMENT_NODE, (node, delta) => {
                let ops = []
                delta.ops.forEach(op => {
                  if (op.insert && typeof op.insert === 'string') {
                    ops.push({insert: op.insert})
                  }
                })
                delta.ops = ops
                return delta
              }]
            ]
          }
        }
      }
    }
  },
  mounted () {
    this.initialize()
  },
  methods: {
    initialize () {
      if (this.$el) {
        this.quill = new _Quill(this.$refs.quillEditor, this.editorOption)
        this.quillTemp = new _Quill(this.$refs.quillEditorTemp)
        if (this.value || this.content) {
          this.quill.root.innerHTML = this.value || this.content || ''
        }
        this.quill.container.style.height = `${this.height}px`
        this.quill.on('editor-change', (delta, oldDelta, source) => {
          let html = this.quill.root.innerHTML
          if (html === '<p><br></p>') html = ''
          this.content = html
          this.$emit('input', this.content)
        })
      }
    },
    /**
     * @description: 覆盖上传图片的效果，通过临时创建的input，触发click事件，监听change变化拿到file，然后上传，上传完成后，在利用quill插入媒体事件进行插入操作
     * @param {Boolean} value quill默认回调值，是否点击图片的意思吧
     */
    handlersImage (value) {
      if (value) {
        if (this.quillUpdateImg) {
          this.$message.warning('正有图片在上传中...')
          return
        }
        this.quillUpdateImg = true
        let _input = document.createElement('input')
        _input.type = 'file'
        _input.accept = 'image/jpeg,image/jpg,image/png,image/gif'
        _input.style.display = 'none'
        _input.addEventListener('change', (event) => {
          this.quillUpdateImg = false
          let _file = event.target.files || event.dataTransfer.files
          uploadImg(_file[0], 'feedback'/* 'thread' */).then(res => {
            let img = new Image()
            img.src = res
            img.onload = () => {
              let pcUrl = res + '?imageView&thumbnail=1000y1000&quality=85'
              let oWidth = img.width
              let oHeight = img.height
              let quill = this.quill
              let length = quill.getSelection().index
              quill.insertEmbed(length, 'image', {
                ourl: res,
                src: pcUrl,
                owidth: oWidth,
                oheight: oHeight
              })
              quill.setSelection(length + 1)
            }
            document.documentElement.removeChild(_input)
          }, err => {
            this.quillUpdateImg = false
            document.documentElement.removeChild(_input)
            if (err) this.$message.error('上传图片失败')
          })
        })
        document.documentElement.appendChild(_input)
        _input.click()
      }
    },
    getWordCount () {
      this.wordCount = getWordCount(this.value)
    }
  },
  watch: {
    value (newVal, oldVal) {
      this.getWordCount()
      if (this.quill) {
        if (newVal && newVal !== this.content) {
          this.content = newVal
          this.quillTemp.pasteHTML(newVal)
          const _Delta = this.quillTemp.getContents()
          this.quill.setContents(_Delta)
        } else if (!newVal) {
          this.quill.setText('')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.ql-editor p, .ql-editor div{
  margin: 1em 0!important;
  line-height: 1.6;
  font-size: 16px;
  img {
    max-width: 100%;
  }
}
.ql-editor img {
  max-width: 100%;
}
.quill-limit{
  line-height: 2.5;
  border: 1px solid #ccc;
  border-top: 0;
  padding: 0 15px;
  background: #f0f0f0;
  color: #666;
  font-size: 14px;
}
</style>
