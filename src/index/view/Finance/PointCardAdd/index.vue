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
    </div>
    <el-form :inline="true" size="mini" :disabled="loading">
      <el-form-item>
        <el-date-picker v-model="filter.month" type="month" :clearable="false" style="width:120px;"
          value-format="yyyy-MM" :picker-options="{disabledDate: (time) => {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="折扣">
        <el-select v-model="filter.discount" style="width: 130px">
          <el-option value="" label="全部"></el-option>
          <el-option v-for="item in discountList" :value="item" :key="item" :label="item | toPercent">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型">
        <el-select v-model="filter.orderType" style="width: 100px">
          <el-option value="" label="全部"></el-option>
          <el-option value="1" label="红豆"></el-option>
          <el-option value="2" label="现金"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item>
        总计：<b>{{pointCardAddTotal || 0}}{{filter.orderType==='1'?'豆':filter.orderType==='2'?'元':''}}</b>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="orderId" label="订单Id" min-width="170">
      </el-table-column>
      <el-table-column prop="createTime" label="订单创建时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="successTime" label="订单成功时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="account" label="用户通行证" min-width="180">
      </el-table-column>
      <el-table-column prop="goodsId" label="商品ID" min-width="100">
      </el-table-column>
      <el-table-column prop="goodsType" label="商品类型" min-width="100">
      </el-table-column>
      <el-table-column prop="goodsName" label="商品名称" min-width="180">
      </el-table-column>
      <el-table-column prop="expertId" label="合作商户ID" min-width="180">
      </el-table-column>
      <el-table-column prop="point" label="总点数" min-width="80">
      </el-table-column>
      <el-table-column prop="discount" label="点卡折扣率" min-width="90">
        <template slot-scope="scope">
          {{scope.row.discount | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="buyCount" label="购买数量" min-width="80">
      </el-table-column>
      <el-table-column prop="orderPrice" label="购买金额" min-width="100">
        <template slot-scope="scope">
          {{scope.row.orderPrice}}{{filter.orderType==='1'?'豆':'元'}}
        </template>
      </el-table-column>
      <el-table-column prop="orderType" label="订单类型" min-width="80">
        <template slot-scope="scope">
          {{[scope.row.orderType, 0] | productPayType2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="serviceStartTime" label="服务开始日期" min-width="130">
        <template slot-scope="scope">
          {{[scope.row.serviceStartTime, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="serviceEndTime" label="服务结束日期" min-width="130">
        <template slot-scope="scope">
          {{[scope.row.serviceEndTime, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="serviceTotalDays" label="总服务天数" min-width="90">
        <template slot-scope="scope">
          {{scope.row.serviceTotalDays}}天
        </template>
      </el-table-column>
      <el-table-column prop="validDay" label="当月服务天数" min-width="108">
        <template slot-scope="scope">
          {{scope.row.validDay}}天
        </template>
      </el-table-column>
      <el-table-column prop="payTerminal" label="支付终端" min-width="80">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, '0'] | payTerminal2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="channelRate" label="通道费率" min-width="80">
        <template slot-scope="scope">
          {{scope.row.channelRate | toPercent}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" page-size="pageSize"
      :current-page.sync="pageIndex" :page-count="pageCount" class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { financePointCardAdd } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'FinancePointCardAdd',
  data () {
    return {
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      list: [],
      pointCardAddTotal: 0,
      discountList: [],
      filter: {
        month: new Date().getFullYear() + '-' + (new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1),
        orderType: '',
        discount: ''
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getDiscountList()
    this.search()
    this.setHeight()
  },
  methods: {
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
      this.filter.orderType !== '' && (_data['orderType'] = this.filter.orderType)
      this.filter.discount !== '' && (_data['discount'] = this.filter.discount)
      return _data
    },
    getDiscountList () {
      this.$service(financePointCardAdd.discountList, {
        method: 'get'
      }).then(res => {
        if (res.code === 200) {
          this.discountList = res.data || []
        }
      })
    },
    search () {
      this.getList()
      this.getTotal()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(financePointCardAdd.list, {
        method: 'post',
        data: Object.assign({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }, this.resetFilter())
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
    },
    getTotal () {
      this.$service(financePointCardAdd.sum, {
        method: 'post',
        data: this.resetFilter()
      }).then(
        res => {
          if (res.code === 200) {
            this.pointCardAddTotal = typeof res.data === 'number' ? res.data : 0
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) this.$message.error(JSON.stringify(err))
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
      window.open(location.origin + financePointCardAdd.export + '?' + _arr.join('&'))
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
