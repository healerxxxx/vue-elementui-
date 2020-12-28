<template>
  <div class="invitation">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <span v-if="statusInfo"><b>活动状态：</b>{{statusInfo.openStatus ? '上线' : '下线'}}</span>
        <el-button type="danger" size="mini" @click="switchStatus">更新状态</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="点卡发放列表" name="0"></el-tab-pane>
      <el-tab-pane label="预警用户列表" name="1"></el-tab-pane>
    </el-tabs>
    <!-- 点卡发放列表 -->
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading" v-show="activeTab==='0'">
      <el-form-item>
        <el-date-picker
          v-model="filter.startTime"
          type="date"
          editable="false"
          width="100"
          placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="filter.endTime"
          type="date"
          editable="false"
          placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="getList()">查询</el-button>
      </el-form-item>
      <el-form-item v-if="totalInfo.totalCards"><b>发放点卡总数：</b>{{totalInfo.totalCards}}；</el-form-item>
      <el-form-item v-if="totalInfo.totalCardCost"><b>点卡总成本：</b>{{totalInfo.totalCardCost}}；</el-form-item>
      <el-form-item v-if="totalInfo.totalActivateCards"><b>点卡激活总数：</b>{{totalInfo.totalActivateCards}}；</el-form-item>
      <el-form-item v-if="totalInfo.totalRegisters"><b>邀请码注册总人数：</b>{{totalInfo.totalRegisters}}</el-form-item>
    </el-form>
    <el-table
      v-show="activeTab==='0'"
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="sharePullNewLogId"
        label="ID"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="hostUserId"
        label="用户ID"
        min-width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.hostUserId, source: 0}}">{{scope.row.hostUserId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="hostAccount"
        label="用户账号"
        min-width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.hostUserId, source: 0}}">{{scope.row.hostAccount}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="newUserId"
        label="被邀请下单用户ID"
        min-width="130">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.newUserId, source: 0}}">{{scope.row.newUserId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="cardPoints"
        label="点卡"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.cardPoints > 0 ? scope.row.cardPoints + '点周卡' : ''}}
        </template>
      </el-table-column>
      <el-table-column
        label="点卡状态"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.cardPoints > 0 ? (scope.row.cardStatus === 1 ? '已激活' : '已发放未激活') : ''}}
        </template>
      </el-table-column>
      <el-table-column
        prop="pullFinishTime"
        label="发放时间"
        min-width="160">
        <template slot-scope="scope">
          {{[scope.row.pullFinishTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="hostUserStatus"
        label="用户状态"
        min-width="80">
      </el-table-column>
    </el-table>
    <el-pagination
      v-show="activeTab==='0'"
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <!-- 预警用户列表 -->
    <el-form :inline="true" :model="warningFilter" size="mini" :disabled="warningLoading" v-show="activeTab==='1'">
      <el-form-item>
        <el-date-picker
          v-model="warningFilter.startTime"
          type="date"
          editable="false"
          width="100"
          placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(warningFilter.endTime).getTime() !== 0 && time.getTime() > new Date(warningFilter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="warningFilter.endTime"
          type="date"
          editable="false"
          placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(warningFilter.startTime).getTime() !== 0 && time.getTime() < new Date(warningFilter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="getWarningList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-show="activeTab==='1'"
      ref="warningElTable"
      :data="warningList"
      v-loading="warningLoading"
      stripe
      :max-height="warningTableHeight<400?400:warningTableHeight">
      <el-table-column
        prop="sharePullHostUserStId"
        label="ID"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="userId"
        label="用户ID"
        min-width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.userId, source: 0}}">{{scope.row.userId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="account"
        label="用户账号"
        min-width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.userId, source: 0}}">{{scope.row.account}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="totalCards"
        label="已发放点卡数量(张)"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="totalActivateCards"
        label="已激活点卡数量"
        min-width="120">
      </el-table-column>
    </el-table>
    <el-pagination
      v-show="activeTab==='1'"
      background
      layout="prev, pager, next"
      @current-change="getWarningList"
      :current-page.sync="warningPageIndex"
      :page-count="warningPageCount"
      class="page-bar-reset">
    </el-pagination>
    <!-- 修改活动状态 -->
    <el-dialog title="修改活动状态" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="400px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="mini" ref="form">
        <el-form-item label="状态">
          <el-radio v-model="form.openStatus" :label="true">上线</el-radio>
          <el-radio v-model="form.openStatus" :label="false">下线</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ActivityInvitation } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'invitation',
  data () {
    return {
      statusInfo: {
        openStatus: true
      },
      form: {},
      dialogFormVisible: false,
      updateLoading: false,
      activeTab: '0',
      filter: {},
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      totalInfo: {},
      warningFilter: {},
      warningList: [],
      warningPageIndex: 1,
      warningPageSize: 25,
      warningPageCount: 1,
      warningLoading: false,
      warningTableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getSwitchStatus()
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        if (this.activeTab === '0') {
          this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
        }
        if (this.activeTab === '1') {
          this.tableHeight = this.windowHeight - this.$refs.warningElTable.$el.offsetTop - 63
        }
      })
    },
    handleClickTabs () {
      if (this.activeTab === '0') {
        if (this.list.length === 0) {
          this.getList()
        }
      }
      if (this.activeTab === '1') {
        if (this.warningList.length === 0) {
          this.getWarningList()
        }
      }
      this.setHeight()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      let _data = {}
      if (this.filter.startTime) {
        _data['startTime'] = this.filter.startTime
      }
      if (this.filter.endTime) {
        _data['endTime'] = this.filter.endTime
      }
      this.pageIndex = page || 1
      this.$service(ActivityInvitation.list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.resultPage.records || []
          this.pageCount = res.data.resultPage.page && res.data.resultPage.page.pageCount ? res.data.resultPage.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.totalInfo = res.data.sharePullHostUserStTotalVo || {}
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        err && (this.loading = false) && this.$message.error(JSON.stringify(err))
      })
    },
    getWarningList (page) {
      if (this.warningLoading) return
      this.warningLoading = true
      let _data = {}
      if (this.warningFilter.startTime) {
        _data['startTime'] = this.warningFilter.startTime
      }
      if (this.warningFilter.endTime) {
        _data['endTime'] = this.warningFilter.endTime
      }
      this.warningPageIndex = page || 1
      this.$service(ActivityInvitation.warningList, {
        urlParams: {
          pageIndex: this.warningPageIndex,
          pageSize: this.warningPageSize
        },
        params: _data
      }).then(res => {
        this.warningLoading = false
        if (res.code === 200) {
          this.warningList = res.data.records || []
          this.warningPageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.warningElTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        err && (this.warningLoading = false) && this.$message.error(JSON.stringify(err))
      })
    },
    getSwitchStatus () {
      this.$service(ActivityInvitation.status).then(res => {
        if (res.code === 200) {
          this.statusInfo = {
            openStatus: res.data.openStatus
          }
        }
      })
    },
    switchStatus () {
      this.form = Object.assign({}, this.statusInfo)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(ActivityInvitation.statusUpdate, {
            method: 'post',
            data: {
              openStatus: this.form.openStatus ? 1 : 0
            }
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getSwitchStatus()
              this.$message.success('更新状态成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            err && this.$message.error(JSON.stringify(err))
          })
        }
      })
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
