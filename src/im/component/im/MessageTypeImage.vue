<template>
  <div class="message-type-image">
    <div
      class="placeholder"
      v-if="type === 'http' && !isLoad">
    </div>
    <div
      class="error"
      v-if="type === 'http' && error">
    </div>
    <img
      :src="url + imageClipper"
      v-if="type === 'http' && isLoad"
      @click="viewImg" />
    <canvas
      v-show="type === 'file'"
      @click="viewImg"
      ref="canvas">
    </canvas>
  </div>
</template>

<script>
import Common from '../../util/api/common'
export default {
  name: 'MessageTypeImage',
  props: ['img'],
  data () {
    return {
      type: null,
      isLoad: false,
      error: false,
      url: null,
      width: 0,
      height: 0
    }
  },
  computed: {
    imageClipper () {
      if (this.width !== 0 && this.height !== 0) {
        return `?imageView&thumbnail=${this.width}y${this.height}&quality=85`
      }
      return ''
    }
  },
  watch: {
    error (val) {
      if (val) {
        this.$emit('imgError', val)
      }
    }
  },
  mounted () {
    if (Object.prototype.toString.call(this.img) === '[object File]') {
      this.type = 'file'
      this.fileReader()
      this.uploadFileImg()
    } else {
      this.type = 'http'
      this.loadHttpImg(this.img)
    }
  },
  methods: {
    loadHttpImg (url) {
      this.isLoad = false
      this.error = false
      const img = new Image()
      img.src = url
      img.onload = () => {
        const size = this.getImageSize(img)
        this.width = size.w
        this.height = size.h
        this.url = url
        this.isLoad = true
        this.$emit('imgIsLoad')
      }
      img.onerror = () => {
        this.error = true
      }
    },
    uploadFileImg () {
      this.error = false
      const formData = new FormData()
      formData.append('0', this.img)
      const params = {
        method: 'post',
        urlParams: {
          serviceType: 'im'
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      }
      this.$service(Common.uploadImg, params).then(res => {
        if (res.code === 200) {
          this.$emit('img2Url', res.data[0].sourceUrl)
        } else {
          this.error = true
          this.$message.error(res.message)
        }
      }).catch(e => {
        if (e) {
          this.error = true
          this.$message.error('网络错误，图片上传失败')
        }
      })
    },
    drawCanvas (image) {
      const canvas = this.$refs.canvas
      var img = new Image()
      img.src = image
      img.onload = () => {
        const size = this.getImageSize(img)
        this.width = canvas.width = size.w
        this.height = canvas.height = size.h
        canvas.getContext('2d').drawImage(img, 0, 0, size.w, size.h)
      }
    },
    getImageSize (img) {
      const max = 200
      const min = 50
      let width
      let height
      if (img.width >= img.height) {
        if (img.width > max) {
          width = max
        } else if (img.width < min) {
          width = min
        } else {
          width = img.width
        }
        height = img.height * width / img.width
      } else {
        if (img.height > max) {
          height = max
        } else if (img.height < min) {
          height = min
        } else {
          height = img.height
        }
        width = img.width * height / img.height
      }
      return {
        w: width,
        h: height
      }
    },
    fileReader () {
      const reader = new FileReader()
      reader.onload = (event) => {
        this.drawCanvas(event.target.result)
      }
      reader.readAsDataURL(this.img)
    },
    errorClick () {
      if (!/^http/.test(this.img)) {
        this.uploadFileImg()
      } else if (this.isLoad === false) {
        this.loadHttpImg(this.img)
      }
    },
    viewImg () {
      if (/^http/.test(this.img)) {
        this.$bus.$emit('imageView', this.img)
      }
    }
  }
}
</script>

<style lang="scss">
.message-type-image {
  position: relative;
  .placeholder, .error {
    width: 98px;
    height: 78px;
  }
  .placeholder {
    background: url('./images/icon-media-loading.png') no-repeat;
    background-size: contain;
  }
  .error {
    background: url('./images/icon-media-error.png') no-repeat;
    background-size: contain;
  }
  img {
    max-width: 200px;
    min-width: 50px;
    min-height: 50px;
    max-height: 200px;
    border-radius: 6px;
  }
  canvas {
    border-radius: 6px;
  }
}
</style>
