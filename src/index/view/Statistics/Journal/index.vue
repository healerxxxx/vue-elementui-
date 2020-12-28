<template>
  <div class="statistics-journal">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.startTime"
          type="month"
          editable="false"
          width="100"
          placeholder="开始月份"
          value-format="yyyy-MM-dd"
          style="width:110px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="filter.endTime"
          type="month"
          editable="false"
          placeholder="结束月份"
          value-format="yyyy-MM-dd"
          style="width:110px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="终端">
        <el-select v-model="filter.payTerminal" style="width:105px">
          <el-option label="全部" value="-1"></el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in payTerminal[filter.app]" :key="item.id"></el-option>
          <el-option label="其他" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品类型">
        <el-select v-model="filter.countType" style="width:105px">
          <el-option label="全部" value="0"></el-option>
          <el-option :label="value" :value="key" v-for="(value, key) in countTypeList[filter.app]" :key="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="来源">
        <el-select v-model="filter.app" style="width:105px">
          <el-option label="红彩" value="0"></el-option>
          <el-option label="精准比分" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="createExcel()" v-if="downloadStep!==2">{{downloadStep===1?'正在生成报表...':'生成报表'}}</el-button>
        <el-button size="mini" type="primary" @click="exportExcel()" v-if="downloadStep===2">下载报表</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import baseType from '../../../util/base'
import { StatisticsJournal } from '../../../util/api'
import { formatDate } from '../../../util/tool'
export default {
  name: 'statisticsJournal',
  data () {
    return {
      filter: {
        startTime: '',
        endTime: '',
        countType: '0',
        app: '0',
        payTerminal: '-1'
      },
      countTypeList: {
        0: {
          1: '红豆购买文章',
          2: '包月服务',
          3: '点卡',
          4: '新交叉盘',
          5: '竞猜',
          6: '拉新竞猜'
        },
        1: {
          1: '红豆购买文章'
        }
      },
      payTerminal: baseType.payTerminal,
      downloadStep: 0,
      checkTimer: null
    }
  },
  methods: {
    createExcel () {
      if (!this.filter.startTime || !this.filter.endTime) return this.$message.warning('请选择具体的月份范围')
      if (this.downloadStep !== 0) return
      this.downloadStep = 1
      let month = new Date(this.filter.endTime).getMonth()
      let year = new Date(this.filter.endTime).getFullYear()
      let _data = {
        startTime: this.filter.startTime + ' 00:00:00',
        endTime: formatDate(new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1).valueOf() - 24 * 60 * 60 * 1000, 'yyyy-MM-dd') + ' 23:59:59',
        payTerminal: this.filter.payTerminal,
        countType: this.filter.countType
      }
      this.checkExcel()
      this.$service(StatisticsJournal[this.filter.app].create, {
        params: _data
      }).then(res => {})
    },
    checkExcel () {
      this.checkTimer = setInterval(() => {
        this.$service(StatisticsJournal[this.filter.app].check).then(res => {
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
        window.open(window.location.origin + StatisticsJournal[this.filter.app].export)
      }
    }
  }
}
</script>
