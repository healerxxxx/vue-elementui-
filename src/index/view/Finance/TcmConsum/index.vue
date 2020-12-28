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
    <el-tabs v-model="activeTab"
      @tab-click="handleClickTabs">
      <el-tab-pane label="TCM竞猜订单"
        name='0'>
        <div class="filter">
          <el-date-picker v-model="tcm.date"
            type="month"
            placeholder="选择月"
            :clearable='false'
            size="small"
            format="yyyy-MM"
            style="width: 130px"
            @change="searchTcm()"
            :picker-options="pickerOptions">
          </el-date-picker>
          <el-button type="primary"
            size="mini"
            class="export-btn"
            @click="exportList">导出</el-button>
          <label>当月总计消耗积分：</label> {{tcm.orderCredit || 0}} 元
          <label>当月总计消耗N币：</label> {{tcm.orderNCoin || 0}} 元
        </div>
        <el-table ref="elTcmTable"
          :data="tcm.list"
          stripe
          v-loading="tcm.loading"
          style="width: 100%"
          :max-height="tcm.tableHeight<400?400:tcm.tableHeight">
          <el-table-column prop="orderId"
            label="竞猜订单ID"
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
          <el-table-column prop="orderCredit"
            label="消耗积分数量"
            min-width="120">
          </el-table-column>
          <el-table-column prop="orderNCoin"
            label="消耗牛币数量"
            min-width="120">
          </el-table-column>
          <el-table-column prop="netReturn"
            label="返奖额(N币)"
            min-width="120">
          </el-table-column>
          <el-table-column prop="govOrg"
            label="分成机构"
            min-width="100">
          </el-table-column>
          <el-table-column prop="proportions"
            label="分成比例"
            min-width="100">
          </el-table-column>
          <el-table-column prop="proportionsAmount"
            label="分成金额"
            min-width="120">
          </el-table-column>
        </el-table>
        <el-pagination background
          layout="prev, pager, next"
          @current-change="getTcmList"
          page-size="tcm.pageSize"
          :current-page.sync="tcm.pageIndex"
          :page-count="tcm.pageCount"
          class="page-bar-reset"></el-pagination>
      </el-tab-pane>
      <el-tab-pane label="拉新竞猜订单"
        name='1'>
        <div class="filter">
          <el-date-picker v-model="pullNew.date"
            type="month"
            placeholder="选择月"
            :clearable='false'
            size="small"
            format="yyyy-MM"
            style="width: 130px"
            @change="searchPullNew(1)"
            :picker-options="pickerOptions">
          </el-date-picker>
          <el-button type="primary"
            size="mini"
            class="export-btn"
            @click="exportList">导出</el-button>
          <label>当月总计消耗积分：</label> {{pullNew.quizDivideCredit || 0}} 元
        </div>
        <el-table ref="elPullpullNewTable"
          :data="pullNew.list"
          stripe
          v-loading="pullNew.loading"
          style="width: 100%"
          :max-height="pullNew.tableHeight<400?400:pullNew.tableHeight">
          <el-table-column prop="orderId"
            label="竞猜订单ID"
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
            label="订单结算时间"
            min-width="160">
            <template slot-scope="scope">
              {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column prop="account"
            label="用户通行证"
            min-width="180">
          </el-table-column>
          <el-table-column prop="orderCredit"
            label="消耗积分数量"
            min-width="180">
          </el-table-column>
        </el-table>
        <el-pagination background
          layout="prev, pager, next"
          @current-change="getPullNewList"
          page-size="pullNew.pageSize"
          :current-page.sync="pullNew.pageIndex"
          :page-count="pullNew.pageCount"
          class="page-bar-reset"></el-pagination>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>
<script>
import { financeTcmConsum } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'FinanceTcmConsum',
  data () {
    return {
      activeTab: '0',
      pullNew: {
        pageIndex: 1,
        pageSize: 25,
        pageCount: 1,
        list: [],
        tableHeight: null,
        loading: true,
        quizDivideCredit: null,
        date: new Date()
      },
      tcm: {
        pageIndex: 1,
        pageSize: 25,
        pageCount: 1,
        list: [],
        tableHeight: null,
        loading: true,
        orderCredit: null,
        orderNCoin: null,
        date: new Date(new Date().getFullYear(), new Date().getMonth() - 1)
      },
      pickerOptions: {
        disabledDate: (time) => {
          let date = new Date()
          return time.getTime() > new Date(date.getFullYear(), date.getMonth())
        }
      }
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    tcmMonth: function () {
      let data = this.tcm.date
      let mm = data.getMonth() + 1
      let month = mm.toString().length < 2 ? '0' + mm : mm
      return month
    },
    pullNewMonth: function () {
      let data = this.pullNew.date
      let mm = data.getMonth() + 1
      let month = mm.toString().length < 2 ? '0' + mm : mm
      return month
    }
  },
  created () {
    this.getTcmList()
    this.getTcmAddTotal()
    this.getPullNewList()
    this.getPullNewTotal()
    this.$nextTick(() => {
      this.setHeight()
    })
  },
  methods: {
    handleClickTabs () {
      this.setHeight()
    },
    setHeight () {
      this.$nextTick(() => {
        this.tcm.tableHeight = this.windowHeight - this.$refs.elTcmTable.$el.offsetTop - 195
        this.pullNew.tableHeight = this.windowHeight - this.$refs.elPullpullNewTable.$el.offsetTop - 195
      })
    },
    searchTcm () {
      this.getTcmList(1)
      this.getTcmAddTotal()
    },
    getTcmList (pageIndex, pageSize) {
      this.tcm.loading = true
      this.$service(financeTcmConsum[0].list, {
        method: 'get',
        params: {
          pageIndex: pageIndex || this.tcm.pageIndex,
          pageSize: pageSize || this.tcm.pageSize,
          month: this.tcmMonth,
          year: this.tcm.date.getFullYear()
        }
      }).then(
        res => {
          this.tcm.loading = false
          if (res.code === 200) {
            this.$refs.elTcmTable.bodyWrapper.scrollTop = 0
            this.tcm.list = res.data.records || []
            this.tcm.pageCount = res.data.page.pageCount
            this.tcm.pageIndex = res.data.page.pageIndex
          } else {
            this.tcm.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.tcm.list = []
            this.tcm.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getTcmAddTotal () {
      this.$service(financeTcmConsum[0].sum, {
        method: 'get',
        params: {
          month: this.tcmMonth,
          year: this.tcm.date.getFullYear()
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.tcm.orderCredit = typeof res.data.orderCredit === 'number' ? res.data.orderCredit : 0
            this.tcm.orderNCoin = typeof res.data.orderNCoin === 'number' ? res.data.orderNCoin : 0
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
    },
    searchPullNew () {
      this.getPullNewList(1)
      this.getPullNewTotal()
    },
    getPullNewList (pageIndex, pageSize) {
      this.pullNew.loading = true
      this.$service(financeTcmConsum[1].list, {
        method: 'get',
        params: {
          pageIndex: pageIndex || this.pullNew.pageIndex,
          pageSize: pageSize || this.pullNew.pageSize,
          month: this.pullNewMonth,
          year: this.pullNew.date.getFullYear()
        }
      }).then(
        res => {
          this.pullNew.loading = false
          if (res.code === 200) {
            this.$refs.elPullpullNewTable.bodyWrapper.scrollTop = 0
            this.pullNew.list = res.data.records || []
            this.pullNew.pageCount = res.data.page.pageCount
            this.pullNew.pageIndex = res.data.page.pageIndex
          } else {
            this.pullNew.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.pullNew.list = []
            this.pullNew.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getPullNewTotal () {
      this.$service(financeTcmConsum[1].sum, {
        method: 'get',
        params: {
          month: this.pullNewMonth,
          year: this.pullNew.date.getFullYear()
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.pullNew.quizDivideCredit = typeof res.data === 'number' ? res.data : 0
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
    },
    exportList () {
      let query = ''
      if (this.activeTab === '0') {
        if (this.tcm.list.length === 0) return this.$message('暂无相关数据')
        query = `?month=${this.tcmMonth}&year=${this.tcm.date.getFullYear()}`
      } else {
        if (this.pullNew.list.length === 0) return this.$message('暂无相关数据')
        query = `?month=${this.pullNewMonth}&year=${this.pullNew.date.getFullYear()}`
      }
      let downloadUrl = location.origin + financeTcmConsum[this.activeTab].export + query
      window.open(downloadUrl)
    }
  }
}
</script>
