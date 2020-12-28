<template>
  <div class="finance-monthlyOfSp">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-dropdown @command="handleCommand">
          <el-button size="small" type="primary">
            切换 - {{{0: '红彩主包', 1: '精准比分'}[appTab]}} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0">红彩主包</el-dropdown-item>
            <el-dropdown-item command="1">精准比分</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <el-form :inline="true" size="mini" :disabled="loading">
      <el-form-item>
        <el-date-picker
          v-model="filter.month"
          type="month"
          :clearable="false"
          style="width:120px;"
          value-format="yyyy-MM"
          :picker-options="{disabledDate: (time) => {
            let year = new Date().getFullYear()
            let month = new Date().getMonth()
            return time.getTime() > new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="商品类型">
        <el-select v-model="filter.goodsTypeId"  style="width: 130px">
          <el-option value="2" label="交叉盘"></el-option>
          <el-option value="3" label="澳彩五星"></el-option>
          <el-option value="4" label="盘赔变动"></el-option>
          <el-option value="6" label="红彩指数"></el-option>
          <el-option value="11" label="新版交叉盘"></el-option>
          <el-option value="13" label="VIP大会员"></el-option>
          <el-option value="15" label="旋转矩阵付费"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型">
        <el-select v-model="filter.orderTypeId"  style="width: 80px">
          <el-option value="1" :label="{0: '红豆', 1: '金币'}[appTab]"></el-option>
          <el-option value="2" label="现金"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item>
        <el-button type="primary" @click="getList()">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item>
        <span>当月总计消耗：<b>{{total || 0}}{{filterTemp.orderTypeId==='1'?'豆':'元'}}</b>；</span>
        <span v-if="hiddenColumn">当月可确认消耗：<b>{{usingRedCurrency || 0}}{{filterTemp.orderTypeId==='1'?'豆':'元'}}</b></span>
      </el-form-item>
    </el-form>
    <el-table ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="orderId"
        label="订单Id"
        min-width="170">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="订单创建时间"
        min-width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="successTime"
        label="订单成功时间"
        min-width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="account"
        label="用户通行证"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="threadTradeId"
        label="交易ID"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="goodsId"
        label="商品ID"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="goodsType"
        label="商品类型"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="goodsName"
        label="商品名称"
        min-width="180">
      </el-table-column>
      <el-table-column
        v-if="hiddenColumn"
        prop="dataCount"
        label="总场次数"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="hiddenColumn"
        prop="expertId"
        label="合作商户ID"
        min-width="90">
      </el-table-column>
      <el-table-column
        v-if="hiddenColumn"
        prop="buyCount"
        label="购买数量"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="orderPrice"
        label="购买金额"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.orderPrice}}{{filterTemp.orderTypeId==='1'?'豆':'元'}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="hiddenColumn"
        prop="pricePerData"
        label="场次单价"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="serviceStartTime"
        label="服务开始日期"
        min-width="130">
        <template slot-scope="scope">
          {{[scope.row.serviceStartTime, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="serviceEndTime"
        label="服务结束日期"
        min-width="130">
        <template slot-scope="scope">
          {{[scope.row.serviceEndTime, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="serviceTotalDays"
        label="总服务天数"
        min-width="90">
        <template slot-scope="scope">
          {{scope.row.serviceTotalDays}}天
        </template>
      </el-table-column>
      <el-table-column
        v-if="hiddenColumn"
        prop="dataUsingCount"
        label="已使用场次"
        min-width="90">>
      </el-table-column>
      <el-table-column
        prop="serviceUsingDays"
        label="当月服务天数"
        min-width="110">
        <template slot-scope="scope">
          {{scope.row.serviceUsingDays}}天
        </template>
      </el-table-column>
      <el-table-column
        prop="serviceTotalDays"
        label="可确认消耗"
        min-width="90">
        <template slot-scope="scope">
          {{scope.row.serviceUsingRedCurrency}}{{filterTemp.orderTypeId==='1'?'豆':'元'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="payTerminal"
        label="支付终端"
        min-width="80">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, appTab] | payTerminal2CH}}
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
import { financeMonthlyConfirmedOfSp } from '../../../util/api'
import { mapState } from 'vuex'
const _month = new Date(new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(), new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1)
export default {
  name: 'FinanceMonthlyConfirmedOfSp',
  data () {
    return {
      appTab: 0,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      list: [],
      total: 0,
      usingRedCurrency: 0,
      filter: {
        month: _month.getFullYear() + '-' + (_month.getMonth() < 9 ? '0' + (_month.getMonth() + 1) : _month.getMonth() + 1),
        goodsTypeId: '3',
        orderTypeId: '1'
      },
      filterTemp: {
        goodsTypeId: '3',
        orderTypeId: '1'
      }
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    financeMonthlyConfirmedOfSpApi () {
      return financeMonthlyConfirmedOfSp[this.appTab]
    },
    hiddenColumn () {
      return this.filterTemp.goodsTypeId !== '13' && this.filterTemp.goodsTypeId !== '15'
    }
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    handleCommand (val) {
      if (this.appTab.toString() !== val.toString()) {
        this.appTab = val
        this.list = []
        this.getList()
      }
    },
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    resetFilter () {
      let _data = {
        month: this.filter.month.split('-')[1],
        year: this.filter.month.split('-')[0]
      }
      if (this.filter.goodsTypeId) _data['goodsTypeId'] = this.filter.goodsTypeId
      if (this.filter.orderTypeId) _data['orderTypeId'] = this.filter.orderTypeId
      return _data
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(this.financeMonthlyConfirmedOfSpApi.list, {
        params: Object.assign({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }, this.resetFilter())
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.filterTemp = {...this.filter}
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.resultPage && res.data.resultPage.records ? res.data.resultPage.records : []
            this.pageCount = res.data.resultPage && res.data.resultPage.page && res.data.resultPage.page.pageCount ? res.data.resultPage.page.pageCount : 1
            this.total = res.data.total || 0
            this.usingRedCurrency = res.data.usingRedCurrency || 0
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
    },
    exportList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      let _arr = []
      const _data = this.resetFilter()
      if (_data) {
        Object.keys(_data).forEach(key => {
          if (_data[key]) {
            _arr.push(`${key}=${_data[key]}`)
          }
        })
      }
      window.open(location.origin + this.financeMonthlyConfirmedOfSpApi.export + '?' + _arr.join('&'))
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
