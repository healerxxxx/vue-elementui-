<template>
  <div class="developer-log">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <span
          v-if="chatStatusInfo !== null"
          style="margin-right: 10px;">
          <b>聊天室：</b>{{chatStatusInfo.openStatus ? '上线' : '下线'}}
        </span>
        <el-popover
          v-if="chatStatusInfo !== null"
          placement="left"
          v-model="chatStatusPop">
          <p>确定{{!chatStatusInfo.openStatus ? '上线' : '下线'}}聊天室？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="chatStatusPop=false">取消</el-button>
            <el-button type="primary" size="mini" :loading="chatStatusLoading" @click="switchChatStatus">确定</el-button>
          </div>
          <el-button slot="reference" type="primary" size="mini">{{!chatStatusInfo.openStatus ? '上线' : '下线'}}</el-button>
        </el-popover>
        <span
          v-if="socketStatusInfo !== null"
          style="margin-right: 10px;">
          <b>socket推送：</b>{{socketStatusInfo.openStatus ? '上线' : '下线'}}
        </span>
        <el-popover
          v-if="socketStatusInfo !== null"
          placement="left"
          v-model="socketStatusPop">
          <p>确定{{!socketStatusInfo.openStatus ? '上线' : '下线'}}推送？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="socketStatusPop=false">取消</el-button>
            <el-button type="primary" size="mini" :loading="socketStatusLoading" @click="switchSocketStatus">确定</el-button>
          </div>
          <el-button slot="reference" type="primary" size="mini">{{!socketStatusInfo.openStatus ? '上线' : '下线'}}</el-button>
        </el-popover>
        <el-select
          size="mini"
          style="width: 120px;"
          v-model="sidByAccessId">
          <el-option
            label="请选择实例"
            :value="-1">
          </el-option>
          <el-option
            v-for="item in accessList"
            :label="`实例${item.accessId}`"
            :value="item.accessId"
            :key="item.accessId">
          </el-option>
        </el-select>
        <el-input
          placeholder="请输入SID"
          clearable
          v-model="sidTemp"
          size="mini"
          style="width:auto;">
        </el-input>
        <el-button-group>
          <el-button type="primary" size="mini" icon="el-icon-search" @click="sidSearch()"></el-button>
          <el-button type="primary" size="mini" icon="el-icon-delete" @click="sidDel()"></el-button>
        </el-button-group>
      </div>
    </div>
    <el-tabs tab-position="left">
      <el-tab-pane
        v-for="(item, index) in accessList"
        :key="index">
        <span slot="label">{{`实例${item.accessId} - ${item.accessOpen ? '开' : '关'}`}}</span>
        <el-form :inline="true" size="mini">
          <el-form-item label="地址:">
            <span>{{item.serverAddr}}</span>
          </el-form-item>
          <el-form-item label="总链接数:">
            <span>{{item.status && item.status.instanceConnCount}}</span>
          </el-form-item>
        </el-form>
        <table class="ws-msg-count-table" v-if="item.dispatchCount && item.pubCount">
          <thead>
            <tr>
              <th rowspan="2">类型</th><th rowspan="2">总数</th><th colspan="4">吞吐量(个)</th>
            </tr>
            <tr>
              <th>1分钟</th><th>5分钟</th><th>15分钟</th><th>平均</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="item.dispatchCount">
              <td>消息下发</td>
              <td>{{item.dispatchCount.count}}</td>
              <td>{{item.dispatchCount.oneMinuteRate}}</td>
              <td>{{item.dispatchCount.fiveMinuteRate}}</td>
              <td>{{item.dispatchCount.fifteenMinuteRate}}</td>
              <td>{{item.dispatchCount.meanRate}}</td>
            </tr>
            <tr v-if="item.pubCount">
              <td>消息新增</td>
              <td>{{item.pubCount.count}}</td>
              <td>{{item.pubCount.oneMinuteRate}}</td>
              <td>{{item.pubCount.fiveMinuteRate}}</td>
              <td>{{item.pubCount.fifteenMinuteRate}}</td>
              <td>{{item.pubCount.meanRate}}</td>
            </tr>
          </tbody>
        </table>
        <el-row gutter="8" v-if="item.status && item.status.mqStatusInfoVoList">
          <el-col span="12" :sm="{span: 12}" :lg="{span: 8}" :xl=" {span: 6}"
            v-for="(_item, _index) in item.status.mqStatusInfoVoList"
            :key="_index"
            style="margin-bottom: 10px;">
            <el-card shadow="never" :body-style="{ padding: '8px', fontSize: '12px' }">
              <el-row style="margin-bottom: 10px;">
                <el-col :span="10"><b class="text-red" style="font-size: 14px;">{{_item.mqName}}</b></el-col>
                <el-col :span="14">总订阅数: {{_item.allConnCount}}、Channel数: {{_item.channelCount}}</el-col>
              </el-row>
              <el-table
                size="mini"
                :data="_item.channelList"
                height="300">
                <el-table-column
                  prop="channelName"
                  label="channelName">
                </el-table-column>
                <el-table-column
                  prop="subCount"
                  label="订阅数"
                  width="100"
                  sortable>
                </el-table-column>
                <el-table-column
                  width="60"
                  label="操作">
                  <template slot-scope="scope">
                    <el-button
                      slot="reference"
                      @click="delChannel(_item.channelList, scope.row, item.accessId)"
                      type="text"
                      size="mini">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="SID搜索" :visible.sync="dialogSid" width="500px" center>
      <el-form label-width="100px" size="small" v-if="sidForm">
        <el-form-item label="SID:">
          <span>{{sidForm.clientId}}</span>
        </el-form-item>
        <el-form-item label="地址:">
          <span>{{sidForm.clientAddress}}</span>
        </el-form-item>
        <el-form-item
          v-for="(value, key) in sidForm.subMqInfo"
          :key="key"
          :label="`${key}:`">
          <span v-for="(item, index) in value" :key="item">{{index === 0 ? '' : '、'}}{{item}}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { DeveloperWSMonitoring, Chat, SocketStatus } from '../../../util/api'
