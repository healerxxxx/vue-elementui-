<template>
  <div class="message-category">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="categoryPop()">新建类别</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="msgTypeId"
        label="ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="msgTypeName"
        label="名称"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="icon"
        label="icon"
        min-width="130">
        <template slot-scope="scope">
          <img v-if="scope.row.icon" :src="scope.row.icon + '?imageView&thumbnail=36y36&quality=85'">
        </template>
      </el-table-column>
      <el-table-column
        prop="isDel"
        label="状态"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.isDel ? '停用' : '启用'}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        min-width="180">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="categoryPop(scope.row)"></el-button>
          <el-switch
            v-if="scope.row.msgTypeId!=1"
            v-model="scope.row.isDel"
            :disabled="scope.row.statusLoading"
            :active-value="false"
            :inactive-value="true"
            @click.native="switchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(start/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      :title="form.msgTypeId?'修改类别':'新建类别'"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        size="small"
        label-width="80px"
        ref="form">
        <el-form-item
          label="名称"
          prop="msgTypeName"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.msgTypeName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon" :rules="{required: true, message: '不为空', trigger: 'blur'}">
          <el-upload
            class="icon-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadIcon"
            :before-upload="beforeIconUpload">
            <img v-if="form.icon" :src="form.icon + '?imageView&thumbnail=64y64&quality=85'" class="icon">
            <i v-else class="el-icon-plus icon-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">图片尺寸：36×36</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态" prop="isDel">
          <el-select v-model="form.isDel">
            <el-option label="启用" value="0"></el-option>
            <el-option label="停用" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MessageCategory } from '../../../util/api'
import { uploadImg } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'messageCategory',
  data () {
    return {
      loading: false,
      start: 0,
      limit: 25,
      total: 1,
      list: [],
      form: {
        msgTypeName: '',
        icon: '',
        isDel: '0'
      },
      updateLoading: false,
      dialogFormVisible: false,
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
      this.start = page ? (page - 1) * this.limit : 0
      this.$service(MessageCategory.list, {
        urlParams: {
          start: this.start,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.total = res.data.total || 1
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
        msgTypeId: data.msgTypeId,
        isDel: data.isDel ? 1 : 0
      }
      this.$service(MessageCategory.status, {
        method: 'post',
        data: _data
      }).then((res) => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'isDel', !data.isDel)
          this.$message.error(res.code + ':' + res.message)
        }
      }, (err) => {
        data.statusLoading = false
        this.$set(data, 'isDel', !data.isDel)
        this.$message.error(JSON.stringify(err))
      })
    },
    beforeIconUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    uploadIcon (data) {
      uploadImg(data.file, 'user').then(res => {
        this.form.icon = res
      }, err => {
        if (err) this.$message.error('上传头像失败，请稍后再传！')
      })
    },
    categoryPop (data) {
      this.form = Object.assign({
        msgTypeName: '',
        icon: '',
        isDel: '0'
      }, data || {})
      if (data) this.form.isDel = this.form.isDel ? '1' : '0'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          this.$service(this.form.msgTypeId ? MessageCategory.update : MessageCategory.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.msgTypeId ? '修改' : '添加') + '成功')
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
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>

<style lang="scss">
.icon-uploader {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    float: left;
  }
  .el-upload:hover {
    border-color: #e62121;
  }
  .icon-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 64px;
    height: 64px;
    line-height: 64px;
    text-align: center;
  }
  .icon {
    width: 64px;
    height: 64px;
    display: block;
  }
}
</style>
