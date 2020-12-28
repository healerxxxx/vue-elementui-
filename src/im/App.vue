<template>
  <div id="app">
    <el-container style="min-height: 100vh;">
      <el-header style="background-color:#62B074;position:fixed;left:0;top:0;right:0;z-index:999;" height="48px">
        <Header></Header>
      </el-header>
      <AsideFixed v-if="$store.state.windowWidth >= 1280" />
      <AsideDrawer v-else />
      <el-main
        :style="{'margin': '48px 0 0 ' + ($store.state.windowWidth >= 1280 ? 180 : 0) + 'px', 'min-width': '768px'}">
        <keep-alive :include="[...keepAliveRoutes]">
          <router-view />
        </keep-alive>
      </el-main>
      <Dialog />
    </el-container>
  </div>
</template>

<script>
import WebSocket from './util/WebSocket'
import Header from './component/Header'
import AsideFixed from './component/AsideFixed'
import AsideDrawer from './component/AsideDrawer'
import Dialog from './component/Dialog'
import { getAliveRoute } from './util/tool'
import { adminKeepLive, wsAddress } from './util/api/common'
import { mapState, mapMutations } from 'vuex'
let reconectWsCount = 0
let reconnectTrying = null
export default {
  name: 'App',
  data () {
    return {
      sessionListTimer: null,
      aliveTimer: null,
      wsAddress: null
    }
  },
  computed: {
    ...mapState(['userInfo', 'ws', 'wsStatus']),
    keepAliveRoutes () {
      return getAliveRoute()
    }
  },
  created () {
    window.onload = () => {
      if ('Notification' in window) {
        Notification.requestPermission()
      }
      window.onbeforeunload = function (e) {
        e = e || window.event
        if (e) {
          e.returnValue = '关闭提示'
        }
        return '关闭提示'
      }
    }
    window.onresize = () => {
      this.$store.state.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.$store.state.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    }
  },
  components: {
    Header,
    AsideFixed,
    AsideDrawer,
    Dialog
  },
  watch: {
    $route () {
      if (this.$store.state.menuOpen) {
        this.$store.state.menuOpen = false
        window.scrollTo(0, 0)
      }
    },
    ws (val) {
      if (val) {
        val.message = (data) => {
          data.body && this.$bus.$emit('wsPushData', data.body)
        }
      }
    },
    userInfo (val) {
      if (val) {
        window.WaterMark.mark({text: val.loginName})
        this.getSessionListAndNotification()
        this.sessionListTimer = setInterval(() => {
          this.getSessionListAndNotification()
        }, 2000)
        this.keepLive()
        this.connectWs()
        this.aliveTimer = setInterval(this.keepLive, 1000 * 60)
      }
    },
    wsStatus (val) {
      if (val === 'OPEN') {
        reconectWsCount = 0
        this.ws.send({
          headers: {
            cmd: 'bind',
            from: `${this.userInfo.adminId}_1`
          }
        })
      } else if (val !== 'CONNECTING' && val !== 'NOT_SUPPORT') {
        this.reconnectWs()
      }
    }
  },
  methods: {
    ...mapMutations(['setWs', 'setWsStatus']),
    keepLive () {
      this.$service(adminKeepLive)
    },
    getSessionListAndNotification () {
      this.$store.dispatch('getSessionList').then(res => {
        const arr = res.data.filter(item => item.notReadNum > 0)
        if (arr.length > 0) {
          const title = '有新客服消息啦~'
          const opiton = {
            renotify: true,
            tag: 1000
          }
          const permission = Notification.permission
          if (permission === 'granted') {
            const notice = new Notification(title, opiton)
            notice.onclick = () => {
              notice.close()
            }
          } else if (permission === 'default') {
            Notification.requestPermission().then((res) => {
              if (res === 'granted') {
                const notice = new Notification(title, opiton)
                notice.onclick = () => {
                  notice.close()
                }
              }
            })
          }
        }
      }).catch(err => {
        if (err) { }
      })
    },
    getWsAddress () {
      return this.$service(wsAddress, {
        method: 'post',
        data: {
          appId: 1
        }
      }).then(res => {
        if (res.code === 200 && res.data.accessOpen) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res)
        }
      }, err => {
        if (err) {
          return Promise.reject(new Error('网络错误'))
        }
      })
    },
    connectWs () {
      this.getWsAddress().then(res => {
        const _this = this
        const ws = new WebSocket({
          url: `${res.serverAddr}?AccessToken=${res.sign}`,
          statusCallback (status) {
            _this.setWsStatus(status)
          }
        })
        this.setWs(ws)
      }).catch(err => {
        if (typeof err !== 'object' || !err.data || err.data.accessOpen !== false) {
          this.reconnectWs()
        }
      })
    },
    reconnectWs () {
      clearTimeout(reconnectTrying)
      if (reconectWsCount >= 8) {
        return
      }
      reconectWsCount++
      reconnectTrying = setTimeout(() => {
        this.connectWs()
      }, Math.pow(2, reconectWsCount) * 2000)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
@import "./assets/styles/reset.css";
@import "./assets/styles/commen.scss";
.aside-fixed {
  position: relative;
  height: 800px;
  box-shadow: 1px 0 0 #e6e6e6;
}
</style>
