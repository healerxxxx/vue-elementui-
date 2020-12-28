<template>
  <div class="finance-monthlyOfSp">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="getList()">
      <el-tab-pane label="点数消耗" name='0' :disabled="loading"></el-tab-pane>
      <el-tab-pane label="过期卡记录" name='1' :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-form :inline="true" size="mini" :disabled="loading">
      <el-form-item>
        <el-date-picker
          v-model="filter[activeTab].month"
          type="month"
          :clearable="false"
          style="width:120px;"
          value-format="yyyy-MM"
          @change="getList()"
          :picker-options="{disabledDate: (time) => {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item v-if="activeTab==='0' && total !== null">
        总计：<span>{{total || 0}}点</span>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="orderId"
        label="订单Id"
        min-width="170">
      </el-table-column>
      <el-table-column prop="createTime"
        label="订单创建时间"
        min-width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="successTime"
        label="订单成功时间"
        min-width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="account"
        label="用户通行证"
        min-width="180">
      </el-table-column>
      <el-table-column prop="threadTradeId"
        label="交易ID"
        min-width="120">
      </el-table-column>
      <el-table-column prop="goodsId"
        label="商品ID"
        min-width="130">
      </el-table-column>
      <el-table-column prop="goodsType"
        label="商品类型"
        min-width="100">
      </el-table-column>
      <el-table-column prop="goodsName"
        label="商品名称"
        min-width="180">
      </el-table-column>
      <el-table-column prop="pointCardOrderId"
        label="点卡订单ID"
        min-width="180">
      </el-table-column>
      <el-table-column prop="name"
        label="点卡名称"
        min-width="180">
      </el-table-column>
      <el-table-column prop="discount"
        label="点卡折扣率"
        min-width="90">
        <template slot-scope="scope">
          {{scope.row.discount | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="shareRate"
        label="分成比例"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.shareRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="expertId"
        label="专家ID"
        min-width="100">
      </el-table-column>
      <el-table-column prop="expertEpay"
        label="专家网易宝"
        min-width="100">
      </el-table-column>
      <el-table-column prop="buyCount"
        label="购买数量"
        min-width="80">
      </el-table-column>
      <el-table-column prop="orderPrice"
        label="消耗点数"
        min-width="80">
      </el-table-column>
      <el-table-column prop="payTerminal"
        label="支付终端"
        min-width="80">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, '0'] | payTerminal2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="channelRate"
        label="通道费率"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.channelRate | toPercent}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getPointList"
      page-size="pageSize"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>
<script>
import { financePointConfirmed } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'FinancePointConfirmed',
  data () {
    return {
      activeTab: '0',
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      tableHeight: null,
      filter: {
        0: {
          month: new Date().getFullYear() + '-' + (new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1)
        },
        1: {
          month: new Date().getFullYear() + '-' + (new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1)
        }
      },
      total: null
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
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(financePointConfirmed[this.activeTab].list, {
        method: 'post',
        data: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          month: this.filter[this.activeTab].month.split('-')[1],
          year: this.filter[this.activeTab].month.split('-')[0]
        }
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.records || []
            this.pageCount = res.data.page.pageCount || 1
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
      if (this.activeTab === '0' && !page) {
        this.$service(financePointConfirmed[0].sum, {
          method: 'post',
          data: {
            month: this.filter[this.activeTab].month.split('-')[1],
            year: this.filter[this.activeTab].month.split('-')[0]
          }
        }).then(res => {
          if (res.code === 200) {
            this.total = res.data
          }
        })
      }
    },
    exportList () {
      if (this.list.length === 0) return this.$message('暂无相关数据')
      let query = `?month=${this.filter[this.activeTab].month.split('-')[1]}&year=${this.filter[this.activeTab].month.split('-')[0]}`
      let downloadUrl = location.origin + financePointConfirmed[this.activeTab].export + query
      window.open(downloadUrl)
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
