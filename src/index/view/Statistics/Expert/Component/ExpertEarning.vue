<template>
  <div class="expert-earning">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="周期时间">
        <el-select v-model="filter.type" style="width:70px;">
          <el-option label="周" value="0"></el-option>
          <el-option label="月" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="filter.type==='0'">
        <el-date-picker
          v-model="filter.week"
          type="week"
          format="yyyy 第 WW 周"
          :clearable="false"
          style="width:140px"
          :picker-options="{disabledDate (time) {
            return time.getTime().valueOf() > Date.now().valueOf() - 7 * 24 * 60 * 60 * 1000
          }, firstDayOfWeek: 1}">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-show="filter.type==='1'">
        <el-date-picker
          v-model="filter.month"
          type="month"
          placeholder="选择月"
          :clearable="false"
          style="width:110px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList(),getTopCount()">查询</el-button>
      </el-form-item>
      <el-form-item label="" v-if="topCount">
        {{topType==='0'?'周':'月'}}总盈利率：<b>{{topCount.totalEarningRate | toPercent}}</b>；
        {{topType==='0'?'周':'月'}}销售前10平均盈利率：<b>{{topCount.topTenAvgEarningRate | toPercent}}</b>；
        {{topType==='0'?'周':'月'}}购买≥100平均盈利率：<b>{{topCount.moreThanHundredEarningRate | toPercent}}</b>；
        {{topType==='0'?'周':'月'}}购买≥100命中率：<b>{{topCount.moreThanHundredHitRate | toPercent}}</b>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="ranking"
        label="排名"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.ranking || scope.$index + 1}}
        </template>
      </el-table-column>
      <el-table-column
        prop="nickName"
        label="专家名"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.nickName || scope.row.nickname}}
        </template>
      </el-table-column>
      <el-table-column
        prop="earningRate"
        label="盈利率"
        min-width="70">
        <template slot-scope="scope">
          {{scope.row.earningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="startDate"
        label="周期"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.startDate.replace(/^\d+-/g, '').replace(/-/g, '.') + ' ~ ' + scope.row.endDate.replace(/^\d+-/g, '').replace(/-/g, '.')}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { StatisticsExpert } from '../../../../util/api'
import { formatDate } from '../../../../util/tool'
export default {
  name: 'expertEarning',
  props: {
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
      filter: {
        type: '0',
        week: new Date(new Date().valueOf() - 7 * 24 * 60 * 60 * 1000),
        month: new Date()
      },
      list: [],
      pageIndex: 1,
      pageSize: 31,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      topType: '0',
      topCount: null
    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
      this.getTopCount()
      this.setHeight()
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getDateLParam () {
      let _data = {}
      if (this.filter.type === '0') {
        let day = this.filter.week.getDay() ? this.filter.week.getDay() : 7
        _data['startDate'] = formatDate(new Date(this.filter.week.valueOf() - (day - 1) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        _data['endDate'] = formatDate(new Date(this.filter.week.valueOf() + (7 - day) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      }
      if (this.filter.type === '1') {
        let month = this.filter.month.getMonth()
        _data['startDate'] = formatDate(new Date(this.filter.month.getFullYear(), month, 1), 'yyyy-MM-dd')
        _data['endDate'] = formatDate(new Date(month === 11 ? this.filter.month.getFullYear() + 1 : this.filter.month.getFullYear(), month === 11 ? 0 : month + 1, 1).valueOf() - 24 * 60 * 60 * 1000, 'yyyy-MM-dd')
      }
      return _data
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      let url = this.filter.type === '0' ? StatisticsExpert.earningRank : StatisticsExpert.earningByMonth
      let _data = this.getDateLParam()
      this.$service(url, {
        urlParams: this.filter.type === '0' ? {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        } : null,
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = this.filter.type === '0' ? res.data.records : res.data
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
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
    getTopCount () {
      this.topCount = null
      let _data = this.getDateLParam()
      _data['type'] = this.filter.type
      this.$service(StatisticsExpert.earningTop, {
        params: _data
      }).then(res => {
        if (res.code === 200) {
          this.topCount = res.data
          this.topType = this.filter.type
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.getTopCount()
        this.setHeight()
      }
    },
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>
