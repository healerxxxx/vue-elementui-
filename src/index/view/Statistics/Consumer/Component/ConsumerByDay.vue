<template>
  <div class="consumer-day-wrap" v-show="visible">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker v-model="filter.startTime" type="date" editable="false" width="100" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filter.endTime" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="商品类别">
        <el-select v-model="filter.countType" style="width:115px">
          <el-option label="全部" value=""></el-option>
          <el-option label="方案加点卡" value="2001"></el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in goodsType[appTab]" :key="item.id"></el-option>
          <el-option label="竞猜" value="1000" v-if="appTab==='0'"></el-option>
          <el-option label="拉新竞猜" value="1001" v-if="appTab==='0'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="彩种" v-show="parseInt(filter.countType)==1">
        <el-select v-model="filter.category" style="width:105px">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.cName" :value="item.cId" v-for="item in lotteryList" :key="item.cId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端">
        <el-select v-model="filter.payTerminal" style="width:105px">
          <el-option label="全部" value="-1"></el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in payTerminal[appTab]" :key="item.id"></el-option>
          <el-option label="其他" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
        <el-button size="mini" type="danger" @click="exportList()">导出</el-button>
      </el-form-item>
    </el-form>
    <div class="statsTotal" v-if="listType===0&&totalStat">
      消费总次数：<b>{{totalStat.totalConsumer}}</b>；
      消费总用户数：<b>{{totalStat.totalUser}}</b>；
      消费总额：<b>{{totalStat.consumerCount}}</b>
      <!-- 有效总用户数：<b>{{totalStat.totalActiveUser}}</b> -->
    </div>
    <div class="statsTotal" v-if="listType===1&&totalStat">
      投注量：<b>{{totalStat.totalNum}}</b>；
      投注总用户数：<b>{{totalStat.userNum}}</b>；
      投注总额：<b>{{totalStat.totalFlowAmount}}</b>；
      盈亏总额：<b>{{totalStat.netprofitorloss}}</b>
    </div>
    <div class="statsTotal" v-if="listType===2&&totalStat">
      投注量：<b>{{totalStat.totalNum}}</b>；
      投注总用户数：<b>{{totalStat.userNum}}</b>；
      投注总额：<b>{{totalStat.totalFlowAmount}}</b>；
      投入成本总额：<b>{{totalStat.totalCost}}</b>
    </div>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <!-- 正常统计 begin -->
      <el-table-column v-if="listType===0" :key="Math.random()" prop="date" label="日期" min-width="120">
      </el-table-column>
      <!-- <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="activeUser"
        label="有效用户数"
        min-width="100">
      </el-table-column> -->
      <el-table-column v-if="listType===0" :key="Math.random()" prop="consumerNum" label="消费次数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===0" :key="Math.random()" prop="userNum" label="消费用户数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===0" :key="Math.random()" prop="dayConsumer" label="消费总额" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===0" :key="Math.random()" label="消费次数占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.consumerScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column v-if="listType===0" :key="Math.random()" label="消费用户占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.userScale | toPercent}}
        </template>
      </el-table-column>
      <!-- 正常统计 end -->
      <!-- 竞猜统计 begin -->
      <el-table-column v-if="listType===1" :key="Math.random()" prop="days" label="日期" min-width="120">
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" prop="eventNum" label="投注比赛数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" prop="totalNum" label="投注量(次数)" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" prop="userNum" label="投注用户数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" prop="totalFlowAmount" label="投注总额" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" prop="netprofitorloss" label="盈亏额" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" label="消费次数占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.consumerHit | toPercent}}
        </template>
      </el-table-column>
      <el-table-column v-if="listType===1" :key="Math.random()" label="消费用户占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.userHit | toPercent}}
        </template>
      </el-table-column>
      <!-- 竞猜统计 end -->
      <!-- 拉新竞猜 begin -->
      <el-table-column v-if="listType===2" :key="Math.random()" prop="days" label="日期" min-width="120">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="quizNum" label="投注场次数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="totalNum" label="投注量(次数)" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="userNum" label="投注用户数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="newUserNum" label="投注新用户数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="oldUserNum" label="投注老用户数" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="totalFlowAmount" label="投注总额" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="totalNetReturn" label="返奖总额" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" prop="totalCost" label="平台投入成本" min-width="100">
      </el-table-column>
      <el-table-column v-if="listType===2" :key="Math.random()" label="消费用户占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.userHit | toPercent}}
        </template>
      </el-table-column>
      <!-- 拉新竞猜 end -->
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList"
      :current-page.sync="Math.floor(start/limit) + 1" :total="total" :page-size="limit" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { formatDate, objSort } from '../../../../util/tool'
