<template>
  <div class="history">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input placeholder="用户ID/邮箱账号" prefix-icon="el-icon-search" clearable v-model="filterQuery.search"
          @clear="getFilterList()" @change="getFilterList('search')" size="mini" style="width:auto;">
        </el-input>
      </div>
    </div>
    <el-form :model="filterQuery" :inline="true" size="mini" :disabled="loading">
      <el-form-item>
        <el-date-picker v-model="filterQuery.startTime" type="date" editable="false" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00" @change="getFilterList('startTime')" style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.endTime).getTime() !== 0 && time.getTime() > new Date(filterQuery.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filterQuery.endTime" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" @change="getFilterList('endTime')" style="width:135px" :picker-options="{disabledDate(time) {
           return time.getTime() > Date.now() || (new Date(filterQuery.startTime).getTime() !== 0 && time.getTime() < new Date(filterQuery.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filterQuery.sessionRange" @change="getFilterList('sessionRange')">
          <el-option label="全部" :value="0"></el-option>
          <el-option label="我的客户" :value="1"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table size="medium" ref="elTable" :data="list" v-loading="loading" @sort-change="sortList" stripe
      style="width: 100%" :max-height="tableHeight<400?400:tableHeight" @row-dblclick="conversationShow">
      <el-table-column prop="userId" label="用户ID" min-width="140">
      </el-table-column>
      <el-table-column label="用户昵称" min-width="150" prop="userNickname">
      </el-table-column>
      <el-table-column prop="createTime" label="最近会话开始时间" min-width="140">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'MM-dd hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="activateAdminId" label="接待客服ID" min-width="130"> -->
      <!-- </el-table-column> -->
      <el-table-column prop="activateAdminName" label="接待客服" min-width="130">
      </el-table-column>
      <el-table-column prop="exclusiveAdminName" label="专属客服" min-width="140">
      </el-table-column>
      <el-table-column prop="userLevel" label="客户等级" min-width="140">
        <template slot-scope="scope">
          {{scope.row.userLevel | level2CH }}
        </template>
      </el-table-column>
      <el-table-column prop="userStatus" label="客户状态" min-width="140">
        <template slot-scope="scope">
          {{scope.row.userStatus | status2CH }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getFilterList"
      :current-page.sync="Math.floor(offset/limit) + 1" :total="total" :page-size="limit" class="page-bar-reset">
    </el-pagination>
    <Conversation :userInfo="currentSessionObj" v-model="drawer" />
  </div>
</template>

<script>
import Conversation from '../../component/Conversation'
import { historyList } from '../../util/api/history'
import { mapState } from 'vuex'
export default {
  name: 'History',
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 1,
      drawer: false,
      loading: false,
      tableHeight: null,
      filterQuery: {
        startTime: '',
        endTime: '',
        sessionRange: 0,
        search: ''
      },
      currentSessionObj: {}
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getFilterList()
    this.setHeight()
  },
  components: {
    Conversation
  },
  filters: {
    status2CH (val) {
      let dict = {
        0: '失效',
        1: '过期',
        2: '有效'
      }
      return dict[val] || '-'
    },
    level2CH (val) {
      let dict = {
        0: '小白',
        1: '银卡',
        2: '金卡',
        3: '钻石卡',
        4: '至尊VIP'
      }
      return dict[val] || ''
    }
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
      if (typeof page === 'number') {
        this.offset = page ? (page - 1) * this.limit : 0
      } else {
        this.offset = 0
      }
      const filter = {
        start: this.offset,
        limit: this.limit
      }
      if (this.filterQuery.startTime) {
        filter['startTime'] = this.filterQuery.startTime
      }
      if (this.filterQuery.endTime) {
        filter['endTime'] = this.filterQuery.endTime
      }
      if (this.filterQuery.sessionRange) {
        filter['sessionRange'] = this.filterQuery.sessionRange
      }
      if (this.filterQuery.search) {
        filter['search'] = this.filterQuery.search
      }
      this.$service(historyList.filterList, {
        params: filter
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.list = res.data.data || []
          this.total = res.data.total || 1
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
    conversationShow (row) {
      this.drawer = true
      this.currentSessionObj = row
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
