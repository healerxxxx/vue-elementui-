<template>
  <div class="message-condition">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="conditionPop()">新建触发条件</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="conditionId"
        label="条件ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="conditionCode"
        label="条件码"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="conditionName"
        label="条件名称"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="conditionDesc"
        label="条件描述"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="relateTempletTitle"
        label="关联消息模板"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status==='NORMAL'?'正常':'失效'}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="conditionPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="conditionDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-switch
            v-show="scope.row.useStatus==='USE_IN'"
            v-model="scope.row.useStatus"
            :disabled="scope.row.statusLoading"
            :active-value="'USE_IN'"
            :inactive-value="'USE_STOP'"
            @click.native="switchStatus(scope.row)">
          </el-switch>
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
    <el-dialog
      :title="form.conditionId?'修改触发条件':'新建触发条件'"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        size="small"
        label-width="110px"
        ref="form"
        v-loading="codeListLoading||templateListLoading"
        :element-loading-text="codeListLoading?'条件码列表加载中...':templateListLoading?'消息模板加载中...':''"
        element-loading-spinner="el-icon-loading">
        <el-form-item
          label="条件名称"
          prop="conditionName"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.conditionName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="条件描述"
          prop="conditionDesc"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 50, message: '最多50个字符', trigger: ['blur', 'change']}]">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="条件描述"
            v-model="form.conditionDesc">
          </el-input>
        </el-form-item>
        <el-form-item label="关联条件码" prop="newConditionCode" v-show="!form.conditionId">
          <el-radio v-model="form.newConditionCode" label="1">生成新条件码</el-radio>
          <el-radio v-model="form.newConditionCode" label="0" @change="getCodeList">使用已有条件码</el-radio>
        </el-form-item>
        <el-form-item
          v-show="form.newConditionCode === '0'&&!codeListLoading"
          label="选择条件码"
          prop="conditionCode"
          :rules="{required: form.newConditionCode === '0', message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="form.conditionCode" placeholder="请选择">
            <el-option
              v-for="(item, index) in codeList"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="form.useStatus === 'USE_IN'"
          label="关联消息模板"
          prop="relateTempletId"
          :rules="{required: form.useStatus === 'USE_IN', message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="form.relateTempletId" placeholder="请选择">
            <el-option
              v-for="(item, index) in templateList"
              :key="index"
              :label="item.title"
              :value="item.templetId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="useStatus">
          <el-select v-model="form.useStatus" placeholder="请选择" @change="getTemplateList">
            <el-option label="启用" value="USE_IN"></el-option>
            <el-option label="停用" value="USE_STOP"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MessageCondition } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'messageCondition',
  data () {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      form: {
        conditionName: '',
        conditionDesc: '',
        newConditionCode: '1',
        conditionCode: '',
        relateTempletId: '',
        useStatus: 'USE_IN'
      },
      updateLoading: false,
      dialogFormVisible: false,
      codeList: [],
      templateList: [],
      codeListLoading: false,
      templateListLoading: false,
      tableHeight: null
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
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(MessageCondition.list, {
        urlParams: {
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
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        conditionId: data.conditionId,
        useStatus: data.useStatus
      }
      this.$service(MessageCondition.status, {
        method: 'post',
        urlParams: _data
      }).then((res) => {
        data.statusLoading = false
        if (res.code === 200) {
          data.status = data.useStatus === 'USE_STOP' ? 'NOT_NORMAL' : 'NORMAL'
          data.relateTempletTitle = ''
          data.relateTempletId = ''
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'useStatus', data.useStatus === 'USE_STOP' ? 'USE_IN' : 'USE_STOP')
          this.$message.error(res.code + ':' + res.message)
        }
      }, (err) => {
        data.statusLoading = false
        this.$set(data, 'useStatus', data.useStatus === 'USE_STOP' ? 'USE_IN' : 'USE_STOP')
        this.$message.error(JSON.stringify(err))
      })
    },
    conditionDel (data) {
      this.$set(data, 'loading', true)
      this.$service(MessageCondition.del, {
        method: 'post',
        urlParams: {
          conditionId: data.conditionId
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
    },
    conditionPop (data) {
      this.codeListLoading = false
      this.codeList = []
      this.templateListLoading = false
      this.templateList = []
      this.form = Object.assign({
        conditionName: '',
        conditionDesc: '',
        newConditionCode: '1',
        conditionCode: '',
        relateTempletId: '',
        useStatus: 'USE_IN'
      }, data || {})
      if (data && data.relateTempletTitle === '') this.form.relateTempletId = ''
      if (data && data.useStatus === 'USE_STOP') {
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      } else {
        this.getTemplateList().then(() => {
          if (data && data.relateTempletId) this.templateList.splice(0, 0, {templetId: data.relateTempletId, title: data.relateTempletTitle})
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs.form.clearValidate()
          })
        })
      }
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          this.$service(this.form.conditionId ? MessageCondition.update : MessageCondition.add, {
            method: 'post',
            urlParams: this.form.conditionId ? {
              conditionId: this.form.conditionId
            } : null,
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.conditionId ? '修改' : '添加') + '成功')
              this.getList()
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
    getCodeList () {
      if (this.codeList.length > 0 || this.form.newConditionCode === '1') return
      this.codeListLoading = true
      this.$service(MessageCondition.codeList).then(res => {
        if (res.code === 200) {
          if (res.data.length === 0) {
            this.form.newConditionCode = '1'
            this.$message.warning('没有可用的条件码')
          } else {
            this.codeList = res.data
          }
          this.codeListLoading = false
        } else {
          this.form.newConditionCode = '1'
          this.$message.error('获取条件码失败')
        }
      }, err => {
        if (err) {
          this.codeListLoading = false
          this.form.newConditionCode = '1'
          this.$message.error('获取条件码失败')
        }
      })
    },
    getTemplateList () {
      if (this.templateList.length > 0) return
      this.templateListLoading = true
      return this.$service(MessageCondition.templateList).then(res => {
        this.templateListLoading = false
        if (res.code === 200) {
          this.templateList = res.data || []
          return Promise.resolve()
        } else {
          this.$message.error('获取消息模板失败，请稍后再试')
        }
      }, err => {
        this.templateListLoading = false
        if (err) this.$message.error('获取消息模板失败，请稍后再试')
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
