<template>
  <div class="app-version">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" @click="versionPop()">新建版本</el-button>
        <el-button type="primary" size="mini" @click="versionPop('all')">批量更新版本信息</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="versionDescId"
        label="ID"
        width="60">
      </el-table-column>
      <el-table-column
        prop="versionChannel"
        label="渠道号"
        width="120">
        <template slot-scope="scope">
          {{scope.row.versionChannel ? scope.row.versionChannel : '官网包'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题"
        min-width="140">
      </el-table-column>
      <el-table-column
        prop="versionCode"
        label="build值"
        width="120">
      </el-table-column>
      <el-table-column
        prop="apkUrl"
        label="安装包路径"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="content"
        label="升级信息"
        min-width="160">
        <template slot-scope="scope">
          <span v-html="scope.row.content"></span>
        </template>
      </el-table-column>
      <el-table-column
        prop="operator"
        label="最后操作人"
        width="160">
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="130">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="versionPop(scope.row)"></el-button>
          <el-popover
            v-if="scope.row.versionChannel"
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="versionDel(scope.row)">确定</el-button>
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
      :current-page.sync="Math.floor(offset/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      :title="form.versionDescId ? '修改版本信息' : form.all ? '批量更新版本信息' : '新增版本信息'"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :disabled="updateLoading" ref="versionForm" label-width="140px" style="max-width:600px">
        <el-form-item
          prop="versionChannel"
          label="渠道号"
          v-show="!form.gw&&!form.all"
          :rules="[{required: !form.gw&&!form.all, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[A-Za-z0-9_-]{1,}$/, message: '必须为数字、字幕或-_组成', trigger: ['blur', 'change']}]">
          <el-input v-model="form.versionChannel"></el-input>
        </el-form-item>
        <el-form-item prop="title" label="标题" :rules="[{required: true, message: '请输入标题', trigger: ['blur', 'change']}]">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="versionCode" label="版本build值" :rules="buildRules">
          <el-input v-model.number="form.versionCode" :max="4294967295" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="apkUrl" v-show="!form.all" label="Android安装包路径" :rules="[{required: !form.all, message: '请输入路径', trigger: ['blur', 'change']}]">
          <el-input v-model="form.apkUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="版本升级信息" :rules="[{required: true, message: '请输入版本升级信息', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" placeholder="版本信息" v-model="form.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('versionForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AppVersion } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'Version',
  data () {
    return {
      activeTab: '0',
      loading: false,
      list: [],
      offset: 0,
      limit: 25,
      total: 1,
      dialogFormVisible: false,
      updateLoading: false,
      tableHeight: null,
      form: {
        versionChannel: '',
        title: '',
        versionCode: '',
        apkUrl: '',
        content: ''
      },
      buildRules: [
        {required: true, message: '请输入build值', trigger: ['blur', 'change']},
        {type: 'number', message: 'build值必须为正整数', trigger: ['blur', 'change']},
        {validator: (rule, value, callback) => {
          if (value > 4294967295) {
            callback(new Error('build值最大不超过4294967295'))
          } else {
            callback()
          }
        },
        trigger: ['blur', 'change']}
      ]
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
    handleClickTabs (tab, event) {
      this.list = []
      this.getList()
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      this.$service(AppVersion[this.activeTab].list, {
        params: {
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
          this.list = res.data.data || []
          this.total = res.data.total ? res.data.total : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    versionDel (data) {
      this.$set(data, 'loading', true)
      this.$service(AppVersion[this.activeTab].del, {
        method: 'post',
        data: {
          versionDescId: data.versionDescId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    versionPop (data) {
      if (data && data.versionDescId) {
        this.form = Object.assign({}, data)
        this.form.content = this.form.content.replace(/<br(\/)?(\s)?>/g, '\n')
        if (!data.versionChannel) this.form['gw'] = true
      } else if (data) {
        this.form = {
          all: true,
          title: '',
          versionCode: '',
          content: ''
        }
      } else {
        this.form = {
          versionChannel: '',
          title: '',
          versionCode: '',
          apkUrl: '',
          content: ''
        }
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.versionForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {
            title: this.form.title,
            content: this.form.content,
            versionCode: this.form.versionCode
          }
          if (!this.form.all) {
            if (!this.form.gw) _data['versionChannel'] = this.form.versionChannel
            _data['apkUrl'] = this.form.apkUrl.replace(/\?.*/, '')
          }
          if (this.form.versionDescId) {
            _data['versionDescId'] = this.form.versionDescId
          }
          this.updateLoading = true
          this.$service(this.form.versionDescId ? AppVersion[this.activeTab].update : this.form.all ? AppVersion[this.activeTab].updateAll : AppVersion[this.activeTab].add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getList(Math.floor(this.offset / this.limit) + 1, true)
              this.$message.success(this.form.versionDescId || this.form.all ? '更新成功' : '添加成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
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
