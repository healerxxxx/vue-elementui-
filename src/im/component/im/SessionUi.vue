<template>
  <div class="session-ui">
    <div class="session-ui__header">
      <b>{{userInfo.userNickname || userInfo.nickname}}</b>
      <el-button type="primary" v-if="type === 'im'" size="mini" @click="closeSession">结束服务</el-button>
    </div>
    <div class="session-ui__content" v-loading="initLoading">
      <div class="session-ui__content--wrapper" ref="content" @scroll.passive="fnScroll">
        <div class="load-more" v-if="!noMore && !initLoading">
          <span @click="getHistory" :class="{'loading': historyLoading}">
            {{historyLoading ? '正在加载...' : '加载更多'}}
          </span>
        </div>
        <div class="session-ui__content--list" ref="contentList">
          <message-type
            v-for="(item, index) in list"
            :key="item.id"
            :showLine="index > 0 && item.sessionId !== list[index - 1].sessionId && !/^u-/.test(item.chatMessageId) && !/^u-/.test(list[index - 1].chatMessageId)"
            @send="reSend"
            @inViewport="inViewport"
            @img2Url="img2Url"
            :info="item" />
        </div>
      </div>
      <div class="session-ui__new-message" v-if="newMessage.length > 0" @click="contentScrollToBottom">
        <div class="icon"></div>
        <span>您有{{newMessage.length}}条新消息</span>
      </div>
    </div>
    <el-image-viewer v-if="showViewer" :url-list="imagePreviewList" :on-close="() => showViewer = false"
      :initial-index="previewStartPosition" />
  </div>
</template>

