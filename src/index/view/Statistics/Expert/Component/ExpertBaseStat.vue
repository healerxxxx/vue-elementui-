<template>
  <div class="expert-base-stat">
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      @sort-change="sortList"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        fixed
        prop="nickname"
        label="专家名称"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="earningRateRankCount"
        label="周盈利率榜次数"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="popularityRankCount"
        label="周人气榜次数"
        min-width="120">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="latestPostTime"
        label="最后发文时间"
        min-width="130">
        <template slot-scope="scope">
          {{scope.row.latestPostTime ? scope.row.latestPostTime + '天' : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="totalThreadCount"
        label="发文数"
        min-width="90">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="totalBuyCount"
        label="购买数"
        min-width="90">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="follower"
        label="粉丝数"
        min-width="90">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="totalEarningRate"
        label="总盈利率"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.totalEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="totalHitRate"
        label="总命中率"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.totalHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="continuityWin"
        label="近期连红"
        min-width="100">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="threeDaysHitRate"
        label="近3日"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.threeDaysHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="sevenDaysHitRate"
        label="近7日"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.sevenDaysHitRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="thirtyDaysHitRate"
        label="近30日"
        min-width="90">
        <template slot-scope="scope">
          {{scope.row.thirtyDaysHitRate | toPercent}}
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
  name: 'expertBaseStat',
  props: {
    visible: {
      type: 'Boolean',
      default: false
    },
    screenHeight: {
      type: 'Number'
    },
    categoryId: {
      type: 'Number',
      default: 1
    }
  },
  data () {
    return {
      sortRrders: ['descending', 'ascending', null],
      sortObj: {},
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
      if (this.sortObj && this.sortObj.sortField) {
        _data['sortField'] = this.sortObj.sortField
        _data['sortDesc'] = this.sortObj.sortDesc
      }
      this.categoryId === 1 ? _data['eType'] = 0 : _data['eType'] = 1
      this.$service(StatisticsExpert.baseList, {
        params: _data
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
    sortList (column, prop, order) {
      this.sortObj['sortField'] = column.prop
      this.sortObj['sortDesc'] = column.order === 'ascending' ? false : column.order === 'descending' ? true : null
      this.getList(1)
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