import baseType from '../../../../util/base'
import { StatisticsConsumer, CommonApi } from '../../../../util/api'
export default {
  name: 'statisticsConsumerByDay',
  props: {
    appTab: {
      type: 'String',
      default: '0'
    },
    visible: {
      type: 'Boolean',
      default: false
    },
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      lotteryList: [],
      filter: {
        startTime: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd hh:mm:ss'),
        endTime: formatDate(new Date(), 'yyyy-MM-dd') + ' 23:59:59',
        countType: '',
        category: '',
        payTerminal: '-1'
      },
      goodsType: baseType.goodsType,
      payTerminal: baseType.payTerminal,
      start: 0,
      limit: 25,
      total: 1,
      list: [],
      totalStat: null,
      loading: false,
      tableHeight: null,
      listType: 1
    }
  },
  created () {
    this.getLottery()
    if (this.visible) {
      this.getList()
      this.setHeight()
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          this.lotteryList = res.data.sort(objSort('cId'))
        }
      })
    },
    getList (page) {
      if (this.loading) return
      this.totalStat = null
      this.loading = true
      if (typeof page === 'number') {
        this.start = page ? (page - 1) * this.limit : 0
      } else {
        this.start = 0
      }
      let _data = {
        start: this.start,
        limit: this.limit
      }
      if (this.filter.startTime) _data['startTime'] = this.filter.startTime
      if (this.filter.endTime) _data['endTime'] = this.filter.endTime
      if (this.filter.countType) _data['countType'] = this.filter.countType
      if (parseInt(this.filter.countType) === 1 && this.filter.category) _data['category'] = this.filter.category
      if (this.filter.payTerminal) _data['payTerminal'] = this.filter.payTerminal
      let url = StatisticsConsumer[this.appTab].consumerByDay.list
      this.listType = 0
      if (this.filter.countType === '1000') {
        this.listType = 1
        url = StatisticsConsumer[this.appTab].consumerByDay.tcmList
      }
      if (this.filter.countType === '1001') {
        this.listType = 2
        url = StatisticsConsumer[this.appTab].consumerByDay.quizList
      }
      this.$service(url, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          res.data.data.forEach(item => {
            item.dayConsumer = Math.floor(item.dayConsumer)
          })
          this.list = res.data.data
          this.total = res.data.total || 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          if (this.filter.countType === '1000') {
            this.totalStat = res.data.topInfo ? res.data.topInfo : null
          } else if (this.filter.countType === '1001') {
            this.totalStat = res.data.topInfo ? res.data.topInfo : null
          } else {
            this.totalStat = {
              totalConsumer: res.data.data[0].totalConsumer || 0,
              totalUser: res.data.data[0].totalUser || 0,
              consumerCount: res.data.data[0].consumerCount || 0,
              totalActiveUser: res.data.data[0].totalActiveUser || 0
            }
          }
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
      if (this.list.length === 0) return this.$message.warning('暂无相关数据')
      let url = StatisticsConsumer[this.appTab].consumerByDay.exportList
      if (this.filter.countType === '1000') url = StatisticsConsumer[this.appTab].consumerByDay.exportTcmList
      if (this.filter.countType === '1001') url = StatisticsConsumer[this.appTab].consumerByDay.exportQuizList
      let _arr = []
      Object.keys(this.filter).forEach(item => {
        if (this.filter[item]) _arr.push(item + '=' + this.filter[item])
      })
      window.open(window.location.origin + url + '?' + _arr.join('&'))
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.setHeight()
      }
    },
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>
