<template>
  <div class="order-iphone-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs v-model="activeTab"
      @tab-click="handleClickTabs">
      <el-tab-pane label="红彩"
        name='0'></el-tab-pane>
      <el-tab-pane label="精准比分"
        name='1'></el-tab-pane>
    </el-tabs>
    <el-form :inline="true"
      :model="filterQuery"
      size="mini"
      ref="filterForm"
      :disabled="loading">
      <el-form-item label="掉单源"
        prop="orderFrom">
        <el-select clearable
          v-model="filterQuery.orderFrom"
          style="width:120px">
          <el-option label="自动发现"
            value="0"></el-option>
          <el-option label="冻结"
            value="1"></el-option>
          <el-option label="人工录入"
            value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态"
        prop="status">
        <el-select clearable
          v-model="filterQuery.status"
          style="width:120px">
          <el-option label="待确认"
            value="1"></el-option>
          <el-option label="线上确认成功"
            value="2"></el-option>
          <el-option label="冻结"
            value="3"></el-option>
          <el-option label="线下确认成功"
            value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-button size="mini"
        type="primary"
        @click="filterList()">筛选</el-button>
    </el-form>
    <el-table ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      style="width: 100%"
      @sort-change="sortList"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="appleOrderId"
        label="掉单ID"
        width="80">
      </el-table-column>
      <el-table-column prop="tradeId"
        label="交易ID"
        min-width="170">
      </el-table-column>
      <el-table-column prop="createTime"
        label="创建时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="account"
        label="掉单账号"
        min-width="180">
      </el-table-column>
      <el-table-column prop="userId"
        label="用户ID"
        width="80">
      </el-table-column>
      <el-table-column prop="iapSign"
        label="验签指纹"
        min-width="120">
      </el-table-column>
      <el-table-column prop="orderFrom"
        label="掉单源"
        width="100">
        <template slot-scope="scope">
          {{orderLosingFrom[scope.row.orderFrom] || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="orderTypeId"
        label="订单类型"
        width="100">
        <template slot-scope="scope">
          {{orderLosingTypeId[scope.row.orderTypeId] || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime"
        label="更新时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="successTime"
        label="处理成功时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="status"
        label="处理状态"
        width="110">
        <template slot-scope="scope">
          {{statusDict[scope.row.status] || '-'}}
        </template>
      </el-table-column>
      <el-table-column label="操作"
        width="110">
        <template slot-scope="scope">
          <span v-if="scope.row.status===2 || scope.row.status===4">{{scope.row.loginName || '-'}}</span>
          <el-popover placement="left"
            width="260"
            v-if="scope.row.status===1 || scope.row.status===3"
            v-model="scope.row.bindPop">
            <p>交易ID：{{scope.row.tradeId}}</p>
            <p>状态：{{statusDict[scope.row.status] || '-'}}</p>
            <div style="text-align: right; margin-top: 10px">
              <el-button size="mini"
                type="text"
                @click="scope.row.bindPop=false">取消</el-button>
              <el-button type="primary"
                size="small"
                slot="reference"
                @click="confirm(scope.row)">{{scope.row.status===1?'线上确认':'线下确认'}}</el-button>
            </div>
            <el-button type="primary"
              size="small"
              slot="reference">
              {{scope.row.status===1?'线上确认':'线下确认'}}
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
      layout="prev, pager, next"
      @current-change="getList"
      page-size="pageSize"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { iphoneLosing } from '../../../util/api'
import { deleteObjEmpty } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'OrderIphone',
  data () {
    return {
      list: [],
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      tableHeight: null,
      activeTab: '0',
      loading: false,
      orderLosingFrom: {
        '0': '自动发现',
        '1': '冻结',
        '2': '人工录入'
      },
      orderLosingTypeId: {
        1: '红豆充值',
        2: '现金订阅'
      },
      statusDict: {
        '1': '待确认',
        '2': '线上确认成功',
        '3': '冻结',
        '4': '线下确认成功'
      },
      filterQuery: {
        orderFrom: '',
        status: ''
      },
      pickerOptions0: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (pageIndex = this.pageIndex) {
      if (this.loading) return
      this.loading = true
      let data = {
        pageIndex: pageIndex,
        pageSize: this.pageSize
      }
      this.$service(iphoneLosing[this.activeTab].rechargeList, {
        method: 'get',
        params: Object.assign({}, data, this.filter)
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.records || []
            this.pageCount = res.data.page.pageCount
            this.pageIndex = res.data.page.pageIndex
          } else {
            this.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.list = []
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    handleClickTabs () {
      this.$refs['filterForm'].resetFields()
      this.filter = {}
      this.getList(1)
    },
    filterList () {
      this.filter = deleteObjEmpty(Object.assign({}, this.filterQuery))
      this.getList(1)
    },
    // 线上\线下确认
    confirm (data) {
      let url
      if (data.status === 1) url = iphoneLosing[this.activeTab].confirmLosingOrder
      if (data.status === 3) url = iphoneLosing[this.activeTab].offlineConfirmOrder
      this.$service(url, {
        method: 'get',
        urlParams: {
          appleOrderId: data.appleOrderId
        }
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.getList(1)
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
