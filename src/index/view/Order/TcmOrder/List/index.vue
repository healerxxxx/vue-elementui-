<template>
  <div class="order-tcm-list">
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
        :disabled="!tcm.tcmOrderStatusList.length && activeTab === '0'"
        name='0'></el-tab-pane>
      <el-tab-pane label="拉新竞猜订单"
        :disabled="!tcm.tcmOrderStatusList.length && activeTab === '1'"
        name='1'></el-tab-pane>
    </el-tabs>
    <!-- TCM start -->
    <div v-show="activeTab==='0'">
      <el-form :inline="true"
        :model="tcm['filterQuery']"
        size="mini"
        ref="tcmFilterForm"
        :disabled="loading">
        <el-form-item label=""
          prop="filterType">
          <el-select clearable
            v-model="tcm['filterQuery'].orderType"
            style="width:105px"
            @clear="tcm.filterQuery.orderTypeName=''">
            <el-option label="用户通行证"
              value="account"></el-option>
            <el-option label="订单ID"
              value="orderId"></el-option>
            <el-option label="交易ID（数据商订单号）"
              value="orderTradeId"></el-option>
            <el-option label="赛事ID（我们的）"
              value="tcmEventId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=""
          prop="orderTypeName">
          <el-input v-model="quiz.filterQuery.orderTypeName"
            placeholder=""
            :disabled="!tcm.filterQuery.orderType"></el-input>
        </el-form-item>
        <el-form-item label=""
          prop="filterType">
          <el-select clearable
            v-model="tcm['filterQuery'].matchType"
            style="width:105px"
            @clear="tcm.filterQuery.matchTypeName=''">
            <el-option label="球队筛选"
              value="goodsname"></el-option>
            <el-option label="联赛筛选"
              value="tcmCompetitionId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=""
          prop="matchTypeName">
          <el-select v-if="tcm['filterQuery'].matchType==='tcmCompetitionId'"
            v-model="tcm.filterQuery.matchTypeName"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="请输入联赛名"
            :remote-method="getMatchList"
            :loading="tcm.match.loading">
            <el-option v-for="item in tcm.match.list"
              :key="item.tcmCompetitionId"
              :label="item.competitionName"
              :value="item.tcmCompetitionId">
            </el-option>
          </el-select>
          <el-input v-else
            v-model="tcm.filterQuery.matchTypeName"
            :placeholder="tcm['filterQuery'].matchType==='goodsname'?'请输入联赛名称，空格分隔':''"
            :disabled="!tcm.filterQuery.matchType"></el-input>
        </el-form-item>
        <el-form-item label="状态"
          prop="orderStatus">
          <el-select clearable
            v-model="tcm.filterQuery.orderStatus"
            style="width:105px">
            <el-option :label="item.desc"
              v-for="item in tcm.tcmOrderStatusList"
              :value="item.id"
              :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间"
          prop="date">
          <el-date-picker v-model="tcm.filterQuery.date"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :editable="false"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions0"
            size="small">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button size="mini"
            type="primary"
            @click="filterTcmOrderList()">
            筛选
          </el-button>
          <el-button type="primary"
            size="mini"
            @click="batchRepair">
            批量修复订单
          </el-button>
        </el-form-item>
      </el-form>
      <el-table ref="elTableTcm"
        :data="tcm.list"
        stripe
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :max-height="tableHeight<400?400:tableHeight">
        <el-table-column
          type="selection"
          width="45">
        </el-table-column>
        <el-table-column
          prop="orderId"
          fixed
          min-width="170"
          label="订单ID">
          <template slot-scope="scope">
            <router-link :to="{name: 'OrderTcmOrderDetail', params: {id: scope.row.orderId}}">{{scope.row.orderId}}</router-link>
          </template>
        </el-table-column>
        <el-table-column prop="orderTradeId"
          min-width="200"
          label="交易ID">
        </el-table-column>
        <el-table-column prop="orderStatus"
          label="订单状态"
          width="90">
          <template slot-scope="scope">
            <p>{{tcmOrderStatus2CH(scope.row.orderStatus)}}</p>
          </template>
        </el-table-column>
        <el-table-column prop="frozenTime"
          width="155"
          label="订单冻结时间">
          <template slot-scope="scope">
            {{[scope.row.frozenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="successTime"
          width="155"
          label="订单结算时间">
          <template slot-scope="scope">
            {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column
          prop="account"
          min-width="190"
          label="用户通行证">
        </el-table-column>
        <el-table-column prop="tcmEventId"
          width="80"
          label="赛事ID">
        </el-table-column>
        <el-table-column prop="goodsName"
          min-width="190"
          label="商品名称(对阵)">
        </el-table-column>
        <el-table-column prop="goodsType"
          width="80"
          label="商品类型">
        </el-table-column>
        <el-table-column prop="ruleTypeName"
          width="100"
          label="玩法">
        </el-table-column>
        <el-table-column prop="selectionName"
          width="100"
          label="投注项">
        </el-table-column>
        <el-table-column prop="odds"
          width="90"
          label="投注时赔率">
        </el-table-column>
        <el-table-column prop="resultMatchScore"
          width="90"
          label="结算时比分">
          <template slot-scope="scope">
            {{scope.row.resultMatchScore || '-'}}
          </template>
        </el-table-column>
        <el-table-column prop="orderPrice"
          width="90"
          label="订单金额">
        </el-table-column>
        <el-table-column prop="netPrice"
          width="90"
          label="用户盈亏">
        </el-table-column>
        <el-table-column label="操作"
          width="130">
          <template slot-scope="scope">
            <el-button type="primary"
              size="mini"
              slot="reference">查询TCM订单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background
        layout="prev, pager, next"
        @current-change="getTcmOrderList"
        page-size="pageSize"
        :current-page.sync="pageIndex"
        :page-count="pageCount"
        :disabled="!tcm.list.length"
        class="page-bar-reset"></el-pagination>
    </div>
    <!-- TCM end -->
    <!-- quiz start -->
    <div v-show="activeTab==='1'">
      <el-form :inline="true"
        :model="quiz['filterQuery']"
        size="mini"
        ref="quizFilterForm"
        :disabled="loading">
        <el-form-item label=""
          prop="filterType">
          <el-select clearable
            v-model="quiz['filterQuery'].orderType"
            style="width:105px"
            @clear="quiz.filterQuery.orderTypeName=''">
            <el-option label="用户通行证"
              value="account"></el-option>
            <el-option label="订单ID"
              value="orderId"></el-option>
            <el-option label="拉新活动ID"
              value="subjectQuizId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=""
          prop="orderTypeName">
          <el-input v-model="quiz.filterQuery.orderTypeName"
            placeholder=""
            :disabled="!quiz.filterQuery.orderType"></el-input>
        </el-form-item>
        <el-form-item label="状态"
          prop="orderStatus">
          <el-select clearable
            v-model="quiz.filterQuery.orderStatus"
            style="width:105px">
            <el-option :label="item"
              v-for="(item, key) in quiz.orderStatus"
              :value="key"
              :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间"
          prop="date">
          <el-date-picker v-model="quiz.filterQuery.date"
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
          @click="getQuizFilterQuery()">筛选</el-button>
      </el-form>
      <el-table ref="elTableQuiz"
        :data="quiz.list"
        stripe
        v-loading="loading"
        :max-height="tableHeight<400?400:tableHeight">
        <el-table-column
          prop="orderId"
          fixed
          min-width="170"
          label="订单ID">
          <template slot-scope="scope">
            <router-link :to="{name: 'OrderQuizOrderDetail', params: {id: scope.row.orderId}}">{{scope.row.orderId}}</router-link>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus"
          label="订单状态"
          width="100">
          <template slot-scope="scope">
            <p>{{quiz.orderStatus[scope.row.orderStatus]}}</p>
          </template>
        </el-table-column>
        <el-table-column prop="frozenTime"
          width="155"
          label="订单冻结时间">
          <template slot-scope="scope">
            {{[scope.row.frozenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="successTime"
          width="155"
          label="订单结算时间">
          <template slot-scope="scope">
            {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="orderSelectionName"
          min-width="150"
          label="投注项">
        </el-table-column>
        <el-table-column prop="orderCredit"
          width="120"
          label="投注金额">
        </el-table-column>
      </el-table>
      <el-pagination background
        layout="prev, pager, next"
        @current-change="getQuizOrderList"
        page-size="pageSize"
        :current-page.sync="pageIndex"
        :page-count="pageCount"
        :disabled="!quiz.list.length"
        class="page-bar-reset"></el-pagination>
    </div>
    <!-- quiz end -->
  </div>
</template>
<script>
import { GuessOrder } from '../../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'OrderTcmOrderList',
  data () {
    return {
      activeTab: '0',
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      tableHeight: null,
      loading: false,
      tcm: {
        list: [],
        tcmOrderStatusList: [], // tcm状态
        filterQuery: {
          orderType: '',
          orderTypeName: '',
          matchType: '',
          matchTypeName: '',
          orderStatus: null,
          date: []
        },
        filter: {},
        match: {
          loading: false,
          list: [],
          filterQuery: {
            date: []
          }
        },
        repairList: null // 批量修复列表
      },
      quiz: {
        list: [],
        orderStatus: {
          1: '冻结',
          2: '结算',
          3: '退款'
        },
        filterQuery: {
          orderType: '',
          orderTypeName: '',
          orderStatus: null,
          date: []
        },
        filter: {}
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getTcmOrderStatusList().then(res => {
      this.tcm['tcmOrderStatusList'] = res.data
      this.activeTab === '0' ? this.getTcmOrderList() : this.getQuizOrderList()
    }).catch(err => {
      this.$message.error(err)
    })
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - (this.activeTab === '0' ? this.$refs.elTableTcm.$el.offsetTop : this.$refs.elTableQuiz.$el.offsetTop) - 63
      })
    },
    tcmOrderStatus2CH (status) {
      let name
      this.tcm['tcmOrderStatusList'].filter(item => {
        if (item.id === status) name = item.desc
      })
      return name
    },
    handleClickTabs () {
      this.pageCount = 1
      if (this.activeTab === '0') {
        this.$refs['tcmFilterForm'].resetFields()
        this.$refs['tcmFilterForm'].clearValidate()
        this.tcm.filter = {}
        this.getTcmOrderList()
      } else {
        this.$refs['quizFilterForm'].resetFields()
        this.quiz.filter = {}
        this.getQuizOrderList()
      }
      this.setHeight()
    },
    getTcmOrderStatusList () {
      return new Promise((resolve, reject) => {
        this.loading = true
        this.$service(GuessOrder[0].orderStatusList).then(
          res => {
            if (res.code === 200) {
              resolve(res)
            } else {
              reject(res.message)
            }
          },
          err => {
            if (err) {
              reject(JSON.stringify(err))
            }
          }
        )
      })
    },
    // tcm筛选
    filterTcmOrderList (pageIndex) {
      this.getTcmFilterQuery().then((filter) => {
        this.tcm.filter = filter
        this.getTcmOrderList(1)
      })
    },
    // tcm数据请求
    getTcmOrderList (pageIndex) {
      this.pageIndex = pageIndex || 1
      this.loading = true
      this.$service(GuessOrder[this.activeTab].orderList, {
        method: 'post',
        data: Object.assign({}, {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }, this.tcm.filter)
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTableTcm.bodyWrapper.scrollTop = 0
            this.tcm.list = res.data.records || []
            this.pageCount = res.data.page.pageCount
            this.pageIndex = res.data.page.pageIndex
          } else {
            this.tcm.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.tcm.list = []
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getQuizOrderList (pageIndex) {
      let data = {
        pageIndex: pageIndex || 1,
        pageSize: this.pageSize
      }
      this.loading = true
      this.$service(GuessOrder[this.activeTab].orderList, {
        method: 'post',
        data: Object.assign({}, this.quiz.filter, data)
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTableQuiz.bodyWrapper.scrollTop = 0
            this.quiz.list = res.data.records || []
            this.pageCount = res.data.page.pageCount
            this.pageIndex = res.data.page.pageIndex
          } else {
            this.quiz.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.quiz.list = []
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    // 根据输入获得联赛列表
    getMatchList (val) {
      this.tcm.match.loading = true
      this.$service(GuessOrder[this.activeTab].matchList, {
        method: 'get',
        params: {
          keyWords: val
        }
      }).then(
        res => {
          this.tcm.match.loading = false
          if (res.code === 200) {
            this.tcm.match.list = res.data || []
          } else {
            this.tcm.match.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.tcm.match.list = []
            this.tcm.match.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    // 获得tcm筛选参数
    getTcmFilterQuery () {
      return new Promise((resolve, reject) => {
        let data = this.tcm.filterQuery
        let filter = {}
        if (data.date.length) {
          filter.startTime = data.date[0] || ''
          filter.endTime = data.date[1] || ''
        }
        if (data.orderTypeName) filter[data.orderType] = data.orderTypeName
        if (data.matchTypeName) filter[data.matchType] = data.matchTypeName
        if (data.orderStatus || data.orderStatus === 0) filter.orderStatus = data.orderStatus
        if (filter.goodsname && (!filter.startTime || !filter.endTime)) {
          this.$message.error('请选择起止时间')
          reject(new Error('请选择起止时间'))
        } else {
          resolve(filter)
        }
      })
    },
    // 获得拉新竞猜参数
    getQuizFilterQuery () {
      let data = this.quiz.filterQuery
      let filter = {}
      if (data.date.length) {
        filter.startTime = data.date[0] + ' 00:00:00'
        filter.endTime = data.date[0] + ' 23:59:59'
      }
      if (data.orderTypeName) filter[data.orderType] = data.orderTypeName
      if (data.orderStatus) filter.orderStatus = data.orderStatus
      this.quiz.filter = filter
      this.getQuizOrderList(1)
    },
    // 批量修复选择发生变化
    handleSelectionChange (val) {
      this.tcm.repairList = val
    },
    // 批量修复订单
    batchRepair () {
      let query = ''
      let length = this.tcm.repairList.length
      for (let i = 0; i < length; i++) {
        i === 0 ? query = `${query}?tcmBaseOrderId=${this.tcm.repairList[i].tcmBaseOrderId}` : query = `${query}&tcmBaseOrderId=${this.tcm.repairList[i].tcmBaseOrderId}`
      }
      this.$service(GuessOrder[this.activeTab].batchRepair, {
        urlParams: {
          tcmBaseOrderId: query
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.getTcmOrderList()
            this.$message.success('批量修复成功')
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
