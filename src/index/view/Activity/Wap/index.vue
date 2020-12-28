<template>
  <div class="activity-wap">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        WAP活动状态：{{wapStatus ? '上线' : '下线'}}
        <el-button type="primary" size="mini" :loading="statusLoading" @click="switchStatus">{{wapStatus ? '下线' : '上线'}}WAP活动</el-button>
        <el-button type="primary" size="mini" @click="wapPop">新建活动</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      @sort-change="getList"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="priority"
        label="权重"
        width="80">
      </el-table-column>
      <el-table-column
        prop="title"
        label="活动标题"
        min-width="150">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="startTime"
        label="活动时间"
        min-width="180">
        <template slot-scope="scope">
          {{scope.row.timeLimitation ? scope.row.startTime + '~' + scope.row.endTime : '不限时'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="redirectUrl"
        label="跳转链接"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="入口图片"
        width="150">
        <template slot-scope="scope">
          <img v-if="scope.row.imgUrl" :src="scope.row.imgUrl + '?imageView&thumbnail=150y62&quality=85'" alt="">
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.status ? '上线' : '下线'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="80">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="wapPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="form.activityId?'修改活动':'新建活动'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="权重" prop="priority"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9][0-9]{0,1}$/, message: '权重1-99', trigger: ['blur', 'change']}]">
          <el-input type="age" v-model="form.priority" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动标题" prop="title"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max:10, message: '最多10个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-radio v-model="form.timeLimitation" label="0">不限制</el-radio>
          <el-radio v-model="form.timeLimitation" label="1">限制</el-radio>
        </el-form-item>
        <el-form-item label="" prop="startTime" v-show="form.timeLimitation==='1'" :rules="[{validator: timeRule, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.startTime"
            type="date"
            style="width:135px"
            value-format="yyyy-MM-dd 00:00:00"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.endTime).getTime() !== 0 && time.getTime() > new Date(form.endTime).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            v-model="form.endTime"
            ref="endTime"
            type="date"
            style="width:135px"
            value-format="yyyy-MM-dd 23:59:59"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.startTime).getTime() !== 0 && time.getTime() < new Date(form.startTime).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="跳转链接" prop="redirectUrl"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {type: 'url', message: '不符合url格式,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.redirectUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动图片" prop="imgUrl"
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
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="上线" value="1"></el-option>
            <el-option label="下线" value="0"></el-option>
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
import { ActivityWap } from '../../../util/api'
import { uploadImg } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'activityWap',
  data () {
    return {
      wapStatus: null,
      statusLoading: false,
      sortRrders: ['descending', 'ascending', null],
      loading: false,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      updateLoading: false
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
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    timeRule (rule, value, callback) {
      if (this.form.timeLimitation === '1') {
        if (!value) {
          callback(new Error('开始时间不为空'))
        } else {
          let _endTime = this.$refs.endTime.value
          if (!_endTime) {
            callback(new Error('结束时间不为空'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    },
    getList (column, prop, order) {
      if (this.loading) return
      let _data = null
      if (column && column.prop) {
        _data = {
          sort: column.prop,
          sortDesc: column.order === 'ascending' ? false : column.order === 'descending' ? true : null
        }
      }
      this.loading = true
      this.$service(ActivityWap.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.activityList || []
          this.wapStatus = res.data.status
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    switchStatus () {
      if (this.statusLoading) return
      this.statusLoading = true
      this.$service(this.wapStatus ? ActivityWap.offline : ActivityWap.online).then(res => {
        this.statusLoading = false
        if (res.code === 200) {
          this.getList()
          this.$message.success(this.wapStatus ? '下线成功' : '上线成功')
          this.wapStatus = this.wapStatus ? 0 : 1
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
        this.form.imgUrl = res
      }, err => {
        if (err) this.$message.error('上传图片失败，请稍后再传！')
      })
    },
    wapPop (data) {
      this.form = Object.assign({
        timeLimitation: '0',
        status: '1',
        imgUrl: ''
      }, data || {})
      if (data) {
        this.form.timeLimitation = this.form.timeLimitation + ''
        this.form.status = this.form.status + ''
        if (data.startTime) this.form.startTime = data.startTime + ' 00:00:00'
        if (data.endTime) this.form.endTime = data.endTime + ' 23:59:59'
      }
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
          this.$service(this.form.activityId ? ActivityWap.update : ActivityWap.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getList()
              this.$message.success(this.form.activityId ? '修改成功' : '添加成功')
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