export default {
  name: 'DeveloperWSMonitoringJZBF',
  data () {
    return {
      loading: false,
      accessList: [],
      sidByAccessId: -1,
      sidTemp: '',
      sidLoading: false,
      timer: null,
      sidForm: {},
      dialogSid: false,
      chatStatusInfo: null,
      chatStatusLoading: false,
      chatStatusPop: false,
      socketStatusInfo: null,
      socketStatusLoading: false,
      socketStatusPop: false,
      timerNum: -1
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.init()
    })
  },
  beforeRouteLeave (to, from, next) {
    clearInterval(this.timer)
    next()
  },
  methods: {
    init () {
      this.timerNum = -1
      this.getChatStatus()
      this.getSocketStatus()
      this.getAccessList()
      clearInterval(this.timer)
      this.timer = setInterval(this.getAccessList, 20 * 1000)
    },
    getAccessList () {
      this.timerNum++
      this.$service(DeveloperWSMonitoring[1].accessList).then(res => {
        if (res.code === 200 && res.data.length > 0) {
          const _data = JSON.parse(JSON.stringify(this.accessList))
          this.accessList = res.data
          this.accessList.forEach((item, index) => {
            this.$set(item, 'status', _data[index] && _data[index].status ? _data[index].status : {})
            this.$set(item, 'dispatchCount', _data[index] && _data[index].dispatchCount ? _data[index].dispatchCount : {})
            this.$set(item, 'pubCount', _data[index] && _data[index].pubCount ? _data[index].pubCount : {})
            this.getStatusByAccessId(item)
            this.getMsgDispatchCount(item)
            this.getMsgPubCount(item)
          })
        }
      })
    },
    getStatusByAccessId (data) {
      this.$service(DeveloperWSMonitoring[1].statusByAccessId, {
        urlParams: {
          accessId: data.accessId
        }
      }).then(res => {
        if (res.code === 200) {
          const _data = JSON.parse(JSON.stringify(data.status))
          this.$set(data, 'status', res.data)
          data.status.mqStatusInfoVoList.forEach((item, index) => {
            this.$set(item, 'channelList', _data.mqStatusInfoVoList && _data.mqStatusInfoVoList[index] && _data.mqStatusInfoVoList[index].channelList ? _data.mqStatusInfoVoList[index].channelList : [])
            if (this.timerNum % 5 === 0) this.getChannelList(item, data.accessId)
          })
        }
      })
    },
    getChannelList (data, id) {
      this.$service(DeveloperWSMonitoring[1].channelListByAccessId, {
        urlParams: {
          accessId: id
        },
        params: {
          mqName: data.mqName
        }
      }).then(res => {
        if (res.code === 200) {
          this.$set(data, 'channelList', res.data)
        }
      })
    },
    delChannel (list, data, id) {
      this.$confirm(`确定删除channel-${data.channelName}？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        if (data.loading) return
        this.$set(data, 'loading', true)
        this.$service(DeveloperWSMonitoring[1].channelDelByAccessId, {
          urlParams: {
            accessId: id
          },
          params: {
            channelName: data.channelName
          }
        }).then(res => {
          if (res.code === 200) {
            data.delPop = false
            this.$message.success('Channel删除成功')
            list.splice(list.indexOf(data), 1)
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
          data.loading = false
        }).catch(err => {
          if (err) {
            data.loading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    sidSearch () {
      if (this.sidByAccessId < 0) return this.$message.error('请选择sid对应的实例')
      if (!this.sidTemp) return this.$message.error('请输入sid')
      if (this.sidLoading) return
      this.sidLoading = true
      this.$service(DeveloperWSMonitoring[1].clientQueryById, {
        urlParams: {
          accessId: this.sidByAccessId
        },
        params: {
          clientId: this.sidTemp
        }
      }).then(res => {
        if (res.code === 200) {
          if (res.data.clientId) {
            this.sidForm = res.data
            this.dialogSid = true
          } else {
            this.$message.warning('找不到服务对应的SID.')
          }
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.sidLoading = false
      }).catch(err => {
        if (err) {
          this.sidLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    sidDel () {
      if (this.sidByAccessId < 0) return this.$message.error('请选择sid对应的实例')
      if (!this.sidTemp) return this.$message.error('请输入sid')
      this.$confirm(`确定删除sid-${this.sidTemp}？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        if (this.sidLoading) return
        this.sidLoading = true
        this.$service(DeveloperWSMonitoring[1].clientDelById, {
          urlParams: {
            accessId: this.sidByAccessId
          },
          params: {
            clientId: this.sidTemp
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('SID删除成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
          this.sidLoading = false
        }).catch(err => {
          if (err) {
            this.sidLoading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    getMsgDispatchCount (data) {
      this.$service(DeveloperWSMonitoring[1].msgDispatch, {
        urlParams: {
          accessId: data.accessId
        }
      }).then(res => {
        if (res.code === 200) {
          this.$set(data, 'dispatchCount', res.data)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getMsgPubCount (data) {
      this.$service(DeveloperWSMonitoring[1].msgPub, {
        urlParams: {
          accessId: data.accessId
        }
      }).then(res => {
        if (res.code === 200) {
          this.$set(data, 'pubCount', res.data)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getChatStatus () {
      this.$service(Chat[1].status).then(res => {
        if (res.code === 200) {
          this.chatStatusInfo = {
            openStatus: !res.data || (res.data && typeof res.data.openStatus === 'undefined') ? false : res.data.openStatus
          }
        }
      })
    },
    switchChatStatus () {
      if (this.chatStatusLoading) return
      this.chatStatusLoading = true
      const bool = this.chatStatusInfo.openStatus
      this.$service(Chat[1].updateStatus, {
        method: 'post',
        data: {
          openStatus: !bool ? 1 : 0
        }
      }).then(res => {
        this.chatStatusLoading = false
        if (res.code === 200) {
          this.chatStatusPop = false
          this.chatStatusInfo.openStatus = !bool
          this.$message.success('更新状态成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.chatStatusLoading = false
        err && this.$message.error(JSON.stringify(err))
      })
    },
    getSocketStatus () {
      this.$service(SocketStatus[1].get).then(res => {
        if (res.code === 200) {
          this.socketStatusInfo = {
            openStatus: !res.data || (res.data && typeof res.data.openStatus === 'undefined') ? false : res.data.openStatus
          }
        }
      })
    },
    switchSocketStatus () {
      if (this.socketStatusLoading) return
      this.socketStatusLoading = true
      const bool = this.socketStatusInfo.openStatus
      this.$service(SocketStatus[1].update, {
        method: 'post',
        data: {
          openStatus: !bool ? 1 : 0
        }
      }).then(res => {
        this.socketStatusLoading = false
        if (res.code === 200) {
          this.socketStatusPop = false
          this.socketStatusInfo.openStatus = !bool
          this.$message.success('更新状态成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.socketStatusLoading = false
        err && this.$message.error(JSON.stringify(err))
      })
    }
  }
}
</script>

<style lang="scss">
.ws-msg-count-table {
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  margin-bottom: 10px;
  tr {
    td, th {
      padding: 5px 10px;
      border: 1px solid #ebeef5;
      vertical-align: middle;
      text-align: center;
    }
    th {
      background: #fafafa;
      font-weight: bold;
    }
  }
}
</style>
