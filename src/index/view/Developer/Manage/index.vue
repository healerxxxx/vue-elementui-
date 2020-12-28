<template>
  <div class="statistics-journal">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" size="mini" v-if="pollingStatus.openStatus !== undefined">
      <el-form-item>
        <span>客户端轮询状态: {{pollingStatus.openStatus ? '打开' : '关闭'}}</span>
      </el-form-item>
      <el-form-item>
        <el-button
          size="mini"
          type="primary"
          :loading="pollingStatus.loading"
          @click="statusUpdate('polling')">{{!pollingStatus.openStatus ? '打开' : '关闭'}}</el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true" size="mini">
      <el-form-item v-if="chatStatus.openStatus !== undefined">
        <span style="margin-right: 10px;">
          红彩-聊天室：{{chatStatus.openStatus ? '上线' : '下线'}}
        </span>
        <el-button
          type="primary"
          size="mini"
          :loading="chatStatus.loading"
          @click="statusUpdate('chat')">{{!chatStatus.openStatus ? '上线' : '下线'}}</el-button>
      </el-form-item>
      <el-form-item v-if="socketStatus.openStatus !== undefined">
        <span style="margin-right: 10px;">
          红彩-socket推送：{{socketStatus.openStatus ? '上线' : '下线'}}
        </span>
        <el-button
          type="primary"
          size="mini"
          :loading="socketStatus.loading"
          @click="statusUpdate('socket')">{{!socketStatus.openStatus ? '上线' : '下线'}}</el-button>
      </el-form-item>
      <el-form-item v-if="socketIMStatus.openStatus !== undefined">
        <span style="margin-right: 10px;">
          红彩-客服socket推送：{{socketIMStatus.openStatus ? '上线' : '下线'}}
        </span>
        <el-button
          type="primary"
          size="mini"
          :loading="socketIMStatus.loading"
          @click="statusUpdate('im')">{{!socketIMStatus.openStatus ? '上线' : '下线'}}</el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true" size="mini" v-if="ZCCBAStatus.openStatus !== undefined">
      <el-form-item>
        <span>中超/CBA免费资讯展示: {{ZCCBAStatus.openStatus ? '打开' : '关闭'}}</span>
      </el-form-item>
      <el-form-item>
        <el-button
          size="mini"
          type="primary"
          :loading="ZCCBAStatus.loading"
          @click="statusUpdate('zc')">{{!ZCCBAStatus.openStatus ? '打开' : '关闭'}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { CommonApi } from '../../../util/api'
export default {
  name: 'DeveloperManage',
  data () {
    return {
      pollingStatus: {
        loading: false
      },
      chatStatus: {
        loading: false
      },
      socketStatus: {
        loading: false
      },
      socketIMStatus: {
        loading: false
      },
      ZCCBAStatus: {
        loading: false
      }
    }
  },
  created () {
    this.getStatus('polling')
    this.getStatus('chat')
    this.getStatus('socket')
    this.getStatus('im')
    this.getStatus('zc')
  },
  methods: {
    getStatus (type) {
      const { obj, first, second } = this.getObj(type)
      const params = {}
      if (first) {
        params.firstLevelType = first
      }
      if (second) {
        params.secondLevelType = second
      }
      this.$service(CommonApi.switchInfo, {
        params: params
      }).then(res => {
        if (res.code === 200) {
          let bool = false
          if (typeof res.data === 'object') {
            if (typeof res.data.openStatus !== 'undefined') {
              bool = res.data.openStatus
            }
          } else {
            bool = res.data
          }
          this.$set(obj, 'openStatus', bool)
        }
      })
    },
    statusUpdate (type) {
      const { obj, first, second } = this.getObj(type)
      if (obj.loading) return
      obj.loading = true
      const bool = obj.openStatus
      const params = {
        openStatus: !bool ? 1 : 0
      }
      if (first) {
        params.firstLevelType = first
      }
      if (second) {
        params.secondLevelType = second
      }
      this.$service(CommonApi.switchUpdate, {
        method: 'post',
        data: params
      }).then(res => {
        if (res.code === 200) {
          obj.openStatus = !bool
          this.$message.success('更新成功')
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      }).finally(() => {
        obj.loading = false
      })
    },
    getObj (type) {
      let obj = null
      let first = null
      let second = null
      switch (type) {
        case 'polling':
          obj = this.pollingStatus
          first = 'PUSH_ACCESS'
          second = 'polling'
          break
        case 'chat':
          obj = this.chatStatus
          first = 'CHAT'
          break
        case 'socket':
          obj = this.socketStatus
          first = 'PUSH_ACCESS'
          break
        case 'im':
          obj = this.socketIMStatus
          first = 'PUSH_ACCESS'
          second = 'vip_key'
          break
        case 'zc':
          obj = this.ZCCBAStatus
          first = 'LEAGUE_MATCH_CMS_DOC'
          break
      }
      return {
        obj: obj,
        first: first,
        second: second
      }
    }
  }
}
</script>
