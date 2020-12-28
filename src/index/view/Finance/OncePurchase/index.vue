<template>
  <div class="finance-purchase">
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
        <el-date-picker v-model="month" type="month" :clearable="false" style="width:120px;" value-format="yyyy-MM"
          :picker-options="{disabledDate: (time) => {
            return time.getTime() > Date.now()
          }}" @change="getList()">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item v-if="list.length">
        总计：<span>{{sumRedCurrency}} {{isCooperation?'鹅肝':'豆'}}</span>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="startDay" type="date" editable="false" width="100" placeholder="开始日期"
          value-format="yyyy-MM-dd" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(endTime).getTime() !== 0 && time.getTime() > new Date(endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="endDay" type="date" editable="false" placeholder="结束日期" value-format="yyyy-MM-dd"
          :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(startTime).getTime() !== 0 && time.getTime() < new Date(startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportDayList">导出</el-button>
      </el-form-item>
    </el-form>
    <el-tabs v-model="activeTab" v-if="appList.length" @tab-click="getList(),setHeight()">
      <el-tab-pane v-for="item in appList" :label="item.name" :name="item.typeId.toString()" :key="item.typeId"
        :disabled="loading">
      </el-tab-pane>
    </el-tabs>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="orderId" label="订单ID" min-width="180">
      </el-table-column>
      <el-table-column prop="createTime" label="订单创建时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.orderTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="订单成功时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="account" label="用户通行证" min-width="180">
      </el-table-column>
      <el-table-column prop="tradeId" label="交易ID" min-width="180">
      </el-table-column>
      <el-table-column prop="goodsId" label="商品ID" min-width="180">
      </el-table-column>
      <el-table-column prop="goodsType" label="商品类型" min-width="100">
        <template slot-scope="scope">
          {{[scope.row.goodsType, '0'] | goods2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="goodsName" label="商品名称" min-width="180">
      </el-table-column>
      <el-table-column prop="expertId" label="专家ID" width="120">
      </el-table-column>
      <el-table-column prop="expertAccount" label="专家网易宝" width="180">
      </el-table-column>
      <el-table-column prop="goodsCount" label="购买数量" width="120">
      </el-table-column>
      <!-- 红彩、精准比分、全部 start -->
      <el-table-column prop="redCurrency" label="消耗红豆" width="120" v-if="!isCooperation">
      </el-table-column>
      <el-table-column prop="channelRate" label="通道费率" width="120" v-if="!isCooperation">
        <template slot-scope="scope">
          {{scope.row.channelRate | toPercent}}
        </template>
      </el-table-column>
      <!-- 红彩、精准比分、全部 end -->
      <!-- 企鹅直播 start -->
      <el-table-column prop="corperOrderPrice" label="消耗鹅肝" width="120" v-if="isCooperation">
      </el-table-column>
      <el-table-column prop="factor" label="代币系数" width="120" v-if="isCooperation">
      </el-table-column>
      <el-table-column prop="platformDivideRate" label="红彩分成比例" width="120" v-if="isCooperation">
        <template slot-scope="scope">
          {{scope.row.platformDivideRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="divideCurrency" label="红彩分成金额" width="120" v-if="isCooperation">
      </el-table-column>
      <!-- 企鹅直播 end -->
      <el-table-column prop="payTerminal" label="支付终端" width="120">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, '0'] | payTerminal2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="divideRate" label="分成比例" width="120">
        <template slot-scope="scope">
          {{scope.row.divideRate | toPercent}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" page-size="pageSize"
      :current-page.sync="pageIndex" :page-count="pageCount" class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { financeOncePurchase, appSelectList } from '../../../util/api'
import { formatDate } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'FinanceOncePurchase',
  data () {
    return {
      appList: [],
      activeTab: '-1',
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      month: new Date().getFullYear() + '-' + (new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1),
      startDay: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
      endDay: formatDate(new Date(), 'yyyy-MM-dd'),
      loading: false,
      tableHeight: null,
      sumRedCurrency: null,
      list: []
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
    requestUrl () {
      if (this.appList.length === 0) return financeOncePurchase.hongcai
      let isOutCooperation = null
      this.appList.forEach(item => {
        if (item.typeId === parseInt(this.activeTab)) isOutCooperation = item.isOutCooperation
      })
      return isOutCooperation === 0 ? financeOncePurchase.hongcai : financeOncePurchase.cooperation
    }
  },
  created () {
    this.getAPPlist()
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getAPPlist () {
      this.$service(appSelectList).then(
        res => {
          if (res.code === 200) {
            this.appList = res.data
            this.setHeight()
          } else {
            this.appList = []
            this.$message.error(res.message)
          }
        },
        err => {
          if (err) {
            this.appList = []
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getList (page) {
      if (this.loading) return
      this.pageIndex = page || 1
      this.loading = true
      this.$service(this.requestUrl.list, {
        method: 'get',
        urlParams: {
          month: this.month,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: {
          appId: this.activeTab
        }
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.records || []
            this.pageCount = res.data.page.pageCount || 1
            this.sumRedCurrency = res.data.sumRedCurrency || 0
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
    exportList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      let downloadUrl = location.origin + this.requestUrl.export.replace(/{{month}}/, this.month) + `?appId=${this.activeTab}`
      window.open(downloadUrl)
    },
    exportDayList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      let downloadUrl = location.origin + this.requestUrl.exportDay.replace(/{{startDay}}/, this.startDay).replace(/{{endDay}}/, this.endDay) + `&appId=${this.activeTab}`
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
<style lang="scss" rel="stylesheet/scss" scoped>
.finance-purchase {
  .sum {
    margin: 0 20px;
    span {
      margin-right: 20px;
    }
  }
  .finance-btn {
    margin-left: 20px;
  }
}
</style>
