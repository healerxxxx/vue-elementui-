<template>
  <div class="blacklist">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input
          placeholder="用户ID/通行证"
          prefix-icon="el-icon-search"
          clearable
          v-model="keyWord"
          size="small"
          style="width:auto;">
        </el-input>
        <el-button type="primary" size="small" @click="getList">搜索</el-button>
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
        width="120">
      </el-table-column>
      <el-table-column
        prop="account"
        label="用户账号"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="nickname"
        label="昵称"
        min-width="120">
      </el-table-column>
      <!-- <el-table-column
        prop="phone"
        label="手机号"
        width="100">
      </el-table-column> -->
      <el-table-column
        prop="registerTime"
        label="注册时间"
        width="150">
      </el-table-column>
      <el-table-column
        prop="ip"
        label="IP"
        width="100">
      </el-table-column>
      <el-table-column
        prop="listType"
        label="黑名单类型"
        width="100">
        <template slot-scope="scope">
          {{scope.row.listType | type2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="黑名单状态"
        width="100">
        <template slot-scope="scope">
          {{scope.row.status | status2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定添至白名单送500积分？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="blackToWhite(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" size="small">添至白名单送500积分</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { UserBlacklist } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'blacklist',
  data () {
    return {
      loading: false,
      keyWord: '',
      list: [],
      tableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  filters: {
    status2CH (val) {
      let dict = {
        0: '正常',
        1: '黑名单',
        2: '白名单'
      }
      return dict[val] || '-'
    },
    type2CH (val) {
      let dict = {
        1: 'URS风控'
      }
      return dict[val] || '-'
    }
  },
  created () {
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList () {
      if (!this.keyWord) {
        this.list = []
        return
      }
      if (this.loading) return
      this.loading = true
      this.$service(UserBlacklist.query, {
        params: {
          keyWord: this.keyWord
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    blackToWhite (data) {
      this.$set(data, 'loading', true)
      this.$service(UserBlacklist.toWhite, {
        params: {
          blackListId: data.blackListId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('添加白名单成功')
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
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
