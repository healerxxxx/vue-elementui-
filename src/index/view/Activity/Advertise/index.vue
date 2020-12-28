<template>
  <div class="activity-advertise">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" @click="activityPop()">创建广告</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="advertisingId"
        label="广告ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="广告创建时间"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.createTime ? dateFormat(scope.row.createTime) : ''}}
        </template>
      </el-table-column>
      <el-table-column
        prop="advertType"
        label="广告位置"
        width="150">
        <template slot-scope="scope">
          {{position(scope.row.advertType)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="广告摘要"
        min-width="180">
      </el-table-column>
      <el-table-column
        prop="adminName"
        label="创建人"
        width="160">
      </el-table-column>
      <el-table-column
        label="操作"
        width="230">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="activityPop(scope.row, haspop)"></el-button>
          <el-switch
            v-model="scope.row.del"
            :disabled="scope.row.statusLoading"
            :active-value= "false"
            :inactive-value= "true"
            @click.native="switchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="form.advertisingId?'修改广告':'创建广告'"
      :visible.sync="dialogFormVisible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="广告位置" prop="advertType"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']}]">
          <el-select v-model="form.advertType">
            <el-option :value="item.advertType" :label="item.name" v-for="(item,index) in advertiseTypeList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="广告摘要" prop="content"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max:15, message: '最多20个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.content" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="上传素材" prop="imgUrl"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-upload
            class="single-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadSingleImg"
            :before-upload="beforeImgUpload">
            <img v-if="form.imgUrl" :src="form.imgUrl + '?imageView&thumbnail=98y98&quality=85'" class="single-img">
            <i v-else class="el-icon-plus single-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item
          label="跳转类型"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}"
          prop="linkType">
          <el-select v-model="form.linkType" placeholder="请选择" @change="previewID">
            <el-option
              v-for="(item, index) in urlRedirectType"
              :key="index"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="parseInt(form.linkType) < 5 || parseInt(form.linkType) === 23 || parseInt(form.linkType) === 28 || parseInt(form.linkType) === 34"
          label="ID/URL"
          prop="linkContent"
          :rules="{validator: linkRules, trigger: ['blur', 'change']}">
          <el-input v-model="form.linkContent" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitActivity('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { Advertise } from '../../../util/api'
import { formatDate, validate } from '../../../util/tool'
import { uploadImg } from '../../../util/commonQuery'
import baseType from '../../../util/base'
export default {
  data () {
    return {
      loading: true,
      list: [],
      form: {},
      dialogFormVisible: false,
      advertiseTypeList: [],
      popType: null,
      updateLoading: false,
      urlRedirectType: baseType.urlRedirectType
    }
  },
  created () {
    this.getList()
    this.getAdvertiseTypeList()
  },
  methods: {
    position (type) {
      this.advertiseTypeList.forEach(item => {
        if (item.advertiseType === type) return item.name
      })
    },
    dateFormat (date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    getList () {
      this.$service(Advertise.list).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getAdvertiseTypeList () {
      this.$service(Advertise.advertiseTypeList).then(res => {
        if (res.code === 200) {
          this.advertiseTypeList = res.data
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    beforeImgUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    uploadSingleImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.$set(this.form, 'imgUrl', res)
      }, err => {
        if (err) this.$message.error('上传图片失败，请稍后再传！')
      })
    },
    linkRules (rule, value, callback) {
      if (parseInt(this.form.linkType) < 5 || parseInt(this.form.linkType) === 23 || parseInt(this.form.linkType) === 28 || parseInt(this.form.linkType) === 34) {
        if (parseInt(this.form.linkType) === 1 || parseInt(this.form.linkType) === 34) {
          if (!value) {
            callback(new Error('URL不为空'))
          } else if (!validate.url.test(value)) {
            callback(new Error('URL不合法'))
          } else {
            callback()
          }
        } else {
          if (!value) {
            callback(new Error('ID不为空'))
          } else if (/^\d+$/.test(value)) {
            callback()
          } else {
            callback(new Error('ID必须为数字'))
          }
        }
      } else {
        callback()
      }
    },
    activityPop (data) {
      if (!data) {
        this.form = {}
        this.popType = 'add'
      } else {
        this.popType = 'edit'
        this.form = Object.assign({}, data)
        const {content, del, advertisingId, imgUrl, linkType, linkContent, advertType} = data
        this.form = {content, del, advertisingId, imgUrl, linkType, linkContent, advertType}
        // this.updateActivity(params)
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitActivity (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          if (this.popType === 'add') {
            this.addActivity(this.form)
          } else {
            this.updateActivity(this.form)
          }
        }
      })
    },
    switchStatus (data) {
      this.getEditParam(data)
    },
    getEditParam (data) {
      this.$set(data, 'statusLoading', true)
      const {content, del, advertisingId, imgUrl, linkType, linkContent, advertType} = data
      let params = {content, del, advertisingId, imgUrl, linkType, linkContent, advertType}
      this.updateActivity(params, data, true)
    },
    addActivity (data) {
      this.$service(Advertise.add, {
        method: 'post',
        data: data
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          this.$message.success('新增成功')
          this.dialogFormVisible = false
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    updateActivity (data, dataItem, switchStatus) {
      this.$service(Advertise.update, {
        method: 'post',
        data: data
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          this.$message.success('修改成功')
          this.dialogFormVisible = false
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
          if (switchStatus) {
            dataItem.del = !dataItem.del
            dataItem.statusLoading = false
          }
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
        if (switchStatus) {
          dataItem.del = !dataItem.del
          dataItem.statusLoading = false
        }
      })
    }
  }
}
</script>
