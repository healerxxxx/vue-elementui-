<template>
  <div class="chatroom-banned">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-dropdown @command="handleAppTabCommand">
          <el-button size="mini" type="primary">
            切换 - {{{0: '红彩', 1: '精准比分'}[appTab]}} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0">红彩</el-dropdown-item>
            <el-dropdown-item command="1">精准比分</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown @command="handleCommand" v-show="appTab.toString() === '0'">
          <el-button size="mini" type="primary">
            切换 - {{{'blockSomebody': '拉黑', 'ADUserLabel': '广告封禁'}[type]}} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="ADUserLabel">广告封禁</el-dropdown-item>
            <el-dropdown-item command="blockSomebody">拉黑</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="nav-tools">
      <div class="nav">
        <el-input
          placeholder="用户ID/账号"
          prefix-icon="el-icon-search"
          clearable
          v-model="inputSearch"
          size="mini"
          style="width:150px;"
          @clear="getList">
        </el-input>
        <el-button type="danger" size="mini" @click="getList(1, inputSearch)">搜索</el-button>
        <el-popover
          placement="bottom-start"
          width="300"
          trigger="click"
          @show="inputAdd = ''">
          <div class="el-popover-content">
            <el-input
              placeholder="用户ID/账号"
              clearable
              v-model="inputAdd"
              size="mini"
              style="width:180px;" />
            <el-button type="primary" size="mini" @click="bannedAdd">{{{'blockSomebody': '封禁', 'ADUserLabel': '打广告标签'}[type]}}</el-button>
          </div>
          <el-button type="primary" size="mini" slot="reference">点击快速操作</el-button>
        </el-popover>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="userId"
        label="用户ID"
        min-width="90">
      </el-table-column>
      <el-table-column
        prop="account"
        label="用户通行证"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="添加时间"
        width="170">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="adminName"
        label="添加人"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="bannedDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      :page-size="pageSize"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>
<script>
import { ChatroomBanned } from '../../../util/api'
export default {
  name: 'ChatroomBanned',
  data () {
    return {
      appTab: 0,
      type: 'ADUserLabel',
      tableHeight: 0,
      pageIndex: 1,
      pageSize: 20,
      loading: false,
      pageCount: 1,
      list: [],
      inputSearch: '',
      inputAdd: '',
      inputAddLoading: ''
    }
  },
  computed: {
    ChatroomBannedApi () {
      return ChatroomBanned[this.appTab]
    }
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    handleAppTabCommand (val) {
      if (this.appTab.toString() !== val.toString()) {
        this.appTab = val
        if (this.appTab.toString() === '1') {
          this.type = 'blockSomebody'
        }
        this.getList()
      }
    },
    handleCommand (val) {
      if (this.type !== val) {
        this.type = val
        this.getList()
      }
    },
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.$store.state.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (page, user) {
      if (this.loading || (user !== undefined && !user)) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(this.ChatroomBannedApi.list, {
        urlParams: {
          type: this.type,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: user || this.inputSearch ? {
          userIdOrAccount: user
        } : {}
      }).then(res => {
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    bannedAdd () {
      if (!this.inputAdd) {
        return this.$message.warning('请输入要封禁的用户ID/通行证')
      }
      if (this.inputAddLoading) return
      this.inputAddLoading = true
      this.$service(this.ChatroomBannedApi.add, {
        method: 'post',
        urlParams: {
          type: this.type
        },
        data: {
          userIdOrAccount: this.inputAdd,
          adminId: this.$store.state.userInfo.adminId,
          adminName: this.$store.state.userInfo.userName
        }
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('新增封禁成功')
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.inputAddLoading = false
      }).catch(err => {
        this.inputAddLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    bannedDel (row) {
      this.$set(row, 'loading', true)
      this.$service(this.ChatroomBannedApi.del, {
        method: 'post',
        urlParams: {
          type: this.type
        },
        data: {
          userIdOrAccount: row.userId,
          adminId: this.$store.state.userInfo.adminId,
          adminName: this.$store.state.userInfo.userName
        }
      }).then(res => {
        row.loading = false
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.getList(this.page)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }).catch(err => {
        row.loading = false
        this.$message.error(JSON.stringify(err))
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
