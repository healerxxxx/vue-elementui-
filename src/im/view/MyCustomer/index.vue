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
      <div class="tools">
        <el-input placeholder="用户ID" prefix-icon="el-icon-search" clearable v-model="filterQuery.search"
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
        <el-select v-model="filterQuery.userStatus" @change="getFilterList('userStatus')">
          <el-option label="全部" :value="-1"></el-option>
          <el-option label="失效客户" :value="0"></el-option>
          <el-option label="过期客户" :value="1"></el-option>
          <el-option label="有效客户" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filterQuery.sessionCreateType" @change="getFilterList('sessionCreateType')">
          <el-option label="全部" :value="-1"></el-option>
          <el-option label="客户发起" :value="0"></el-option>
          <el-option label="客服发起" :value="1"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table size="medium" ref="elTable" :data="list" v-loading="loading" stripe
      :max-height="tableHeight<400?400:tableHeight" @row-dblclick="conversationShow">
      <el-table-column prop="userId" label="用户ID" min-width="120">
      </el-table-column>
      <el-table-column prop="nickname" label="用户昵称" min-width="160">
      </el-table-column>
      <el-table-column prop="apportionTime" label="客户分配时间" min-width="140">
        <template slot-scope="scope">
          {{[scope.row.apportionTime, 'MM-dd hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="客户状态" min-width="120" prop="status">
        <template slot-scope="scope">
          {{scope.row.status | status2CH }}
        </template>
      </el-table-column>
      <el-table-column prop="sessionType" label="是否会话" min-width="140">
        <template slot-scope="scope">
          {{scope.row.sessionType | sessionType2CH }}
        </template>
      </el-table-column>
      <el-table-column label="最后发起人" min-width="140">
        <template slot-scope="scope">
          {{scope.row.createType | createType2CH }}
        </template>
      </el-table-column>
      <el-table-column label="最后通话记录时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.lastMessageTime, 'MM-dd  hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="level" label="客户等级" min-width="140">
        <template slot-scope="scope">
          {{scope.row.level | level2CH }}
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
import { myCustomerList } from '../../util/api/myCustomer'
import { mapState } from 'vuex'
import Conversation from '../../component/Conversation'
export default {
  name: 'MyCustomer',
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 1,
      loading: false,
      tableHeight: null,
      list: [],
      drawer: false,
      filterQuery: {
        startTime: '',
        endTime: '',
        userStatus: -1,
        sessionCreateType: -1,
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
    },
    sessionType2CH (val) {
      let dict = {
        1: '是',
        2: '是',
        3: '否'
      }
      return dict[val] || ''
    },
    createType2CH (val) {
      let dict = {
        0: '客户',
        1: '客服'
      }
      return dict[val] || ''
    }
  },
  components: {
    Conversation
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
        offset: this.offset,
        limit: this.limit,
        userStatus: this.filterQuery.userStatus,
        sessionCreateType: this.filterQuery.sessionCreateType
      }
      if (this.filterQuery.startTime) {
        filter['startTime'] = this.filterQuery.startTime
      }
      if (this.filterQuery.endTime) {
        filter['endTime'] = this.filterQuery.endTime
      }
      // if (this.filterQuery.userStatus) {
      //   filter['userStatus'] = this.filterQuery.userStatus
      // }
      // if (this.filterQuery.sessionCreateType) {
      //   filter['sessionCreateType'] = this.filterQuery.sessionCreateType
      // }
      if (this.filterQuery.search) {
        filter['search'] = this.filterQuery.search
      }
      this.$service(myCustomerList.filterlist, {
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
