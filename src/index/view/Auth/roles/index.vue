<template>
  <div class="auth-roles">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="rolesPop()">添加角色</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="roleId"
        label="ID"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="roleName"
        label="角色名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="description"
        label="角色描述"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="seq"
        label="角色排序号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="status"
        label="角色状态"
        min-width="160">
        <template slot-scope="scope">
          {{status2CH[scope.row.status] || '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        min-width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="getResourceListById(scope.row.roleId)">授权</el-button>
          <el-button icon="el-icon-edit" size="small" @click="rolesPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="rolesDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getRolesList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.roleId?'修改角色':'添加角色'" :close-on-click-modal="false" :visible.sync="dialogFormRoles" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" ref="rolesForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色排序" prop="seq">
          <el-input-number v-model="form.seq" :min="0" :max="9999"></el-input-number>
        </el-form-item>
        <el-form-item label="角色状态" prop="status">
          <el-radio v-model="form.status" label="0">正常</el-radio>
          <el-radio v-model="form.status" label="1">停用</el-radio>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="角色描述"
            v-model="form.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormRoles = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('rolesForm')">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="角色授权" :close-on-click-modal="false" :visible.sync="dialogResource" width="600px" center size="small">
      <el-table
        :data="allResourceList"
        tooltip-effect="dark"
        size="small"
        max-height="350"
        style="width: 100%"
        stripe
        ref="resourceTable">
        <el-table-column
          width="50">
          <template slot="header" slot-scope="scope">
            <el-checkbox :indeterminate="isIndeterminate" v-model="resourceCheckAll" @change="handleCheckResourceChange()"></el-checkbox>
          </template>
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.check" @change="handleCheckResourceChange(scope.row)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          prop="resourceName"
          label="接口名称"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="url"
          label="接口地址"
          show-overflow-tooltip>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogResource = false">取消</el-button>
        <el-button type="primary" :loading="resourceLoading" @click="submitResource">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AuthRoles, AuthApi } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'Roles',
  data () {
    return {
      list: [],
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      status2CH: {
        0: '正常',
        1: '停用'
      },
      dialogFormRoles: false,
      tableHeight: null,
      form: {
        roleName: '',
        seq: 0,
        status: '0',
        description: ''
      },
      formRules: {
        roleName: [{required: true, message: '角色名称必填', trigger: 'blur'}],
        description: [{required: true, message: '角色描述必填', trigger: 'blur'}]
      },
      updateLoading: false,
      resourceLoading: false,
      dialogResource: false,
      allResourceList: [],
      resourceIds: [],
      roleId: null
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    isIndeterminate () {
      return this.resourceIds.length > 0 && this.resourceIds.length < this.allResourceList.length
    },
    resourceCheckAll () {
      return this.resourceIds.length > 0 && this.resourceIds.length >= this.allResourceList.length
    }
  },
  created () {
    this.getRolesList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getRolesList (pageIndex) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = pageIndex || this.pageIndex
      this.$service(AuthRoles.rolesList, {
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
    rolesPop (data) {
      if (data) {
        this.form = Object.assign({}, data)
        this.form.status = this.form.status + ''
      } else {
        this.form = Object.assign({}, {roleName: '', seq: 0, status: '0', description: ''})
      }
      this.dialogFormRoles = true
      this.$nextTick(() => {
        this.$refs.rolesForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.rolseUpdate(this.form)
        }
      })
    },
    rolseUpdate (data) {
      if (this.updateLoading) return
      this.updateLoading = true
      this.$service(data.roleId ? AuthRoles.rolesUpdate : AuthRoles.rolesAdd, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(data)
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          this.dialogFormRoles = false
          this.$message.success((data.roleId ? '修改' : '添加') + '成功。')
          if (!data.roleId) {
            this.pageIndex = 1
          }
          this.getRolesList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    /**
     * @description: 根据ID删除某个角色
     * @param {Number} roleId 角色ID
     */
    rolesDel (data) {
      this.$set(data, 'loading', true)
      this.$service(AuthRoles.rolesDel, {
        method: 'delete',
        params: {
          roleId: data.roleId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getRolesList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getAllResourceList () {
      if (this.allResourceList.length > 0) {
        return Promise.resolve()
      } else {
        return this.$service(AuthApi.apiList, {
          params: {
            pageIndex: 1,
            pageSize: 999
          }
        }).then(res => {
          if (res.code === 200) {
            this.allResourceList = res.data.records || []
            return Promise.resolve()
          } else {
            return Promise.reject(res)
          }
        }, err => {
          return Promise.reject(err)
        })
      }
    },
    getResourceListById (id) {
      this.getAllResourceList().then(() => {
        this.$service(AuthRoles.resourceById, {
          params: {
            roleId: id
          }
        }).then(res => {
          if (res.code === 200) {
            this.resourceIds = []
            res.data.forEach(item => {
              this.resourceIds.push(item.resourceId)
            })
            this.allResourceList.forEach(item => {
              this.$set(item, 'check', this.resourceIds.indexOf(item.resourceId) > -1)
            })
            this.dialogResource = true
            this.roleId = id
            this.$nextTick(() => {
              this.$refs.resourceTable.bodyWrapper.scrollTop = 0
            })
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    handleCheckResourceChange (data) {
      if (data) {
        if (!data.check) {
          if (this.resourceIds.indexOf(data.resourceId) > -1) {
            this.resourceIds.splice(this.resourceIds.indexOf(data.resourceId), 1)
          }
        } else {
          if (this.resourceIds.indexOf(data.resourceId) < 0) {
            this.resourceIds.push(data.resourceId)
          }
        }
      } else {
        if (this.resourceCheckAll) {
          this.resourceIds = []
          this.allResourceList.forEach(item => {
            item['check'] = false
          })
        } else {
          this.resourceIds = []
          this.allResourceList.forEach(item => {
            item['check'] = true
            this.resourceIds.push(item.resourceId)
          })
        }
      }
    },
    submitResource () {
      if (this.resourceLoading) return
      let _data = {
        roleId: this.roleId,
        resourceIds: this.resourceIds.join(',')
      }
      this.resourceLoading = true
      this.$service(AuthRoles.resourceByIdUpdate, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(_data)
      }).then(res => {
        this.resourceLoading = false
        if (res.code === 200) {
          this.roleId = null
          this.dialogResource = false
          this.$message.success('角色授权成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.resourceLoading = false
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
