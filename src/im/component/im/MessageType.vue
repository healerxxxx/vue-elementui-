<template>
  <div class="message-type-wrapper">
    <div class="message-type__end line" v-if="showLine">
      <div class="line"></div>
      <span>历史消息分割线</span>
    </div>
    <div class="message-type__welcome" v-if="infoTemp.typeId === 1">
      <div class="content">
        <div class="avatar">
          <img :src="infoTemp.avatar + '?imageView&thumbnail=40y40&quality=85'" @error.once="avatarError">
        </div>
        <div class="text" v-html="`<p>${infoTemp.content.replace(/\r|\n/g, '</p><p>')}</p>`"></div>
      </div>
    </div>
    <div class="message-type__end" v-if="infoTemp.typeId === 3">
      <span>{{infoTemp.createTime | dateFormat}} {{infoTemp.content}}</span>
    </div>
    <div class="message-type__end" v-if="infoTemp.typeId === 6">
      <span>{{infoTemp.content}}</span>
    </div>
    <div class="message-type__base" :class="{'reverse': infoTemp.typeId === 2 || infoTemp.typeId === 5 }"
      v-if="[2, 4, 5].indexOf(infoTemp.typeId) > -1">
      <div class="message-type__base--content">
        <div class="avatar">
          <img :src="infoTemp.avatar + '?imageView&thumbnail=40y40&quality=85'" @error.once="avatarError">
        </div>
        <div class="content">
          <div class="img" v-if="infoTemp.contentType === 2">
            <message-type-image :img="infoTemp.content" @img2Url="img2Url" @imgError="imgError" @imgIsLoad="imgIsLoad"
              ref="image" />
          </div>
          <div class="text" v-if="infoTemp.contentType === 1" v-html="infoTemp.content">
          </div>
          <div class="icon loading" v-if="infoTemp.loading">
          </div>
          <div class="icon error" v-if="infoTemp.error" @click="errorClick">
          </div>
        </div>
      </div>
      <div class="message-type__base--read">
        <span class="read" :class="{'unread': infoTemp.status === 1}"
          v-if="infoTemp.typeId === 5 && (infoTemp.status === 1 || infoTemp.status === 2)">
          {{{1: '未读', 2: '已读'}[infoTemp.status]}}
        </span>
        <span>{{infoTemp.createTime | dateFormat}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { sessionSend } from '../../util/api/session'
import MessageTypeImage from './MessageTypeImage'
import { throttle, formatDate } from '../../util/tool'
export default {
  name: 'MessageType',
  props: ['info', 'showLine'],
  data () {
    return {
      infoTemp: {},
      fnScroll: () => { },
      scrollEmit: false
    }
  },
  created () {
    this.infoTemp = { ...{ loading: this.info.contentType === 2, error: false }, ...this.info }
    if (/^u-/.test(this.infoTemp.chatMessageId)) {
      if (this.infoTemp.contentType === 1) {
        this.sendContent(this.infoTemp)
      }
    }
    this.fnScroll = throttle(this.parentScroll, 50)
  },
  mounted () {
    if (this.infoTemp.typeId === 4 && this.infoTemp.status === 1) {
      this.$parent.$refs.content.addEventListener('scroll', this.fnScroll)
      this.parentScroll()
    }
  },
  watch: {
    info: {
      deep: true,
      handler (val) {
        this.infoTemp = { ...this.infoTemp, ...val }
      }
    }
  },
  components: {
    MessageTypeImage
  },
  filters: {
    dateFormat (val) {
      const time = formatDate(val, 'yyyy-MM-dd')
      const today = formatDate(new Date(), 'yyyy-MM-dd')
      const yestoday = formatDate(new Date() - 24 * 60 * 60 * 1000, 'yyyy-MM-dd')
      if (today === time) {
        return '今天 ' + formatDate(val, 'hh:mm:ss')
      }
      if (yestoday === time) {
        return '昨天 ' + formatDate(val, 'hh:mm:ss')
      }
      if (time.split('-')[0] === today.split('-')[0]) {
        return formatDate(val, 'MM-dd hh:mm:ss')
      }
      return formatDate(val, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  methods: {
    clearHtml (val) {
      if (!val) {
        return val
      } else {
        return val.replace(/<p>(<br(\s+)?(\/)?>)?<\/p>/gi, '').replace(/<div>(<br(\s+)?(\/)?>)?<\/div>/gi, '')
      }
    },
    parentScroll (e) {
      let element
      if (!e) {
        element = this.$parent.$refs.content
      } else {
        element = e.target || e.srcElement
      }
      const top = element.scrollTop
      const bottom = top + element.clientHeight
      const elemTop = this.$el.offsetTop
      const elemBottom = elemTop + this.$el.clientHeight
      let flag = false
      if ((elemTop <= bottom) && (elemTop >= top)) {
        flag = true
      }
      if ((elemBottom <= bottom) && (elemBottom >= top)) {
        flag = true
      }
      if ((elemBottom >= bottom) && (elemTop <= top)) {
        flag = true
      }
      if (flag) {
        if (!this.scrollEmit) {
          this.$emit('inViewport', this.infoTemp.chatMessageId, this.infoTemp.messageUserId)
          this.scrollEmit = true
          this.$parent.$refs.content.removeEventListener('scroll', this.fnScroll)
        }
      }
    },
    img2Url (val) {
      this.infoTemp.content = val
      this.sendContent(this.infoTemp)
      this.$emit('img2Url', this.infoTemp)
    },
    imgError () {
      this.infoTemp.loading = false
      this.infoTemp.error = true
    },
    imgIsLoad () {
      if (!/^u-/.test(this.infoTemp.chatMessageId)) {
        this.infoTemp.loading = false
        this.infoTemp.error = false
      }
    },
    errorClick () {
      this.infoTemp.loading = true
      this.infoTemp.error = false
      if (/^u-/.test(this.infoTemp.chatMessageId)) {
        if (this.infoTemp.contentType === 2) {
          if (/^http/.test(this.img)) {
            // 重新发送
            this.sendContent(this.infoTemp)
          } else {
            if (this.$refs.image) {
              this.$refs.image.errorClick()
            }
          }
        } else {
          this.sendContent(this.infoTemp)
        }
      } else {
        if (this.$refs.image) {
          this.$refs.image.errorClick()
        }
      }
    },
    avatarError (e) {
      const element = e.target || e.srcElement
      const parent = element.parentNode || element.parentElement
      parent.innerHTML = '<div class="default_avatar"></div>'
    },
    sendContent (val) {
      this.infoTemp.loading = true
      this.$service(sessionSend, {
        method: 'post',
        data: val
      }).then(res => {
        this.infoTemp.loading = false
        if (res.code === 200) {
          const oldId = this.infoTemp.chatMessageId
          this.infoTemp = { ...this.infoTemp, ...res.data }
          this.$bus.$emit('transId', oldId, this.infoTemp)
        } else {
          this.infoTemp.error = true
          this.$message.error(res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
          this.infoTemp.error = true
          this.infoTemp.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.message-type-wrapper {
  padding: 12px;
  font-size: 0;
  .default_avatar {
    width: 100%;
    height: 100%;
    background: url("./images/icon-avatar-default.png") no-repeat;
    background-size: contain;
  }
}
.message-type {
  &__welcome {
    position: relative;
    padding-top: 25px;
    .content {
      position: relative;
      width: 58%;
      background: #f3f3f3;
      padding: 44px 24px 17px;
      border-radius: 3px;
      margin: 0 auto;
      .avatar {
        position: absolute;
        width: 60px;
        height: 60px;
        left: 50%;
        top: -31px;
        margin-left: -31px;
        padding: 2px;
        background: #f3f3f3;
        border-radius: 100%;
        z-index: 1;
        img {
          display: inline-block;
          width: 100%;
          height: 100%;
          border-radius: 100%;
        }
      }
      .text {
        text-align: center;
        font-size: 14px;
        color: #333333;
        font-weight: bold;
        p {
          overflow: hidden;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
  &__end {
    position: relative;
    text-align: center;
    span {
      display: inline-block;
      background: #eee;
      border-radius: 10px;
      line-height: 20px;
      padding: 0 10px;
      color: #666;
      font-size: 12px;
      position: relative;
      z-index: 1;
    }
    &.line {
      padding-bottom: 12px;
      .line {
        position: absolute;
        left: 0px;
        right: 0px;
        height: 0px;
        top: 10px;
        border-bottom: 1px dashed #d5d5d5;
        z-index: 0;
      }
      span {
        background: #fff;
      }
    }
  }
  &__base {
    position: relative;
    &--content {
      display: flex;
    }
    &--read {
      display: flex;
      padding-left: 50px;
      line-height: 2;
      color: #999;
      font-size: 12px;
      span {
        &.unread {
          color: #ff6e25;
        }
        &.read {
          margin-right: 10px;
        }
      }
    }
    .avatar {
      height: 40px;
      width: 40px;
      margin: 0 10px 0 0;
      flex-shrink: 0;
      img {
        display: inline-block;
        height: 100%;
        width: 100%;
        border-radius: 100%;
      }
    }
    .content {
      display: flex;
      align-items: center;
      padding-right: 80px;
      .img {
        max-width: 200px;
        max-height: 200px;
      }
      .text {
        line-height: 20px;
        padding: 8px;
        background: #f3f3f3;
        font-size: 14px;
        color: #333333;
        border-radius: 3px;
        word-wrap: break-word;
        word-break: break-all;
        a {
          color: #1915e2;
          text-decoration: underline;
        }
      }
      .icon {
        flex-shrink: 0;
        &.loading {
          width: 14px;
          height: 14px;
          animation: circleRotate 1s infinite linear;
          margin: 0 8px;
          background: url("./images/icon-net-loading.png") no-repeat;
          background-size: contain;
        }
        &.error {
          width: 18px;
          height: 18px;
          margin: 0 10px;
          background: url("./images/icon-net-error.png") no-repeat;
          background-size: contain;
        }
      }
    }
    &.reverse {
      .message-type__base--read {
        -webkit-box-orient: horizontal;
        -webkit-box-direction: reverse;
        -ms-flex-direction: row-reverse;
        flex-direction: row-reverse;
        padding-left: 0;
        padding-right: 50px;
        span {
          &.read {
            margin-left: 10px;
            margin-right: 0;
          }
        }
      }
      .message-type__base--content,
      .content {
        -webkit-box-orient: horizontal;
        -webkit-box-direction: reverse;
        -ms-flex-direction: row-reverse;
        flex-direction: row-reverse;
      }
      .content {
        padding-right: 0;
        padding-left: 80px;
        .text {
          background: #bee9be;
        }
      }
      .avatar {
        margin: 0 0 0 10px;
      }
    }
  }
}
</style>
