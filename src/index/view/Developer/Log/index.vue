<template>
  <div class="developer-log">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item label="类型">
        <el-select v-model="filterQuery.type" style="width:105px">
          <el-option label="支付" value="1">支付</el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="filterQuery.userId" clearable placeholder="用户ID"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getLogList">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="clientLogId"
        label="LogId"
        width="100">
      </el-table-column>
      <el-table-column
        prop="userId"
        label="用户ID"
        width="120">
      </el-table-column>
      <el-table-column
        prop="ip"
        label="用户IP"
        width="130">
      </el-table-column>
      <el-table-column
        prop="operateTime"
        label="操作时间"
        width="160">
      </el-table-column>
      <el-table-column
        prop="logContent"
        label="日志内容"
        min-width="200">
      </el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        width="100">
        <template slot-scope="scope">
          {{scope.row.type==1?'支付':'--'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneInfo"
        label="手机型号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="operateSystem"
        label="系统版本"
        width="120">
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getLogList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { DeveloperLog } from '../../../util/api'
import { isNumber } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'DeveloperLog',
  data () {
    return {
      filterQuery: {
        type: '1',
        userId: ''
      },
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getLogList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getLogList (pageIndex) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = isNumber(pageIndex) ? pageIndex : 1
      let _data = {}
      if (this.filterQuery.type) {
        _data['type'] = this.filterQuery.type
      }
      if (this.filterQuery.userId) {
        _data['userId'] = this.filterQuery.userId
      }
      this.$service(DeveloperLog.logList, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
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
