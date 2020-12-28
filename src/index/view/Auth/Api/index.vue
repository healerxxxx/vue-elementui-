<template>
  <div class="auth-api">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="apiPop()">添加资源</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="resourceName"
        label="资源名称"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="resourceType"
        label="资源类型"
        width="100">
        <template slot-scope="scope">
          {{resourceType2CH[scope.row.resourceType]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="资源状态"
        width="100">
        <template slot-scope="scope">
          {{status2CH[scope.row.status]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="url"
        label="资源路径"
        min-width="200">
      </el-table-column>
      <el-table-column
        prop="description"
        label="资源描述"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="apiPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="apiDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getApiList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.resourceId?'修改资源':'添加资源'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" ref="apiForm">
        <el-form-item label="资源名称" prop="resourceName">
          <el-input v-model="form.resourceName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="资源路径" prop="url">
          <el-input v-model="form.url" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-radio v-model="form.resourceType" label="0">菜单</el-radio>
          <el-radio v-model="form.resourceType" label="1">按钮</el-radio>
        </el-form-item>
        <el-form-item label="资源状态" prop="status">
          <el-radio v-model="form.status" label="0">正常</el-radio>
          <el-radio v-model="form.status" label="1">停用</el-radio>
        </el-form-item>
        <el-form-item label="角色排序" prop="seq">
          <el-input-number v-model="form.seq" :min="0" :max="99999"></el-input-number>
        </el-form-item>
        <el-form-item label="资源描述" prop="description">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="资源描述"
            v-model="form.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('apiForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AuthApi } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'Api',
  data () {
    return {
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      resourceType2CH: {
        0: '菜单',
        1: '按钮'
      },
      status2CH: {
        0: '正常',
        1: '停用'
      },
      dialogFormVisible: false,
      form: {
        resourceName: '',
        url: '',
        resourceType: '0',
        status: '0',
        seq: 0,
        description: ''
      },
      formRules: {
        resourceName: [{required: true, message: '资源名称必填', trigger: ['blur', 'change']}],
        url: [{required: true, message: '路径必填', trigger: ['blur', 'change']}],
        description: [{required: true, message: '资源描述必填', trigger: ['blur', 'change']}]
      },
      updateLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getApiList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getApiList (pageIndex) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = pageIndex || this.pageIndex
      this.$service(AuthApi.apiList, {
        params: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    apiPop (data) {
      if (data) {
        this.form = Object.assign({}, data)
        this.form.resourceType = this.form.resourceType + ''
        this.form.status = this.form.status + ''
      } else {
        this.form = Object.assign({}, {resourceName: '', url: '', resourceType: '0', status: '0', seq: 0, description: ''})
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.apiForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.apiUpdate(this.form)
        } else {
          return false
        }
      })
    },
    apiUpdate (data) {
      if (this.updateLoading) return
      this.updateLoading = true
      let _data = Object.assign({icon: '1.jpg', pid: 0}, data)
      this.$service(data.resourceId ? AuthApi.apiUpdate : AuthApi.apiAdd, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(_data)
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          this.dialogFormVisible = false
          this.$message.success((data.resourceId ? '修改' : '添加') + '成功。')
          if (!data.resourceId) {
            this.pageIndex = 1
          }
          this.getApiList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    apiDel (data) {
      this.$set(data, 'loading', true)
      this.$service(AuthApi.apiDel, {
        method: 'delete',
        params: {
          resourceId: data.resourceId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getApiList()
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
