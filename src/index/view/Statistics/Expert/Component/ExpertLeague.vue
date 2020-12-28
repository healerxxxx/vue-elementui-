<template>
  <div class="expert-league">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="">
        <el-select v-model="filter.type" placeholder="请选择" style="width:120px;" @change="filter.text = ''">
          <el-option label="用户昵称" value="nickname"></el-option>
          <el-option label="联赛名称" value="leagueMatchName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-input v-model="filter.text" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
        <el-button size="mini" type="primary" @click="exportList()">导出</el-button>
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
        prop="nickname"
        label="专家名称"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="leagueMatchName"
        label="联赛"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="totalHitRateDesc"
        label="发文数"
        min-width="70">
        <template slot-scope="scope">
          {{scope.row.totalHitRateDesc.replace(',', '中')}}
        </template>
      </el-table-column>
      <el-table-column
        prop="totalEarningRate"
        label="总盈利率"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.totalEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="totalHitRate"
        label="总命中率"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.totalHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="fiveMatchesHitRate"
        label="近5日"
        min-width="60">
        <template slot-scope="scope">
          {{scope.row.fiveMatchesHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="sevenMatchesHitRate"
        label="近7日"
        min-width="60">
        <template slot-scope="scope">
          {{scope.row.sevenMatchesHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="tenMatchesHitRate"
        label="近10日"
        min-width="60">
        <template slot-scope="scope">
          {{scope.row.tenMatchesHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="fifteenMatchesHitRate"
        label="近15日"
        min-width="70">
        <template slot-scope="scope">
          {{scope.row.fifteenMatchesHitRate | toPercent}}
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
export default {
  name: 'expertLeague',
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
        type: 'nickname'
      },
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      tableHeight: null
    }
  },
  mounted () {
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
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      let _data = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }
      if (this.filter.text) {
        _data[this.filter.type] = this.filter.text
      }
      this.$service(StatisticsExpert.leagueList, {
        method: 'post',
        data: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
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
    exportList () {
      window.open(StatisticsExpert.leagueExport)
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
