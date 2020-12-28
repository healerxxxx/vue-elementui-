<template>
  <div class="expert-popularity">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker v-model="filter.week" type="week" format="yyyy 第 WW 周" :clearable="false" style="width:140px"
          :picker-options="{disabledDate (time) {
            return time.getTime().valueOf() > Date.now().valueOf() - 7 * 24 * 60 * 60 * 1000
          }, firstDayOfWeek: 1}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="ranking" label="排名" min-width="100">
      </el-table-column>
      <el-table-column prop="nickName" label="专家名" min-width="120">
        <template slot-scope="scope">
          {{scope.row.nickName || scope.row.nickname}}
        </template>
      </el-table-column>
      <el-table-column prop="threadSoldAvg" label="平均购买数" min-width="90">
      </el-table-column>
      <el-table-column prop="totalSale" label="总销售额" min-width="80">
      </el-table-column>
      <el-table-column prop="followerIncrement" label="新增粉丝数" min-width="90">
      </el-table-column>
      <el-table-column prop="popularity" label="人气值" min-width="70">
      </el-table-column>
      <el-table-column prop="startDate" label="周期" min-width="80">
        <template slot-scope="scope">
          {{scope.row.startDate.replace(/^\d+-/g, '').replace(/-/g, '.') + ' ~ ' + scope.row.endDate.replace(/^\d+-/g, '').replace(/-/g, '.')}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { StatisticsExpert } from '../../../../util/api'
import { formatDate } from '../../../../util/tool'
export default {
  name: 'expertPopularity',
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
      filter: {
        week: new Date(new Date().valueOf() - 7 * 24 * 60 * 60 * 1000)
      },
      list: [],
      pageIndex: 1,
      pageSize: 25,
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
      let _data = {}
      let day = this.filter.week.getDay() ? this.filter.week.getDay() : 7
      _data['startDate'] = formatDate(new Date(this.filter.week.valueOf() - (day - 1) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      _data['endDate'] = formatDate(new Date(this.filter.week.valueOf() + (7 - day) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      this.$service(StatisticsExpert.popularityRank, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          categoryId: this.categoryId
        },
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records
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
