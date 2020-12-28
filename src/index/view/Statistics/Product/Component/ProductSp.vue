<template>
  <div class="product-sp">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.startTime"
          type="date"
          editable="false"
          min-width="100"
          placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          @change="getFilterList"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="filter.endTime"
          type="date"
          editable="false"
          placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59"
          @change="getFilterList"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      :span-method="spanMethod"
      border
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="company"
        label="交叉盘组"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="matchInfoId"
        label="比赛ID"
        min-width="140">
      </el-table-column>
      <el-table-column
        prop="leagueName"
        label="联赛"
        min-width="130">
      </el-table-column>
      <el-table-column
        label="对阵"
        min-width="150">
        <template slot-scope="scope">
          {{scope.row.home+' VS '+scope.row.guest}}
        </template>
      </el-table-column>
      <el-table-column
        label="即时赔率"
        min-width="170">
        <template slot-scope="scope">
          {{scope.row.instantOdds?'胜'+scope.row.instantOdds.w+'、平'+scope.row.instantOdds.d+'、负'+scope.row.instantOdds.l:'-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="初赔赔率"
        min-width="170">
        <template slot-scope="scope">
          {{scope.row.originalOdds?'胜'+scope.row.originalOdds.w+'、平'+scope.row.originalOdds.d+'、负'+scope.row.originalOdds.l:'-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="比赛时间"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.matchDate + ' ' + scope.row.matchTime}}
        </template>
      </el-table-column>
      <el-table-column
        prop="matchStatus"
        label="状态"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.matchStatus | matchStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        label="比分"
        min-width="70">
        <template slot-scope="scope">
          {{scope.row.matchStatus===2||scope.row.matchStatus===3?scope.row.homeScore+' - '+scope.row.guestScore:'-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="结果"
        min-width="70">
        <template slot-scope="scope">
          <span v-if="scope.row.oddsAsiaResult">{{scope.row.oddsAsiaResult.drawsConcede + ' ' + result2ch(scope.row.oddsAsiaResult.resultStatus)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="currentPage"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { StatisticsProduct } from '../../../../util/api'
export default {
  name: 'productSp',
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
        startTime: '',
        endTime: ''
      },
      list: [],
      offset: 1,
      limit: 25,
      total: 1,
      loading: false,
      tableHeight: null
    }
  },
  computed: {
    currentPage () {
      return Math.floor(this.offset / this.limit) + 1
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
    result2ch (status) {
      var cn = {
        '-1': '输',
        '0': '走盘',
        '1': '赢'
      }
      return cn[status] || '-'
    },
    spanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      let _data = {}
      if (this.filter.startTime) {
        _data['startTime'] = this.filter.startTime
      }
      if (this.filter.endTime) {
        _data['endTime'] = this.filter.endTime
      }
      this.$service(StatisticsProduct.spList, {
        urlParams: {
          offset: this.offset,
          limit: this.limit
        },
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = []
          res.data && res.data.data && res.data.data.forEach(item => {
            item.matchList.forEach(_item => {
              this.list.push(Object.assign(_item, {company: item.company}))
            })
          })
          this.total = res.data.total || 1
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