<script>
import { throttle, random, debounce } from '../../util/tool'
import { sessionMessageList, sessionMessageNew, sessionClose, messageUpdateRead } from '../../util/api/session'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
import MessageType from './MessageType'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'SessionUi',
  props: {
    type: {
      type: String,
      default: 'history'
    },
    userInfo: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      list: [],
      noMore: false,
      scrollTop: 0,
      distanceBottom: 0,
      fnScroll: () => { },
      showViewer: false,
      imagePreviewList: [],
      previewStartPosition: 0,
      historyLoading: false,
      initLoading: false,
      timer: false,
      isReadId: 0,
      refreshId: 0,
      newMessage: []
    }
  },
  computed: {
    ...mapState(['currentSession', 'sessionList', 'ws', 'wsStatus'])
  },
  components: {
    ElImageViewer,
    MessageType
  },
  watch: {
    userInfo: {
      deep: true,
      handler (newVal, oldVal) {
        if (newVal.messageUserId !== oldVal.messageUserId) {
          this.list = []
          this.noMore = false
          this.historyLoading = false
          this.initLoading = false
          this.isReadId = 0
          this.refreshId = 0
          this.newMessage = []
          this.initSession()
        }
      }
    },
    isReadId (newVal, oldVal) {
      if (newVal !== 0) {
        this.updateRead(newVal)
      }
    },
    wsStatus (val) {
      if (val === 'OPEN') {
        this.clearRefreshTiming()
      } else {
        this.refreshTiming()
      }
    }
  },
  created () {
    this.fnScroll = throttle(this.contentScroll, 50)
    this.$bus.$on('imageView', this.busImageView)
    this.$bus.$on('transId', this.busTransId)
    this.initSession()
    this.$bus.$on('wsPushData', this.busWsPushData)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.refreshMessage()
      }
    })
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.refreshMessage()
      }
    })
  },
  activated () {
    this.$refs.content.scrollTop = this.scrollTop
  },
  methods: {
    ...mapMutations(['setSessionList', 'setCurrentSession']),
    initSession () {
      if (!this.userInfo.messageUserId) return
      this.initList()
      if (this.wsStatus === 'OPEN') {
        this.clearRefreshTiming()
      } else {
        this.refreshTiming()
      }
    },
    contentScroll (e) {
      const element = this.$refs.content
      if (element) {
        this.scrollTop = element.scrollTop
        this.distanceBottom = element.scrollHeight - element.clientHeight - element.scrollTop
        if (this.distanceBottom < 10) {
          this.newMessage = []
        }
      }
    },
    contentScrollToBottom () {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.content) {
            this.$refs.content.scrollTop = this.$refs.content.scrollHeight
          }
        }, 0)
        setTimeout(() => {
          if (this.$refs.content) {
            this.$refs.content.scrollTop = this.$refs.content.scrollHeight
          }
        }, 240)
      })
    },
    send (type, data) {
      const now = new Date().getTime()
      const id = now + '' + +random(100, 999)
      const _data = {
        createTime: now,
        avatar: this.$store.state.userInfo.avatar,
        chatMessageId: 'u-' + id,
        id: id,
        contentType: type,
        messageUserId: this.userInfo.messageUserId,
        content: data,
        loading: true,
        error: false,
        status: 1,
        typeId: 5
      }
      this.setCurrentSession({
        ...this.currentSession,
        ...{
          contentType: type,
          messageContent: data,
          createTime: now
        }
      })
      this.list.push(_data)
      this.contentScrollToBottom()
    },
    getHistory () {
      if (this.historyLoading || this.noMore) return
      this.historyLoading = true
      const params = {}
      if (this.list[0] && !/^u-/.test(this.list[0].chatMessageId)) {
        params.chatMessageId = this.list[0].chatMessageId
      }
      this.getList(params).then(res => {
        const scrollTop = this.$refs.contentList.clientHeight
        const arr = []
        res.map(item => {
          item.id = item.chatMessageId
          arr.unshift(item)
        })
        this.list = [...arr, ...this.list]
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.content.scrollTop = this.$refs.content.scrollHeight - scrollTop - 50
          }, 0)
        })
        this.noMore = res.length < 20
        this.historyLoading = false
      }).catch(err => {
        if (err) {
          this.$message.error(err)
          this.historyLoading = false
        }
      })
    },
    initList () {
      if (this.initLoading) return
      this.initLoading = true
      this.getList().then(res => {
        const arr = []
        res.reverse().map(item => {
          item.id = item.chatMessageId
          arr.push(item)
        })
        this.list = arr
        this.noMore = res.length < 20
        this.contentScrollToBottom()
        this.initLoading = false
      }).catch(err => {
        if (err) {
          this.$message.error(err)
          this.initLoading = false
        }
      })
    },
    getList (params) {
      return this.$service(sessionMessageList, {
        params: { ...params, ...{ messageUserId: this.userInfo.messageUserId } }
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(res.code + ':' + res.message))
        }
      }, err => {
        return Promise.reject(new Error(JSON.stringify(err)))
      })
    },
    refreshMessage () {
      const params = {}
      const arr = this.list.filter(item => {
        return item.typeId === 5 && item.status === 1 && !/^u-/.test(item.chatMessageId)
      })
      if (arr.length > 0) {
        params.chatMessageId = arr[0].chatMessageId
      } else if (this.list.length > 0) {
        for (let i = this.list.length - 1; i >= 0; i--) {
          if (!/^u-/.test(this.list[i].chatMessageId)) {
            params.chatMessageId = this.list[i].chatMessageId
            break
          }
        }
      }
      this.$service(sessionMessageNew, {
        params: {
          ...params,
          ...{
            messageUserId: this.userInfo.messageUserId
          }
        }
      }).then(res => {
        if (res.code === 200) {
          this.setNewMessage(res.data)
        }
      })
    },
    inViewport (id, messageUserId) {
      const i = this.newMessage.findIndex(item => item.chatMessageId === id)
      if (i > -1) {
        this.newMessage.splice(i, 1)
      }
      debounce(() => {
        if (this.userInfo.messageUserId === messageUserId && id > this.isReadId) {
          this.isReadId = id
        }
      }, 1500)()
    },
    closeSession () {
      this.$service(sessionClose, {
        params: {
          messageUserId: this.userInfo.messageUserId
        }
      }).then(res => {
        if (res.code === 200) {
          this.setSessionList(this.sessionList.filter(item => item.messageUserId !== this.userInfo.messageUserId))
          this.setCurrentSession({})
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    updateRead (id) {
      if (!id) return false
      if (this.wsStatus === 'OPEN') {
        this.ws.send({
          headers: {
            cmd: 'push',
            timeout: '5000',
            ACK_MODEL: 2,
            method: '/api/admin/rocket/admin/read'
          },
          body: JSON.stringify({
            messageUserId: this.userInfo.messageUserId
          })
        })
      } else {
        this.$service(messageUpdateRead, {
          params: {
            messageUserId: this.userInfo.messageUserId
          }
        }).then(res => {
          if (res.code === 200) {
          }
        })
      }
    },
    busImageView (val) {
      const arr = []
      this.list.map(item => {
        if (item.contentType === 2 && /^http/.test(item.content)) {
          arr.push(item.content)
        }
      })
      this.imagePreviewList = arr
      this.previewStartPosition = arr.findIndex(item => item === val)
      this.showViewer = true
    },
    busTransId (oldId, info) {
      const i = this.list.findIndex(item => item.chatMessageId === oldId)
      const newData = {
        ...this.list[i],
        ...info
      }
      this.list.splice(i, 1, newData)
    },
    busWsPushData (res) {
      if (res.msgTypeId === 1 && res.data) {
        const data = JSON.parse(res.data)
        if (data.messageUserId === this.userInfo.messageUserId) {
          this.setNewMessage([data])
        }
      }
      if (res.msgTypeId === 3 && res.data) {
        const {messageUserId, chatMessageIdList} = JSON.parse(res.data)
        if (messageUserId === this.userInfo.messageUserId) {
          chatMessageIdList.sort((a, b) => {
            return a < b ? 1 : -1
          })
          const id = chatMessageIdList[0]
          this.list.forEach(item => {
            if (item.typeId === 5 && item.chatMessageId <= id && item.status === 1) {
              item.status = 2
            }
          })
        }
      }
    },
    setNewMessage (array) {
      const arr = []
      array.map(item => {
        item.id = item.chatMessageId
        const i = this.list.findIndex(_item => _item.chatMessageId === item.chatMessageId)
        if (i === -1) {
          arr.push(item)
        } else {
          this.list.splice(i, 1, item)
        }
      })
      if (arr.filter(item => item.typeId === 4).length > 0) {
        this.list.forEach(item => {
          item.status = 2
        })
      }
      if (arr.length > 0) {
        this.list = [...this.list, ...arr]
        if (this.distanceBottom > 30) {
          this.newMessage = [...this.newMessage, ...arr.filter(item => item.typeId === 4)]
        } else {
          this.contentScrollToBottom()
        }
      }
    },
    refreshTiming () {
      this.clearRefreshTiming()
      if (this.type === 'im') {
        this.timer = setInterval(this.refreshMessage, 10000)
      }
    },
    clearRefreshTiming () {
      clearInterval(this.timer)
    },
    img2Url (val) {
      const i = this.list.findIndex(item => item.chatMessageId === val.chatMessageId)
      const newData = {
        ...this.list[i],
        ...val
      }
      this.list.splice(i, 1, newData)
    }
  }
}
</script>

<style lang="scss">
.session-ui {
  position: relative;
  height: 100%;
  min-height: 200px;
  border: 1px solid #ccc;
  &__header {
    line-height: 32px;
    padding: 5px 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    b {
      font-size: 16px;
    }
  }
  &__content {
    position: relative;
    height: calc(100% - 41px);
    zoom: 1;
    overflow: hidden;
    -webkit-user-select: text;
    user-select: text;
    &--wrapper {
      height: 100%;
      position: relative;
      overflow: auto;
      .load-more {
        line-height: 36px;
        height: 36px;
        text-align: center;
        span {
          height: 24px;
          display: inline-block;
          vertical-align: middle;
          color: #fff;
          padding: 0 8px;
          line-height: 24px;
          font-size: 12px;
          background: #4e4e4e;
          border-radius: 3px;
          cursor: pointer;
          &:hover {
            background: #62B074;
          }
          &.loading:hover {
            background: #4e4e4e;
          }
        }
      }
    }
  }
  &__new-message {
    position: absolute;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    bottom: 0;
    color: #fff;
    background: rgba(51, 51, 51, 0.9);
    border-radius: 2px;
    line-height: 30px;
    padding: 0 8px;
    cursor: pointer;
    .icon,
    span {
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
    }
    .icon {
      width: 9px;
      height: 9px;
      background: url("./images/icon-new-message.png") no-repeat;
      background-size: contain;
      margin-right: 3px;
    }
  }
}
</style>
