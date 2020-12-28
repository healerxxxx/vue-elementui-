<template>
    <div class="coupon-channel">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="channelPop()">新建渠道</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="appChannelId"
        label="ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="channelCode"
        label="渠道号"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="channelName"
        label="渠道名称"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="channelIcon"
        label="渠道icon"
        min-width="130">
        <template slot-scope="scope">
          <img v-if="scope.row.channelIcon" :src="scope.row.channelIcon + '?imageView&thumbnail=50y50&quality=85'">
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        min-width="80">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="channelPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="form.appChannelId?'修改渠道':'新建渠道'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        size="small"
        label-width="80px"
        ref="form">
        <el-form-item
          label="渠道号"
          prop="channelCode"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9a-zA-Z_-]{1,}$/, message: '仅支持字母、数字及_或-', trigger: ['blur', 'change']},
          {max: 50, message: '最多50个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.channelCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="渠道名称"
          prop="channelName"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 30, message: '最多30个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.channelName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="缩写字母"
          prop="abbr"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9a-zA-Z_-]{1,}$/, message: '仅支持字母、数字及_或-', trigger: ['blur', 'change']},
          {max: 10, message: '最多10个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.abbr" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="channelIcon" :rules="{required: true, message: '不为空', trigger: 'blur'}">
          <el-upload
            class="single-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadSingleImg"
            :before-upload="beforeImgUpload">
            <img v-if="form.channelIcon" :src="form.channelIcon + '?imageView&thumbnail=98y98&quality=85'" class="single-img">
            <i v-else class="el-icon-plus single-uploader-icon"></i>
          </el-upload>
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
import { CouponChannel } from '../../../util/api'
import { uploadImg } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'couponChannel',
  data () {
    return {
      loading: false,
      list: [],
      form: {
        channelCode: '',
        channelName: '',
        abbr: '',
        channelIcon: ''
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
    getList () {
      if (this.loading) return
      this.loading = true
      this.$service(CouponChannel.list).then(res => {
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
    beforeImgUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传ICON大小不能超过 5MB!')
        return false
      }
    },
    uploadSingleImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.form.channelIcon = res
      }, err => {
        if (err) this.$message.error('上传ICON失败，请稍后再传！')
      })
    },
    channelPop (data) {
      this.form = Object.assign({
        channelCode: '',
        channelName: '',
        abbr: '',
        channelIcon: ''
      }, data || {})
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(this.form.appChannelId ? CouponChannel.update : CouponChannel.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.appChannelId ? '修改' : '添加') + '成功')
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
