<template>
  <div class="auth-users">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="userPop()">添加用户</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="loginName"
        label="账号"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="adminName"
        label="姓名"
        min-width="120">
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
          {{[scope.row.loginTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="rolesList"
        label="角色"
        min-width="160">
        <template slot-scope="scope">
          {{scope.row.rolesList | roles2String}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="userPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="userDel(scope.row)">确定</el-button>
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
    <el-dialog :title="form.adminId?'修改用户':'添加用户'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="400px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="mini" ref="userForm">
        <el-form-item
          label="用户姓名"
          prop="adminName"
          :rules="[{required: true, message: '请输入用户姓名', trigger: ['blur', 'change']},
          {max: 10, message: '最多10个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.adminName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="登录账号"
          prop="loginName"
          :rules="[{required: true, message: '请输入登录账号', trigger: ['blur', 'change']},
          {type: 'email', message: '邮箱格式错误', trigger: ['blur', 'change']}]">
          <el-input v-model="form.loginName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="角色"
          prop="roleIds"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="form.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('userForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AuthUser, AuthRoles, CommonApi } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'Users',
  data () {
    return {
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      rolesList: [],
      dialogFormVisible: false,
      loading: false,
      updateLoading: false,
      tableHeight: null,
      form: {
        adminName: '',
        loginName: '',
        roleIds: []
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
  filters: {
    /**
     * @description: 将用户角色数组转换成字符串
     * @param {Array} val 需要过滤的数组
     * @return {String} 目标字符串
     */
    roles2String (val) {
      if (!val || val.length <= 0) return ''
      let _arr = []
      val.forEach(item => {
        _arr.push(item.roleName)
      })
      return _arr.join('、')
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    /**
     * @description: 列表
     * @param {Number} pageIndex 可为空
     */
    getList (pageIndex) {
      if (this.loading) return
      this.pageIndex = pageIndex || this.pageIndex
      this.loading = true
      this.$service(AuthUser.adminList, {
        params: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
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
    /**
     * @description: 获取后台的角色配置列表
     * @return: 返回一个成功Promise
     */
    getRolesList () {
      return this.$service(AuthRoles.rolesList, {
        params: {
          pageIndex: 1,
          pageSize: 999
        }
      }).then(res => {
        if (res.code === 200) {
          this.rolesList = res.data.records
          return Promise.resolve(res)
        }
      })
    },
    /**
     * @description: 从后台获取token
     * @return: 返回一个Promise
     */
    getToken () {
      return this.$service(CommonApi.token, {
        method: 'post'
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res)
        }
      }, err => {
        return Promise.reject(err)
      })
    },
    /**
     * @description: 新增或者修改管理员弹框
     * @param {Object} data 需要修改的管理员信息
     */
    userPop (data) {
      if (data) {
        data['roleIds'] = []
        data.rolesList.forEach(item => {
          data.roleIds.push(item.roleId)
        })
        this.form = Object.assign({}, data)
      } else {
        this.form = Object.assign({}, {adminName: '', loginName: '', roleIds: []})
      }
      if (this.rolesList.length <= 0) {
        this.getRolesList().then(res => {
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs.userForm.clearValidate()
          })
        })
      } else {
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.userForm.clearValidate()
        })
      }
    },
    /**
     * @description: form表单提交
     * @param {String} form 需要校验的form表单，通过ref定义
     * @return: 通过true || false 来确定弹窗是否消失
     */
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          if (!this.form.adminId) {
            this.getToken().then(token => {
              this.userUpdata(this.form, token)
            }, err => {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            })
          } else {
            this.userUpdata(this.form)
          }
        } else {
          return false
        }
      })
    },
    /**
     * @description: 更新管理员信息
     * @param {Object} data 需要提交的数据
     * @param {String} token 从服务器获取的token值
     */
    userUpdata (data, token) {
      let _data = {
        loginName: data.loginName,
        adminName: data.adminName,
        roleIds: data.roleIds.join(','),
        status: 0,
        password: '',
        adminType: 0,
        organizationId: 1
      }
      if (data.adminId) {
        _data['adminId'] = data.adminId
      }
      if (token) {
        _data['token'] = token
      }
      this.$service(data.adminId ? AuthUser.adminUpdate : AuthUser.adminAdd, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(_data)
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          this.dialogFormVisible = false
          this.$message.success((data.adminId ? '修改' : '添加') + '成功。')
          if (!data.adminId) {
            this.pageIndex = 1
          }
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    /**
     * @description: 根据ID删除某个管理员
     * @param {Number} adminId 管理员ID
     */
    userDel (data) {
      this.$set(data, 'loading', true)
      this.$service(AuthUser.adminDel, {
        method: 'delete',
        params: {
          adminId: data.adminId
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
