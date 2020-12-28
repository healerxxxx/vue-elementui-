<template>
  <div class="chatroom-expert">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary"
          size="mini"
          @click="openDiaLog('add')">新增驻场专家</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="matchVSData"
        label="赛事对阵"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="matchInfoId"
        label="赛事ID"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="expertNicknames"
        label="驻场专家"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="chatRoomOpenTime"
        label="聊天室开放时间"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="操作"
        width="210">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="deleteExpert(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="edit(scope.row)"></el-button>
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
    <el-dialog :title="dialogIsEdit ? '修改驻场专家' : 新增驻场专家" :visible.sync="dialogVisible" center>
      <el-form :model="expertForm" ref="expertForm">
        <el-form-item label="赛事ID:" label-width="110px" prop="matchInfoId"
          :rules="[{ required: true, message: '赛事ID不能为空', trigger: 'blur' }]">
          <el-input v-model="expertForm.matchInfoId" autocomplete="off" :disabled="dialogIsEdit"></el-input>
        </el-form-item>
        <el-form-item label="驻场专家1 ID:" label-width="110px" prop="expert_1"
          :rules="[{ validator: expert1_rule, message: '请填写专家ID', trigger: 'blur' }]">
          <el-input v-model="expertForm.expert_1"></el-input>
        </el-form-item>
        <el-form-item label="驻场专家2 ID:" label-width="110px" prop="expert_2">
          <el-input v-model="expertForm.expert_2"></el-input>
        </el-form-item>
        <el-form-item label="首页推荐:" label-width="110px">
          <el-checkbox-group v-model="expertForm.status">
            <el-checkbox label="该赛事推荐在红彩首页" name="type"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit" size="mini">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { ChatroomExpert } from '../../../util/api'
export default {
  name: 'ChatroomExpert',
  data () {
    return {
      tableHeight: 0,
      dialogVisible: false,
      dialogIsEdit: false,
      pageIndex: 1,
      pageSize: 20,
      loading: false,
      pageCount: 1,
      list: [],
      expertForm: {
        matchInfoId: '',
        expert_1: '',
        expert_2: '',
        status: false
      }
    }
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.$store.state.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    expert1_rule (rule, value, callback) {
      if (value === '' && !this.expertForm.expert_2) {
        callback(new Error('请填入至少一个驻场专家'))
      } else {
        callback()
      }
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(ChatroomExpert.list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          // !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    openDiaLog (type) {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['expertForm'].clearValidate()
      })
      if (type === 'add') {
        this.$nextTick(() => {
          this.$refs['expertForm'].resetFields()
        })
        this.dialogIsEdit = false
      } else {
        this.dialogIsEdit = true
        this.dialogVisible = true
      }
    },
    submit () {
      this.$refs['expertForm'].validate(valid => {
        if (valid) {
          const data = {}
          data.matchInfoId = this.expertForm.matchInfoId
          data.expertIds = ''
          if (this.expertForm.expert_1) data.expertIds += this.expertForm.expert_1
          if (this.expertForm.expert_2) {
            if (data.expertIds) data.expertIds += ','
            data.expertIds += this.expertForm.expert_2
          }
          data.status = this.expertForm.status ? 1 : 0
          if (this.dialogIsEdit) {
            this.operate('edit', data)
          } else {
            this.operate('add', data)
          }
        }
      })
    },
    operate (type, data) {
      const url = type === 'add' ? ChatroomExpert.add : ChatroomExpert.edit
      this.$service(url, {
        method: 'post',
        data: data
      }).then(res => {
        if (res.code === 200) {
          this.$message.success(type === 'add' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    edit (row) {
      this.expertForm.matchInfoId = row.matchInfoId
      this.expertForm.status = !!row.status
      this.expertForm.expert_1 = row.expertIds[0]
      this.expertForm.expert_2 = row.expertIds[1] || ''
      this.openDiaLog()
    },
    deleteExpert (row) {
      this.$set(row, 'loading', true)
      this.$service(ChatroomExpert.delete, {
        method: 'post',
        urlParams: {
          statusExtendId: row.statusExtendId
        }
      }).then(res => {
        row.loading = false
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
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
