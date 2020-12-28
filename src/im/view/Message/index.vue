<template>
  <div class="message-record">
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
        <el-select v-model="filterQuery.sessionType" @change="getFilterList('sessionType')">
          <el-option label="我的客户/他人代答" :value="0"></el-option>
          <el-option label="他人客户" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filterQuery.exclusiveStatus" @change="getFilterList('exclusiveStatus')">
          <el-option label="全部" :value="-1"></el-option>
          <el-option label="未处理留言" :value="0"></el-option>
          <el-option label="已处理留言" :value="1"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table size="medium" ref="elTable" :data="list" v-loading="loading" @sort-change="sortList" stripe
      style="width: 100%" :max-height="tableHeight<400?400:tableHeight" @row-dblclick="conversationShow">
      <el-table-column prop="userId" label="用户ID" min-width="140">
      </el-table-column>
      <el-table-column prop="nickname" label="用户昵称" min-width="140">
      </el-table-column>
      <el-table-column prop="sessionType" label="留言类型" min-width="140">
        <template slot-scope="scope">
          {{scope.row.sessionType | sessionType2CH}}
        </template>
      </el-table-column>
      <el-table-column label="留言内容" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.messageType === 2">[图片]</span>
          <span v-else> {{scope.row.lastMessage }}</span>
        </template>
      </el-table-column>
      <el-table-column label="留言时间" min-width="120">
        <template slot-scope="scope">
          {{[scope.row.lastLeaveTime, 'MM-dd hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="adminName" label="专属客服" min-width="140">
      </el-table-column>
      <el-table-column prop="exclusiveStatus" label="专属客服是否处理" min-width="140">
        <template slot-scope="scope">
          {{scope.row.exclusiveStatus === 0 ? '未处理' : '已处理'}}
        </template>
      </el-table-column>
      <el-table-column label="处理时间" min-width="120">
        <template slot-scope="scope" v-if="scope.row.exclusiveStatus !== 0">
          {{[scope.row.updateTime, 'MM-dd hh:mm'] | dateFormat}}
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
import { messageList } from '../../util/api/message'
import { formatDate } from '../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'Message',
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 1,
      loading: false,
      drawer: false,
      tableHeight: null,
      filterQuery: {
        startTime: formatDate(new Date().setDate(new Date().getDate() - 2), 'yyyy-MM-dd') + ' 00:00:00',
        endTime: formatDate(new Date(), 'yyyy-MM-dd') + ' 23:59:59',
        sessionType: 0,
        exclusiveStatus: -1
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
    sessionType2CH (val) {
      let dict = {
        2: '他人代答',
        3: '下班留言'
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
        offset: this.offset,
        limit: this.limit,
        exclusiveStatus: this.filterQuery.exclusiveStatus,
        sessionType: this.filterQuery.sessionType
      }
      if (this.filterQuery.startTime) {
        filter['startTime'] = this.filterQuery.startTime
      }
      if (this.filterQuery.endTime) {
        filter['endTime'] = this.filterQuery.endTime
      }
      this.$service(messageList.filterList, {
        params: filter
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.listType = 'filter'
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
    },
    dateFormat (date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
