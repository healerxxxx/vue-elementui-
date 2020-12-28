<template>
  <div class="order-recharge-list">
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
      <el-form-item label=""
        prop="filterType">
        <el-select clearable
          v-model="filterQuery.filterType"
          style="width:105px"
          @clear="filterQuery.filterTypeName=''">
          <el-option label="订单ID"
            value="orderId"></el-option>
          <el-option label="用户通行证"
            value="account"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label=""
        prop="filterTypeName">
        <el-input v-model="filterQuery.filterTypeName"
          placeholder="请输入订单ID/用户通行证"
          :disabled="!filterQuery.filterType"></el-input>
      </el-form-item>
      <el-form-item label="状态"
        prop="orderStatus">
        <el-select clearable
          v-model="filterQuery.orderStatus"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in rechargeOrderStatus"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端"
        prop="payTerminal">
        <el-select clearable
          v-model="filterQuery.payTerminal"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in payTerminal"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="渠道"
        prop="channelId">
        <el-select clearable
          v-model="filterQuery.channelId"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in payChannel"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="类型"
        prop="orderTypeId">
        <el-select clearable
          v-model="filterQuery.orderTypeId"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in orderType"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间"
        prop="date">
        <el-date-picker v-model="filterQuery.date"
          value-format="yyyy-MM-dd"
          type="daterange"
          :editable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions0"
          size="small">
        </el-date-picker>
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
      <el-table-column
        prop="orderId"
        label="订单ID"
        min-width="170">
        <template slot-scope="scope">
          <router-link :to="{ name: 'OrderRechargeDetail', params: { id: scope.row.orderId, source: activeTab}}">{{scope.row.orderId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="orderStatus"
        label="订单状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.orderStatus | rechargeOrder2CH}}
        </template>
      </el-table-column>
      <el-table-column
        label="订单创建时间"
        width="155">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        label="订单成功时间"
        width="155">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="account"
        label="用户通行证"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="buyCount"
        label="购买数量"
        width="80">
      </el-table-column>
      <el-table-column
        prop="orderPrice"
        label="订单价格(元)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="payTerminal"
        label="支付终端"
        width="90">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, activeTab] | payTerminal2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="channelName"
        label="支付通道"
        width="100">
        <template slot-scope="scope">
          {{scope.row.channelName ||'-'}}
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
import { RechargeOrder } from '../../../../util/api'
import baseType from '../../../../util/base'
import { deleteObjEmpty } from '../../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'OrderRechargeList',
  data () {
    return {
      list: [],
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      tableHeight: null,
      activeTab: '0',
      loading: false,
      rechargeOrderStatus: baseType.rechargeOrderStatus,
      payChannel: baseType.payChannel,
      orderType: baseType.orderType,
      filterQuery: {
        orderStatus: '',
        payTerminal: '',
        channelId: '',
        orderTypeId: '',
        filterType: '',
        filterTypeName: '',
        date: []
      },
      pickerOptions0: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    payTerminal () {
      return baseType.payTerminal[this.activeTab]
    }
  },
  created () {
    console.log('recharge')
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (pageIndex) {
      this.pageIndex = pageIndex || 1
      if (this.loading) return
      this.loading = true
      let data = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }
      this.$service(RechargeOrder[this.activeTab].rechargeList, {
        method: 'post',
        data: Object.assign({}, data, this.filter)
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
      this.filter = {}
      this.$refs['filterForm'].resetFields()
      this.getList(1)
    },
    filterList () {
      let filter = deleteObjEmpty(Object.assign({}, this.filterQuery))
      if (!filter.filterTypeName) {
        delete filter.filterType
      } else {
        filter[filter.filterType] = filter.filterTypeName
        delete filter.filterTypeName
        delete filter.filterType
      }
      if (filter.date && filter.date.length) {
        filter.startTime = filter.date[0] + ' 00:00:00'
        filter.endTime = filter.date[1] + ' 23:59:59'
        delete filter.date
      }
      this.filter = filter
      this.getList(1)
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
