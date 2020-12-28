<template>
  <div class="market-channel-group">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="channelGroupPop()">新建渠道组</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="appleChannelGroupId"
        label="渠道组ID"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="channelGroupName"
        label="渠道组名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="channelGroupPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="channelGroupDel(scope.row)">确定</el-button>
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
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.appleChannelGroupId?'修改渠道组':'添加渠道组'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" size="small" ref="channelGroupForm">
        <el-form-item label="渠道号" prop="channelGroupName">
          <el-input v-model="form.channelGroupName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('channelGroupForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MarketChannelGroup } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'marketChannelGroup',
  data () {
    return {
      activeTab: 0,
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {
        channelGroupName: ''
      },
      formRules: {
        channelGroupName: [
          {required: true, message: '请输入渠道号', trigger: ['blur', 'change']},
          {max: 20, message: '长度不多于20个字符', trigger: ['blur', 'change']}
        ]
      },
      updateLoading: false
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
    handleClickTabs () {
      this.list = []
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || this.pageIndex
      this.$service(MarketChannelGroup[this.activeTab].list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    channelGroupPop (data) {
      this.form = Object.assign({}, data || {channelGroupName: ''})
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.channelGroupForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(this.form.appleChannelGroupId ? MarketChannelGroup[this.activeTab].update : MarketChannelGroup[this.activeTab].add, {
            method: 'post',
            urlParams: this.form.appleChannelGroupId ? {appleChannelGroupId: this.form.appleChannelGroupId} : null,
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getList(this.pageIndex)
              this.$message.success((this.form.appleChannelGroupId ? '更新' : '添加') + '成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    channelGroupDel (data) {
      this.$set(data, 'loading', true)
      this.$service(MarketChannelGroup[this.activeTab].del, {
        method: 'post',
        urlParams: {
          appleChannelGroupId: data.appleChannelGroupId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
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
