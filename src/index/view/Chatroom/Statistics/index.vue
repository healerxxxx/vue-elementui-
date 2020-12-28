<template>
  <div class="chatroom-statistics">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-dropdown @command="handleAppTabCommand">
          <el-button size="mini" type="primary">
            切换 - {{{0: '红彩', 1: '精准比分'}[appTab]}} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0">红彩</el-dropdown-item>
            <el-dropdown-item command="1">精准比分</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="聊天室人数统计" name="user">
        <el-form :inline="true" size="mini">
          <el-form-item label="选择日期">
            <el-date-picker
              v-model="userFilterDate"
              :clearable="false"
              editable="false"
              type="date"
              style="width:130px;"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              @change="getUserStatistics">
            </el-date-picker>
            <el-button type="primary" :disabled="userLoading" @click="userExport">导出</el-button>
          </el-form-item>
        </el-form>
        <div class="chatroom-statistics--content" v-loading="userLoading">
          <div
            class="chatroom-statistics--num"
            v-if="Object.keys(userRenderStatistics).length > 0">
            <li>
              <b>{{userRenderStatistics.dayMatchCount || '-'}}（{{userRenderStatistics.dayChatRoomCount || '-'}}）</b>
              <br>
              <span>当日比赛数(聊天室数)</span>
            </li>
            <li>
              <b>{{userRenderStatistics.dayRoomDeviceCount || '-'}}</b>
              <br>
              <span>当日聊天室总用户数</span>
            </li>
            <li>
              <b>{{userRenderStatistics.dayConcurrentDeviceTotalMax || '-'}}</b>
              <br>
              <span>当日聊天室最高并发用户数</span>
            </li>
            <li>
              <b>{{userRenderStatistics.dayUserTotalCount || '-'}}</b>
              <br>
              <span>当日发言总人数</span>
            </li>
            <li>
              <b>{{userRenderStatistics.dayMsgTotalCount || '-'}}</b>
              <br>
              <span>当日发言总条数</span>
            </li>
            <li>
              <b>{{userRenderStatistics.dayVipUserTotalCount || '-'}}</b>
              <br>
              <span>当日聊天室总VIP用户数</span>
            </li>
            <li>
              <b>{{userRenderStatistics.dayVipChatUserTotalCount || '-'}}</b>
              <br>
              <span>当日VIP发言人数</span>
            </li>
          </div>
          <div
            class="chatroom-statistics--list"
            v-for="(item, index) in userList"
            :key="index">
            <div class="title">{{item.title}}（{{item.unit}}）</div>
            <el-table
              ref="elTable"
              :data="item.list"
              stripe>
              <el-table-column
                prop="matchInfo"
                label="赛事ID"
                min-width="160">
              </el-table-column>
              <el-table-column
                prop="matchName"
                label="比赛对阵"
                min-width="180">
              </el-table-column>
              <el-table-column
                prop="matchStartTime"
                label="开赛时间"
                min-width="100">
              </el-table-column>
              <el-table-column
                prop="dataInfo"
                label="统计数据"
                min-width="80">
              </el-table-column>
              <el-table-column
                v-if="item.key === 'dayChatUserCountTop10'"
                prop="vipUser"
                label="VIP人数"
                min-width="80">
              </el-table-column>
            </el-table>
          </div>
          <div
            v-if="!userLoading && Object.keys(userRenderStatistics).length === 0"
            class="chatroom-statistics--empty">
            <span>暂无数据~</span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="用户投票统计" name="vote" v-if="appTab.toString() === '0'">
        <el-form :inline="true" size="mini">
          <el-form-item label="选择日期">
            <el-date-picker
              v-model="voteFilterStartTime"
              type="date"
              editable="false"
              placeholder="开始日期"
              value-format="yyyy-MM-dd 00:00:00"
              style="width:135px"
              :picker-options="{disabledDate(time) {
                return new Date(voteFilterEndTime).getTime() !== 0 && time.getTime() > new Date(voteFilterEndTime).getTime()
              }}">
            </el-date-picker>
            ~
            <el-date-picker
              v-model="voteFilterEndTime"
              type="date"
              editable="false"
              placeholder="结束日期"
              value-format="yyyy-MM-dd 23:59:59"
              style="width:135px"
              :picker-options="{disabledDate(time) {
                return new Date(voteFilterStartTime).getTime() !== 0 && time.getTime() < new Date(voteFilterStartTime).getTime()
              }}">
            </el-date-picker>
            <el-button type="primary" @click="getVoteStatistics">确定</el-button>
          </el-form-item>
        </el-form>
        <div class="chatroom-statistics--content" v-loading="voteLoading">
          <div
            class="chatroom-statistics--num"
            v-if="Object.keys(voteRenderStatistics).length > 0">
            <li>
              <b>{{voteRenderStatistics.voteNum >= 0 ? voteRenderStatistics.voteNum : '-'}}</b>
              <br>
              <span>投票次数</span>
            </li>
            <li>
              <b>{{voteRenderStatistics.voteHitNum >= 0 ? voteRenderStatistics.voteHitNum : '-'}}</b>
              <br>
              <span>投中次数</span>
            </li>
            <li>
              <b>{{voteRenderStatistics.userNum >= 0 ? voteRenderStatistics.userNum : '-'}}</b>
              <br>
              <span>参与投票人数</span>
            </li>
          </div>
          <div
            class="chatroom-statistics--list"
            v-if="Object.keys(voteRenderStatistics).length > 0">
            <table class="vote-table" v-if="voteRenderStatistics.chatCountList">
              <thead>
                <tr>
                  <th>聊天等级</th>
                  <th v-for="(item, index) in voteRenderStatistics.chatCountList" :key="index">{{item.voteLevel}}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>人数</td>
                  <td v-for="(item, index) in voteRenderStatistics.chatCountList" :key="index">{{item.userNum}}</td>
                </tr>
              </tbody>
            </table>
            <table class="vote-table" v-if="voteRenderStatistics.voteCountList">
              <thead>
                <tr>
                  <th>投票等级</th>
                  <th v-for="(item, index) in voteRenderStatistics.voteCountList" :key="index">{{item.voteLevel}}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>人数</td>
                  <td v-for="(item, index) in voteRenderStatistics.voteCountList" :key="index">{{item.userNum}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="!voteLoading && Object.keys(voteStatistics).length === 0"
            class="chatroom-statistics--empty">
            <span>暂无数据~</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { formatDate } from '../../../util/tool'
import { ChatroomStatistics } from '../../../util/api'
export default {
  name: 'ChatroomStatistics',
  data () {
    return {
      appTab: 0,
      activeTab: 'user',
      userStatistics: {
        0: {},
        1: {}
      },
      userLoading: false,
      userFilterDate: formatDate(new Date(new Date() - 1000 * 60 * 60 * 24), 'yyyy-MM-dd'),
      voteStatistics: {
        0: {},
        1: {}
      },
      voteLoading: false,
      voteFilterStartTime: '',
      voteFilterEndTime: ''
    }
  },
  computed: {
    ChatroomStatisticsApi () {
      return ChatroomStatistics[this.appTab]
    },
    userList () {
      const _s = this.userStatistics[this.appTab]
      if (Object.keys(_s).length > 0) {
        const propertyList = ['dayRoomDeviceMaxTop10', 'dayRoomDeviceMinTop10', 'dayChatUserCountTop10', 'dayChatMsgCountTop10', 'dayConcurrentDeviceTop10']
        const listTemp = []
        propertyList.map(item => {
          const data = (_s[item] && _s[item][0]) || {}
          listTemp.push({
            title: data.title || '',
            unit: data.unit || '',
            key: item,
            list: data.chatDataCardElementDtoList || []
          })
        })
        return listTemp
      }
      return []
    },
    userRenderStatistics () {
      return this.userStatistics[this.appTab]
    },
    voteRenderStatistics () {
      return this.voteStatistics[this.appTab]
    }
  },
  created () {
    this.handleClickTabs()
  },
  methods: {
    handleAppTabCommand (val) {
      if (this.appTab.toString() !== val.toString()) {
        this.appTab = val
        if (this.appTab.toString() === '1' && this.activeTab !== 'user') {
          this.activeTab = 'user'
        }
        this.handleClickTabs()
      }
    },
    handleClickTabs () {
      switch (this.activeTab) {
        case 'user':
        default:
          if (Object.keys(this.userRenderStatistics).length === 0) {
            this.getUserStatistics()
          }
          break
        case 'vote':
          if (Object.keys(this.voteRenderStatistics).length === 0) {
            this.getVoteStatistics()
          }
          break
      }
    },
    userExport () {
      if (Object.keys(this.userRenderStatistics).length === 0) {
        return this.$message('暂无相关数据')
      }
      window.open(location.origin + this.ChatroomStatisticsApi.user.export + '?date=' + this.userFilterDate)
    },
    getUserStatistics () {
      if (this.userLoading) return
      this.userLoading = true
      this.$service(this.ChatroomStatisticsApi.user.get, {
        params: {
          dateStr: this.userFilterDate
        }
      }).then(res => {
        if (res.code === 200) {
          this.userStatistics[this.appTab] = res.data
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.userLoading = false
      }).catch(err => {
        if (err) {
          this.userLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getVoteStatistics () {
      if (this.voteLoading) return
      this.voteLoading = true
      const params = {}
      if (this.voteFilterStartTime) {
        params['startTime'] = this.voteFilterStartTime
      }
      if (this.voteFilterEndTime) {
        params['endTime'] = this.voteFilterEndTime
      }
      this.$service(this.ChatroomStatisticsApi.vote.get, {
        params: params
      }).then(res => {
        if (res.code === 200) {
          this.voteStatistics[this.appTab] = res.data
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.voteLoading = false
      }).catch(err => {
        if (err) {
          this.voteLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    }
  }
}
</script>
<style lang="scss">
.chatroom-statistics {
  &--content {
    min-height: 150px;
  }
  &--num {
    margin-top: 10px;
    li {
      text-align: center;
      display: inline-block;
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
  &--list {
    .title {
      font-size: 18px;
      margin: 20px 0;
    }
    .vote-table {
      width: 100%;
      border: 1px solid #eee;
      th, td {
        border: 1px solid #eee;
        padding: 10px;
        text-align: left;
      }
      th {
        background: #f3f5f7;
      }
    }
    .vote-table + .vote-table {
      margin-top: 20px;
    }
  }
  &--empty {
    text-align: center;
    font-size: 15px;
    line-height: 150px;
    color:#666;
  }
}
</style>
