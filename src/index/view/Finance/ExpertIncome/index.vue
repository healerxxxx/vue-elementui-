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
        <el-date-picker v-model="month" type="month" :clearable="false" style="width:120px;" value-format="yyyy.MM"
          :picker-options="{disabledDate: (time) => {
            let year = new Date().getFullYear()
            let month = new Date().getMonth()
            return time.getTime() > new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)
          }}" @change="getList()">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item v-if="totalIncome && !isCooperation">
        <p style="line-height:1;" v-if="totalIncome.redCurrency">
          <span><b>{{toPercent(totalIncome.redCurrency.androidChannelRate) || '2%'}}：</b>{{totalIncome.redCurrency.noIapTotalConsume || 0}}豆；</span>
          <span><b>{{toPercent(totalIncome.redCurrency.iosChannelRate) || '31.4%'}}：</b>{{totalIncome.redCurrency.iapTotalConsume || 0}}豆；</span>
          <span><b>合计：</b>{{totalIncome.redCurrency.totalConsume || 0}}豆</span>
        </p>
        <p style="line-height:1;margin-top:5px;" v-if="totalIncome.cash">
          <span><b>{{toPercent(totalIncome.cash.androidChannelRate) || '2%'}}：</b>{{totalIncome.cash.noIapTotalConsume || 0}}元；</span>
          <span><b>{{toPercent(totalIncome.cash.iosChannelRate) || '31.4%'}}：</b>{{totalIncome.cash.iapTotalConsume || 0}}元；</span>
          <span><b>合计：</b>{{totalIncome.cash.totalConsume || 0}}元</span>
        </p>
      </el-form-item>
      <el-form-item v-if="totalIncome" label="专家净收入">
        <span>{{totalIncome.totalNetIncome || 0}}元；</span>
      </el-form-item>
      <el-form-item v-if="totalIncome" label="当月彩票地推总CPS渠道费(元)">
        <span>{{totalIncome.pushHandsDistributionFee || 0}}元；</span>
      </el-form-item>
      <el-form-item v-if="totalIncome && (totalIncome.depositRate || totalIncome.depositRate === 0) && !isCooperation"
        label="当期滚动折扣率">
        <span>{{totalIncome.depositRate | toPercent}}</span>
      </el-form-item>
      <el-form-item
        v-show="!isCooperation && totalIncome && !totalIncome.depositRate && totalIncome.depositRate !== 0 && depositRateAuth"
        label="当期滚动折扣率">
        <el-input v-model="depositRate" placeholder="输入滚动折扣率" style="width:120px"></el-input> %
      </el-form-item>
      <el-form-item
        v-show="!isCooperation && totalIncome && totalIncome.depositRate !== 0 && !totalIncome.depositRate && depositRateAuth">
        <el-button type="primary" @click="setDespositRate">设置</el-button>
      </el-form-item>
    </el-form>
    <el-tabs v-model="activeTab" v-if="appList.length" @tab-click="changeActiveTab">
      <el-tab-pane v-for="item in appList" :label="item.name" :name='item.typeId.toString()' :key="item.typeId"
        :disabled="loading">
      </el-tab-pane>
    </el-tabs>
    <el-table ref="elTable" :data="list" border stripe v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="accountType" label="专家类别" min-width="100">
        <template slot-scope="scope">
          {{[scope.row.accountType] | accountType2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="expertId" label="专家ID" min-width="140">
      </el-table-column>
      <el-table-column prop="expertName" label="专家姓名" min-width="120">
      </el-table-column>
      <el-table-column prop="expertNickName" label="专家昵称" min-width="150">
      </el-table-column>
      <el-table-column prop="region" label="地区" min-width="130">
        <template slot-scope="scope">
          {{[scope.row.region] | region2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="neteaseAccount" label="专家网易宝" min-width="180">
      </el-table-column>
      <el-table-column prop="divideRate" label="分成比例" min-width="100">
        <template slot-scope="scope">
          {{scope.row.divideRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column label="当期可确认消耗" key="2" min-width="100" v-if="!isCooperation">
        <el-table-column label="一次性消耗红豆" width="120">
          <el-table-column
            :label="(totalIncome&&totalIncome.redCurrency?toPercent(totalIncome.redCurrency.androidChannelRate):'2%')+'费率'"
            prop="typeConsumeRedCurrency.onceRedCurrency.noIapConsume" width="120">
          </el-table-column>
          <el-table-column
            :label="(totalIncome&&totalIncome.redCurrency?toPercent(totalIncome.redCurrency.iosChannelRate):'31.4%')+'费率'"
            prop="typeConsumeRedCurrency.onceRedCurrency.iapConsume" width="120">
          </el-table-column>
          <el-table-column label="合计" prop="typeConsumeRedCurrency.onceRedCurrency.totalConsume" width="120">
          </el-table-column>
        </el-table-column>
        <el-table-column label="点数消耗红豆" width="120">
          <el-table-column
            :label="(totalIncome&&totalIncome.redCurrency?toPercent(totalIncome.redCurrency.androidChannelRate):'2%')+'费率'"
            prop="typeConsumeRedCurrency.cardRedCurrency.noIapConsume" width="120">
          </el-table-column>
          <el-table-column
            :label="(totalIncome&&totalIncome.redCurrency?toPercent(totalIncome.redCurrency.iosChannelRate):'31.4%')+'费率'"
            prop="typeConsumeRedCurrency.cardRedCurrency.iapConsume" width="120">
          </el-table-column>
          <el-table-column label="合计" prop="typeConsumeRedCurrency.cardRedCurrency.totalConsume" width="120">
          </el-table-column>
        </el-table-column>
        <el-table-column prop="typeConsumeRedCurrency.totalConsume" label="合计" width="120">
        </el-table-column>
      </el-table-column>
      <el-table-column label="当期可确认消耗现金" key="1" v-if="!isCooperation">
        <el-table-column v-if="!isCooperation" prop="typeConsumeCash.noIapConsume"
          :label="(totalIncome&&totalIncome.cash?toPercent(totalIncome.cash.androidChannelRate):'2%')+'费率'"
          min-width="120">
        </el-table-column>
        <el-table-column v-if="!isCooperation" prop="typeConsumeCash.iapConsume"
          :label="(totalIncome&&totalIncome.cash?toPercent(totalIncome.cash.iosChannelRate):'31.4%')+'费率'"
          min-width="120">
        </el-table-column>
        <el-table-column v-if="!isCooperation" prop="typeConsumeCash.totalConsume" label="合计" min-width="120">
        </el-table-column>
      </el-table-column>
      <el-table-column prop="totalDivideCurrency" key="3" label="当期外部平台分成收入(元)" v-if="isCooperation" min-width="200">
      </el-table-column>
      <el-table-column prop="cpsFeeType" label="CPS渠道类型" min-width="130">
      </el-table-column>
      <el-table-column prop="pushHandsDistributionFee" label="CPS渠道费(元)" min-width="130">
      </el-table-column>
      <el-table-column prop="netIncome" label="净收入" min-width="130">
      </el-table-column>
      <el-table-column prop="protocolStatus" label="协议情况">
        <template slot-scope="scope">
          {{scope.row.protocolStatus | protocolStatus2CH}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" page-size="pageSize"
      :current-page.sync="pageIndex" :page-count="pageCount" class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { financeExpertIncome, appSelectList } from '../../../util/api'
import { isNumber, arraySome } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'FinanceExpertIncome',
  data () {
    let _month = new Date(new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(), new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1)
    return {
      appList: [],
      activeTab: '-1',
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      month: _month.getFullYear() + '.' + (_month.getMonth() < 9 ? '0' + (_month.getMonth() + 1) : _month.getMonth() + 1),
      loading: false,
      tableHeight: null,
      list: [],
      totalIncome: null,
      depositRate: null
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    isCooperation () {
      let isOutCooperation = false
      this.appList.forEach(item => {
        if (item.typeId === parseInt(this.activeTab) && item.isOutCooperation) isOutCooperation = true
      })
      return isOutCooperation
    },
    depositRateAuth () {
      return arraySome([33, 39], this.$store.state.userInfo.roleList)
    },
    requestUrl () {
      if (this.appList.length === 0) return financeExpertIncome.hongcai
      let isOutCooperation = null
      this.appList.forEach(item => {
        if (item.typeId === parseInt(this.activeTab)) isOutCooperation = item.isOutCooperation
      })
      return isOutCooperation === 0 ? financeExpertIncome.hongcai : financeExpertIncome.cooperation
    }
  },
  created () {
    this.getAPPlist()
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
    toPercent (num) {
      if (isNumber(num)) {
        return Math.round(num * 10000) / 100 + '%'
      }
      return ''
    },
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getAPPlist () {
      this.$service(appSelectList).then(res => {
        if (res.code === 200) {
          this.appList = res.data
          this.setHeight()
        }
      })
    },
    changeActiveTab () {
      this.list = []
      this.totalIncome = null
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(this.requestUrl.list, {
        method: 'get',
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: {
          month: this.month,
          appId: this.activeTab
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.list = res.data.resultPage.records || []
          this.totalIncome = res.data.monthTotalIncome || null
          this.pageCount = res.data.resultPage.page.pageCount || 1
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
      let downloadUrl = location.origin + this.requestUrl.export + `?appId=${this.activeTab}&month=${this.month}`
      window.open(downloadUrl)
    },
    setDespositRate () {
      this.$confirm(`确定将当期滚动折扣率设置为${this.depositRate}%？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(this.requestUrl.setDespositRate, {
          method: 'post',
          data: {
            month: this.month,
            depositRate: this.depositRate / 100
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList()
            this.$message('设置成功')
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
