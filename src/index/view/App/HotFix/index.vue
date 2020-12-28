<template>
  <div class="app-hot-fix">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="hotFixPop()">添加热修复</el-button>
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
        prop="hotfixId"
        label="ID"
        width="60">
      </el-table-column>
      <el-table-column
        prop="versionName"
        label="版本号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="packageUrl"
        label="增量包地址"
        min-width="200">
        <template slot-scope="scope">
          {{scope.row.packageUrl}}
        </template>
      </el-table-column>
      <el-table-column
        prop="channelIds"
        label="渠道号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="operator"
        label="操作者"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="loginTime"
        label="最后登录时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="130">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="hotFixPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="hotFixDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getHotFixList"
      :current-page="Math.floor(offset/limit) + 1"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.hotfixId?'修改热修复':'添加热修复'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="90px" ref="hotFixForm">
        <el-form-item label="版本号" prop="versionName">
          <el-input v-model="form.versionName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="build号" prop="versionCode">
          <el-input v-model.number="form.versionCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="全渠道">
          <el-checkbox v-model="form.isAll"></el-checkbox>
        </el-form-item>
        <el-form-item label="渠道号" prop="channelIds" :rules="[{required: !this.form.isAll, message: '渠道号必填', trigger: 'blur'}]" v-show="!form.isAll">
          <el-input v-model="form.channelIds" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="增量包链接" v-if="form.hotfixId" class="word-break">
          {{form.packageUrl}}
        </el-form-item>
        <el-form-item label="增量包" prop="file">
          <el-upload
            limit="1"
            accept=".apk"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传apk文件</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="操作人" v-if="form.hotfixId">
          <el-input v-model="form.operator" disabled="true" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('hotFixForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AppHotFix } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'HotFix',
  data () {
    return {
      activeTab: 0,
      list: [],
      offset: 0,
      limit: 2,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      form: {
        versionName: '',
        versionCode: '',
        isAll: true,
        file: null,
        channelIds: ''
      },
      formRules: {
        versionName: [{required: true, message: '版本号必填', trigger: 'blur'}],
        versionCode: [{required: true, message: 'build号必填', trigger: 'blur'}, {type: 'number', message: 'build号必须为数字值'}],
        file: [
          {
            validator: (rule, value, callback) => {
              if (!this.form.hotfixId && !this.form.file) {
                callback(new Error('增量包必选'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      dialogFormVisible: false,
      updateLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getHotFixList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    handleClickTabs () {
      this.offset = 0
      this.pageCount = 1
      this.list = []
      this.getHotFixList()
    },
    handleFileExceed () {
      this.$message.warning('请先移除增量包列表里的文件。')
    },
    handleFileRemove (file) {
      this.form.file = null
    },
    handleFileChange (file, fileList) {
      this.form.file = file.raw
    },
    getHotFixList (page, noScroll) {
      if (this.loading) return
      this.offset = page ? (page - 1) * this.limit : this.offset
      this.loading = true
      this.$service(AppHotFix[this.activeTab].hotFixList, {
        urlParams: {
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
          this.list = res.data.records || []
          this.pageCount = res.data.page ? res.data.page.pageCount : 1
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
    hotFixPop (data) {
      if (data) {
        this.form = Object.assign({}, data)
        this.$set(this.form, 'isAll', data.channelIds === 'all')
        if (data.channelIds === 'all') {
          this.form.channelIds = ''
        }
      } else {
        this.form = Object.assign({}, {versionName: '', versionCode: '', isAll: true, file: null, channelIds: ''})
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.hotFixForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.hotFixUpdate(this.form)
        }
      })
    },
    hotFixUpdate (data) {
      if (data.isAll) {
        data.channelIds = ''
      } else {
        /* eslint-disable */
        data.channelIds = data.channelIds.replace(/\;|\；|\,|\，|\s/g, ',')
        /* eslint-disable */
      }
      let _data = new FormData()
      if (data.hotfixId) {
        _data.append('hotfixId', data.hotfixId)
      }
      _data.append('versionName', data.versionName)
      _data.append('versionCode', data.versionCode)
      _data.append('isAll', data.isAll)
      _data.append('channelIds', data.channelIds)
      if (data.file) {
        _data.append('packageUrl', data.file)
      } else {
        _data.append('packageUrl', data.packageUrl)
      }
      this.updateLoading = true
      this.$service(data.hotfixId ? AppHotFix[this.activeTab].hotFixUpdate : AppHotFix[this.activeTab].hotFixAdd, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: _data
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          this.dialogFormVisible = false
          this.$message.success((data.hotfixId ? '修改' : '添加') + '成功')
          if (!data.hotfixId) {
            this.offset = 0
          }
          this.getHotFixList(Math.floor(this.offset / this.limit) + 1, !!data.hotfixId)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    hotFixDel (data) {
      this.$set(data, 'loading', true)
      this.$service(AppHotFix[this.activeTab].hotFixDel, {
        method: 'post',
        urlParams: {
          hotfixId: data.hotfixId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getHotFixList(Math.floor(this.offset / this.limit) + 1, true)
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
