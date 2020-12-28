<template>
  <div class="finance-expertIncome">
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
        <el-select v-model="type" @change="getList()" style="width:110px">
          <el-option label="专家推手" :value="0"></el-option>
          <el-option label="彩票店地推" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="month" type="month" :clearable="false" style="width:120px;" value-format="yyyy.MM"
          :picker-options="{disabledDate: (time) => {
            let year = new Date().getFullYear()
            let month = new Date().getMonth()
            return time.getTime() > new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)
          }}" @change="getList()">
        </el-date-picker>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item>
        分销佣金总计：{{pushHandsAllFee}}
      </el-form-item>
      <el-form-item v-if="depositRateNum">
        <span>当月滚动折扣率: {{depositRateNum | toPercent}}</span>
        <el-button type="primary" v-if="type.toString() !== '1'" @click="delDespositRate">清除</el-button>
      </el-form-item>
      <el-form-item v-show="!loading && !depositRateNum" label="当月滚动折扣率">
        <el-input v-model="depositRate" placeholder="输入滚动折扣率" style="width:120px"></el-input> %
        <el-button type="primary" @click="setDespositRate">设置</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" :max-height="tableHeight < 400 ? 400 : tableHeight">
      <el-table-column prop="orderId" label="订单ID" min-width="180">
      </el-table-column>
      <el-table-column prop="createTime" label="订单创建时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="订单成功时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="goodsId" label="商品ID" min-width="80">
      </el-table-column>
      <el-table-column prop="goodsType" label="商品类型" min-width="80">
      </el-table-column>
      <el-table-column prop="buyCount" label="购买数量" min-width="80">
      </el-table-column>
      <el-table-column prop="costRedCurrency" label="消耗红豆" min-width="80">
      </el-table-column>
      <el-table-column prop="costCash" label="消耗现金" min-width="80">
      </el-table-column>
      <el-table-column prop="pushHandsMerchantId" label="推手合作商户ID" width="120">
      </el-table-column>
      <el-table-column prop="pushHandsId" label="推手ID" width="80">
      </el-table-column>
      <el-table-column prop="pushHandsType" label="推手类型" width="80">
      </el-table-column>
      <el-table-column prop="cpsChannelType" label="CPS渠道类型" width="110">
      </el-table-column>
      <el-table-column prop="cpsSplitRatio" label="CPS分成比例" width="110">
        <template slot-scope="scope">
          {{scope.row.cpsSplitRatio | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="distriCommission" label="分成佣金(元)" width="100">
        <template slot-scope="scope">
          {{scope.row.distriCommission ? Math.round(scope.row.distriCommission * 100) / 100 : ''}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" page-size="pageSize"
      :current-page.sync="pageIndex" :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
  </div>
</template>
<script>
import { FinanceCpsOrderDetail } from '../../../util/api'
import { arraySome } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'FinanceCpsOrderDetail',
  data () {
    let _month = new Date(new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(), new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1)
    return {
      appList: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      type: 1,
      month: _month.getFullYear() + '.' + (_month.getMonth() < 9 ? '0' + (_month.getMonth() + 1) : _month.getMonth() + 1),
      loading: false,
      tableHeight: null,
      pushHandsAllFee: 0,
      list: [],
      depositRate: '',
      depositRateNum: null
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    depositRateAuth () {
      return arraySome([33, 39], this.$store.state.userInfo.roleList)
    }
  },
  created () {
    this.getList()
  },
  filters: {
    protocolStatus2CH (code) {
      let dict = {
        '-1': '待确认',
        '1': '正常',
        '0': '终止'
      }
      return dict[code] || '-'
    }
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
      if (!page) {
        this.depositRateNum = null
      }
      this.$service(FinanceCpsOrderDetail.list, {
        method: 'get',
        params: {
          month: this.month,
          type: this.type,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = (res.data.resultPage && res.data.resultPage.records) || []
          this.pageCount = (res.data.resultPage && res.data.resultPage.page && res.data.resultPage.page.pageCount) || 1
          this.depositRateNum = res.data.pushHandsDepositRate || null
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.pushHandsAllFee = res.data.pushHandsAllFee || 0
          this.$refs.elTable.bodyWrapper.scrollLeft = 0
          this.setHeight()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    exportList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      const downloadUrl = location.origin + FinanceCpsOrderDetail.export + `?month=${this.month}` + `&type=${this.type}`
      window.open(downloadUrl)
    },
    setDespositRate () {
      this.$confirm(`确定将当期滚动折扣率设置为${this.depositRate}%？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(FinanceCpsOrderDetail.setDespositRate, {
          method: 'post',
          data: {
            month: this.month,
            pushHandsTypeId: this.type,
            pushHandsDepositRate: this.depositRate / 100
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList()
            this.$message.success('设置成功')
          } else {
            this.$message.error(res.message)
          }
        }, err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    delDespositRate () {
      this.$confirm(`确定清空当期滚动折扣率？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(FinanceCpsOrderDetail.delDespositRate, {
          method: 'post',
          data: {
            month: this.month,
            pushHandsTypeId: this.type
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList()
            this.$message.success('清除成功')
          } else {
            this.$message.error(res.message)
          }
        }, err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
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
