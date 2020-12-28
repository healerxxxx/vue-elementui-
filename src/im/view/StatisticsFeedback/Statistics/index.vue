<template>
  <div class="customer">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :model="filterQuery" :inline="true" size="mini" :disabled="loading">
      <el-form-item>
        <el-date-picker v-model="filterQuery.startDate" type="date" editable="false" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00" style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() - 1*24*60*60*1000 || (new Date(filterQuery.endDate).getTime() !== 0 && time.getTime() > new Date(filterQuery.endDate).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filterQuery.endDate" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" style="width:135px" :picker-options="{disabledDate(time) {
           return time.getTime() > Date.now() - 1*24*60*60*1000 || (new Date(filterQuery.startDate).getTime() !== 0 && time.getTime() < new Date(filterQuery.startDate).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-button type="primary" @click="getFilterList()">筛选</el-button>
    </el-form>
    <el-table size="medium" ref="elTable" :data="list" v-loading="loading" stripe
      :max-height="tableHeight<400?400:tableHeight" @row-dblclick="conversationShow">
      <el-table-column prop="adminName" label="客服姓名" min-width="120">
      </el-table-column>
      <el-table-column prop="onWorkTime" label="在班时长(h)" min-width="160">
      </el-table-column>
      <el-table-column prop="onWorkTimeAvg" label="日均在班时长" min-width="140">
      </el-table-column>
      <el-table-column label="处理客服总次数" min-width="120" prop="serviceCount">
      </el-table-column>
      <el-table-column prop="serviceCountAvg" label="日均处理客服次数" min-width="140">
      </el-table-column>
      <el-table-column prop="delayReplyCount" label="3分钟未响应客诉总次数" min-width="140">
      </el-table-column>
      <el-table-column prop="delayReplyCountAvg" label="日均3分钟未响应客诉总次数" min-width="160">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { statistics } from '../../../util/api/statisticsfeedback'
import { mapState } from 'vuex'
export default {
  name: 'statistics',
  data () {
    return {
      loading: false,
      tableHeight: null,
      list: [],
      filterQuery: {
        startDate: '',
        endDate: ''
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getFilterList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getFilterList (page) {
      if (this.loading) return
      this.loading = true
      const filter = {}
      if (this.filterQuery.startDate) {
        filter['startDate'] = this.filterQuery.startDate
      }
      if (this.filterQuery.endDate) {
        filter['endDate'] = this.filterQuery.endDate
      }
      this.$service(statistics.adminSessionStats, {
        params: filter
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          if (Object.keys(res.data).length === 0) {
            this.list = []
          } else {
            this.list = res.data
          }
          this.$refs.elTable.bodyWrapper.scrollTop = 0
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
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
