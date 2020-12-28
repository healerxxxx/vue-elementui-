<template>
  <div class="new-user-day-wrap">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.time"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          style="width:240px"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
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
        <el-button size="mini" type="danger" @click="createExcel()" v-if="downloadStep!==2">{{downloadStep===1?'正在生成报表...':'生成报表'}}</el-button>
        <el-button size="mini" type="danger" @click="exportExcel()" v-if="downloadStep===2">下载报表</el-button>
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
        prop="payTerminalName"
        label="平台"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="newUserNum"
        label="新增用户数"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="payUserNum"
        label="新增用户付费用户数"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="userNum"
        label="新增用户付费率"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.payRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="payCount"
        label="新增用户付费总额"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="arpu"
        label="新增用户ARPU值"
        min-width="120">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import baseType from '../../../../util/base'
import { StatisticsConsumer } from '../../../../util/api'
export default {
  name: 'statisticsNewUserByDay',
  props: {
    appTab: {
      type: 'String',
      default: '0'
    },
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      filter: {
        time: '',
        payTerminal: '-1'
      },
      payTerminal: baseType.payTerminal,
      list: [],
      loading: false,
      tableHeight: null,
      downloadStep: 0,
      checkTimer: null
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    getList () {
      if (!this.filter.time) return this.$message.warning('请选择具体的时间范围')
      if (this.loading) return
      this.loading = true
      let _data = {}
      if (this.filter.time) {
        _data['startTime'] = this.filter.time[0] + ' 00:00:00'
        _data['endTime'] = this.filter.time[1] + ' 23:59:59'
      }
      if (this.filter.payTerminal) _data['payTerminal'] = this.filter.payTerminal
      this.$service(StatisticsConsumer[this.appTab].newUserByDay.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data
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
    createExcel () {
      if (!this.filter.time) return this.$message.warning('请选择具体的时间范围')
      if (this.downloadStep !== 0) return
      this.getList()
      this.downloadStep = 1
      let _data = {
        startTime: this.filter.time[0] + ' 00:00:00',
        endTime: this.filter.time[1] + ' 23:59:59',
        payTerminal: this.filter.payTerminal
      }
      this.$service(StatisticsConsumer[this.appTab].newUserByDay.createExcel, {
        params: _data
      }).then(res => {
        this.checkExcel()
        if (res.code !== 200) {
          this.downloadStep = 0
          this.$message.error(res.message)
        }
      }, err => {
        this.downloadStep = 0
        this.$message.error(JSON.stringify(err))
      })
    },
    checkExcel () {
      this.checkTimer = setInterval(() => {
        this.$service(StatisticsConsumer[this.appTab].newUserByDay.checkExcel).then(res => {
          if (res.code === 200 && res.data) {
            this.downloadStep = 2
            clearInterval(this.checkTimer)
          }
        })
      }, 3000)
    },
    exportExcel () {
      if (this.downloadStep === 2) {
        this.downloadStep = 0
        window.open(window.location.origin + StatisticsConsumer[this.appTab].newUserByDay.exportExcel)
      }
    }
  },
  watch: {
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>
