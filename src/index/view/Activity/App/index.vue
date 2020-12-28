<template>
  <div class="activity-app">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" @click="appPop()">新建活动</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop=""
        label="活动ID"
        width="80">
        <template slot-scope="scope">
          {{scope.row.activityPlazaId}}
          <el-tag size="mini" v-if="scope.row.isMajor" color="#e62121" style="color:#fff">主推</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="活动标题"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="redirectLink"
        label="跳转链接"
        min-width="120">
        <template slot-scope="scope">
          <span>{{scope.row.redirectType | urlRedirect2CH}}</span>
          <span>{{scope.row.redirectLink || ''}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="入口图片"
        width="150">
        <template slot-scope="scope">
          <img v-if="scope.row.imgUrl" style="max-width: 150px;max-height: 62px;" :src="scope.row.imgUrl + '?imageView&thumbnail=150y62&quality=85'" alt="">
        </template>
      </el-table-column>
      <el-table-column
        prop="majorAbstract"
        label="摘要"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="活动时间"
        min-width="180">
        <template slot-scope="scope">
          {{scope.row.validType ? dateFormat(scope.row.validStartTime) + '~' + dateFormat(scope.row.validEndTime) : '不限时'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="60">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="60">
        <template slot-scope="scope">
          {{scope.row.status ? '下线' : '上线'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="230">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.majorPop">
            <p>{{scope.row.isMajor?'取消':'设为'}}主推？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.majorPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="setMajor(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" :type="scope.row.isMajor?'':'primary'" size="small">{{scope.row.isMajor?'取消':'设为'}}主推</el-button>
          </el-popover>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="appPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="appDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value= "0"
            :inactive-value= "1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(offset/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      :title="form.activityPlazaId?'修改活动':'新建活动'"
      :visible.sync="dialogFormVisible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="活动标题" prop="title"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max:15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="跳转类型" prop="redirectType">
          <el-select v-model="form.redirectType">
            <el-option value="1" label="URL"></el-option>
            <el-option value="2" label="专家页"></el-option>
            <el-option value="3" label="赛事页"></el-option>
            <el-option value="4" label="方案页"></el-option>
            <el-option value="16" label="充值页"></el-option>
            <el-option value="30" label="交叉盘购买"></el-option>
            <el-option value="31" label="积分商城页"></el-option>
            <el-option value="33" label="拉新竞猜首页"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="'跳转' + (parseInt(form.redirectType)===1 ? '链接':'ID')" prop="redirectLink" v-show="parseInt(form.redirectType)<5"
          :rules="[{required: parseInt(form.redirectType)<5, message: '不为空', trigger: ['blur', 'change']},
          {type: parseInt(form.redirectType)===1 ? 'url' : '', message: '不符合url格式,', trigger: ['blur', 'change']},
          {pattern: parseInt(form.redirectType)>1 && parseInt(form.redirectType)<5 ? /^\d+$/ : '', message: 'ID必须为数字,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.redirectLink" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="redirectPreview">
          <span>{{redirectPreview}}</span>
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
        <el-form-item label="活动时间">
          <el-radio v-model="form.validType" label="0">不限制</el-radio>
          <el-radio v-model="form.validType" label="1">限制</el-radio>
        </el-form-item>
        <el-form-item label="" prop="validStartTime" v-show="form.validType==='1'" :rules="[{validator: timeRule, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.validStartTime"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.validEndTime).getTime() !== 0 && time.getTime() > new Date(form.validEndTime).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            v-model="form.validEndTime"
            ref="validEndTime"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.validStartTime).getTime() !== 0 && time.getTime() < new Date(form.validStartTime).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动摘要" prop="majorAbstract"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max:15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.majorAbstract" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="上线" value="0"></el-option>
            <el-option label="下线" value="1"></el-option>
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
import { ActivityApp } from '../../../util/api'
import { uploadImg, queryQuizDetailbyId, queryExpertDetailbyId, queryMatchDetailbyId } from '../../../util/commonQuery'
import { formatDate } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'activityApp',
  data () {
    return {
      loading: false,
      offset: 0,
      limit: 20,
      total: 1,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      updateLoading: false,
      redirectPreview: '',
      previewLoading: false
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
    timeRule (rule, value, callback) {
      if (this.form.validType === '1') {
        if (!value) {
          callback(new Error('开始时间不为空'))
        } else {
          let _endTime = this.$refs.validEndTime.value
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
    dateFormat (date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      this.$service(ActivityApp.list, {
        params: {
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.total = res.data.total || 1
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
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
    previewID () {
      this.redirectPreview = ''
      if (parseInt(this.form.redirectType) < 2 || parseInt(this.form.redirectType) > 4 || !/^\d+$/.test(this.form.redirectLink) || this.previewLoading) return
      this.previewLoading = true
      const id = this.form.redirectLink
      switch (this.form.redirectType) {
        case '4':
          queryQuizDetailbyId(id).then(res => {
            this.redirectPreview = '提示：对应跳转文章[' + res.title + ']'
            this.previewLoading = false
          }).catch(err => {
            if (err) {
              this.previewLoading = false
              this.redirectPreview = '提示：无对应跳转文章'
            }
          })
          break
        case '3':
          queryMatchDetailbyId(id).then(res => {
            this.redirectPreview = '提示：对应跳转赛事[' + res.homeMatchTeam.teamName + 'VS' + res.guestMatchTeam.teamName + ']'
            this.previewLoading = false
          }).catch(err => {
            if (err) {
              this.previewLoading = false
              this.redirectPreview = '提示：无对应跳转赛事'
            }
          })
          break
        case '2':
          queryExpertDetailbyId(id).then(res => {
            this.redirectPreview = '提示：对应跳转专家[' + res.nickname + ']'
            this.previewLoading = false
          }).catch(err => {
            if (err) {
              this.previewLoading = false
              this.redirectPreview = '提示：无对应跳转专家'
            }
          })
          break
      }
    },
    appPop (data) {
      this.form = Object.assign({
        redirectType: '1',
        validType: '0',
        imgUrl: '',
        status: '0'
      }, data || {})
      if (data) {
        this.form.redirectType = data.redirectType + ''
        this.form.validType = data.validType + ''
        this.form.status = data.status + ''
        if (data.validStartTime) this.form.validStartTime = this.dateFormat(data.validStartTime)
        if (data.validEndTime) this.form.validEndTime = this.dateFormat(data.validEndTime)
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {
            title: this.form.title,
            redirectType: this.form.redirectType,
            validType: this.form.validType,
            imgUrl: this.form.imgUrl,
            majorAbstract: this.form.majorAbstract,
            status: this.form.status,
            redirectLink: ''
          }
          if (parseInt(this.form.redirectType) < 5 && this.form.redirectLink) _data.redirectLink = this.form.redirectLink
          if (this.form.validType === '1') {
            _data['validStartTime'] = this.form.validStartTime
            _data['validEndTime'] = this.form.validEndTime
          }
          if (this.form.activityPlazaId) _data['activityPlazaId'] = this.form.activityPlazaId
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(ActivityApp.add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              if (this.form.activityPlazaId) this.offset = 0
              this.getList(Math.floor(this.offset / this.limit) + 1)
              this.$message.success((this.form.activityPlazaId ? '更新' : '添加') + '成功')
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
    setMajor (data) {
      this.$set(data, 'loading', true)
      this.$service(ActivityApp.major, {
        method: 'post',
        data: {
          activityPlazaId: data.activityPlazaId,
          isMajor: data.isMajor ? 0 : 1
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.majorPop = false
          this.$message.success((data.isMajor ? '取消' : '设置') + '主推成功')
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    appDel (data) {
      this.$set(data, 'loading', true)
      this.$service(ActivityApp.del, {
        method: 'post',
        data: {
          activityPlazaId: data.activityPlazaId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        activityPlazaId: data.activityPlazaId,
        status: data.status
      }
      this.$service(ActivityApp.status, {
        method: 'post',
        data: _data
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.statusLoading = false
          this.$message.success('状态更新成功')
        } else {
          data.statusLoading = false
          this.$set(data, 'status', data.status ? 0 : 1)
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    changeWeight (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{1,3}$/,
        inputErrorMessage: '0-999之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        this.$service(ActivityApp.weight, {
          method: 'post',
          data: {
            activityPlazaId: data.activityPlazaId,
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList(Math.floor(this.offset / this.limit) + 1, true)
            this.$message.success('权重修改成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
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
