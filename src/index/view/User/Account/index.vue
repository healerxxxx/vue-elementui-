<template>
  <div class="user-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input placeholder="账号/手机号"
          prefix-icon="el-icon-search"
          clearable
          v-model="searchQuery.query"
          size="small"
          style="width:auto;">
        </el-input>
        <el-button type="primary"
          size="small"
          @click="getList()">搜索</el-button>
      </div>
    </div>
    <el-table ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      @sort-change="sortList"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="mainAccount"
        min-width="120"
        label="新闻客户端账号">
      </el-table-column>
      <el-table-column
        min-width="120"
        prop="phoneAccount"
        label="关联手机账号">
      </el-table-column>
      <!-- <el-table-column
        prop="phone"
        width="110"
        label="关联手机号">
      </el-table-column> -->
      <el-table-column
        prop="createTime"
        width="150"
        label="注册时间">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="phone"
        width="90"
        label="是否绑定">
        <template slot-scope="scope">
          {{scope.row.status===0?'是':'否'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            width="160"
            v-model="scope.row.bindPop">
            <p>{{parseInt(scope.row.status)===1?'确定关联账号绑定?':'确定解除账号绑定?'}}</p>
            <div style="text-align: right; margin-top: 10px">
              <el-button size="mini" type="text" @click="scope.row.bindPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="bind($event,scope.row)">确定</el-button>
            </div>
            <el-button :type="scope.row.status===0?'primary':''" size="small" slot="reference">{{scope.row.status===0?'解除':'关联'}}账号绑定</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
      layout="prev, pager, next"
      @current-change="pageChange()"
      page-size="pageSize"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { AccountList } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      list: [],
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      tableHeight: null,
      searchQuery: {
        query: ''
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    pageChange () {
      this.pageStart = (this.pageIndex - 1) * this.pageLimit
      this.getList()
    },
    getList (type) {
      if (this.loading) return
      this.loading = true
      let data = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }
      this.$service(AccountList.accountList, {
        method: 'post',
        data: Object.assign(data, this.searchQuery)
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.records || []
            this.pageCount = res.data.page.pageCount
            this.pageIndex = res.data.page.pageIndex
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    bind ($event, data) {
      this.$service(AccountList.accountBind, {
        method: 'post',
        data: {
          accountBindId: data.accountBindId,
          status: data.status === 1 ? 0 : 1
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.getList()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
