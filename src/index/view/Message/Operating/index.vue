<template>
  <div class="message-operating">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="operatingPop()">新建类别</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="msgLogId"
        label="消息ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="msgTypeName"
        label="消息类型"
        width="110">
      </el-table-column>
      <el-table-column
        prop="msgTitle"
        label="消息标题"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="msgAbstract"
        label="消息摘要"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="msgImage"
        label="消息配图"
        width="120">
        <template slot-scope="scope">
          <img v-if="scope.row.msgImage" :src="scope.row.msgImage + '?imageView&thumbnail=120y45&quality=85'">
        </template>
      </el-table-column>
      <el-table-column
        prop="groupUser"
        label="用户群"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="redirectType"
        label="跳转类型"
        width="120">
        <template slot-scope="scope">
          {{scope.row.redirectType | urlRedirect2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="msgLink"
        label="链接"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="消息发布时间"
        width="150">
      </el-table-column>
      <el-table-column
        prop="isDel"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status | msgStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="80">
        <template slot-scope="scope">
          <span v-if=scope.row.isDel>已删除</span>
          <el-popover
            v-else
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="msgDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
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
    <el-dialog title="新建消息" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        size="small"
        label-width="110px"
        ref="form">
        <el-form-item
          label="类型"
          prop="msgTypeId">
          <el-select v-model="form.msgTypeId" placeholder="请选择">
            <el-option
              v-for="(item, index) in categoryList"
              :key="index"
              :label="item.msgTypeName"
              :value="item.msgTypeId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="用户群体"
          prop="userGroupCode">
          <el-select v-model="form.userGroupCode" placeholder="请选择">
            <el-option
              v-for="(item, index) in userGroupList"
              :key="index"
              :label="item.groupName"
              :value="item.userGroupCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="form.userGroupCode=='002'"
          label="用户ID"
          prop="groupUser"
          :rules="[{validator: userIdRule, trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" v-model="form.groupUser"></el-input>
        </el-form-item>
        <el-form-item v-show="form.userGroupCode=='002'">
          <span>*不为空&用,隔开，最多200个用户</span>
        </el-form-item>
        <el-form-item
          prop="excel"
          v-show="form.userGroupCode=='003'"
          :rules="[{required: form.userGroupCode=='003', message: '请选择Excel', trigger: ['blur', 'change']}]">
          <el-upload
            ref="upload"
            limit="1"
            accept=".xls,.xlsx,.xlc,.xlm,.xlt,.xlw"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
            :auto-upload="false"
            :file-list="fileList">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">*文件需为excel格式</div>
          </el-upload>
        </el-form-item>
        <el-form-item
          label="标题"
          prop="msgTitle"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.msgTitle" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="简介"
          prop="msgAbstract"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 50, message: '最多50个字符', trigger: ['blur', 'change']}]">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="简介"
            v-model="form.msgAbstract">
          </el-input>
        </el-form-item>
        <el-form-item label="配图" prop="msgImage">
          <el-upload
            class="msgImage-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadMsgImage"
            :before-upload="beforeMsgImageUpload">
            <img v-if="form.msgImage" :src="form.msgImage + '?imageView&thumbnail=340y128&quality=85'" class="msgImage">
            <i v-else class="el-icon-plus msgImage-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">图片尺寸：690×260</div>
          </el-upload>
        </el-form-item>
        <el-form-item
          label="跳转类型"
          prop="redirectType">
          <el-select v-model="form.redirectType" placeholder="请选择" @change="previewID">
            <el-option
              v-for="(item, index) in urlRedirectType"
              :key="index"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="parseInt(form.redirectType) < 5 || parseInt(form.redirectType) === 23 || parseInt(form.redirectType) === 28 || parseInt(form.redirectType) === 34"
          label="ID/URL"
          prop="msgLink"
          :rules="{validator: linkRules, trigger: ['blur', 'change']}">
          <el-input v-model="form.msgLink" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="redirectPreview&&parseInt(form.redirectType)>1&&parseInt(form.redirectType)<5">
          <span>{{redirectPreview}}</span>
        </el-form-item>
        <el-form-item
          label="推送"
          prop="pushType"
          :rules="{type: 'array', required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-checkbox-group v-model="form.pushType">
            <el-checkbox label="1">消息</el-checkbox>
            <el-checkbox label="2">PUSH</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item
          label="Push可选内容"
          prop="pushContent"
          v-show="form.pushType.indexOf('2') > -1"
          :rules="{required: form.pushType.indexOf('2') > -1, message: '不为空', trigger: ['blur', 'change']}">
          <el-input type="textarea" maxlength="30" :rows="2" placeholder="push内容" v-model="form.pushContent"></el-input>
        </el-form-item>
        <el-form-item label="推送时间" prop="pushStatus">
          <el-radio v-model="form.pushStatus" label="1">即时</el-radio>
          <el-radio v-model="form.pushStatus" label="2">固定时间</el-radio>
        </el-form-item>
        <el-form-item label="" prop="pushTime" v-show="form.pushStatus === '2'" :rules="{required: form.pushStatus === '2', message: '不为空', trigger: ['blur', 'change']}">
          <el-date-picker
            v-model="form.pushTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now()
            }}">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
        <el-button size="small" type="primary" plain @click="previewForm" v-if="form.msgTitle&&(form.msgImage||form.msgAbstract)">预览</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="previewVisible" width="500px" center>
      <el-form
        size="small"
        label-width="0px">
        <el-form-item v-if="form.msgTitle">
          <span style="font-size: 22px;font-weight: bold;color: #000;">{{form.msgTitle}}</span>
        </el-form-item>
        <el-form-item v-if="form.msgImage">
          <img :src="form.msgImage + '?imageView&thumbnail=450y170&quality=85'">
        </el-form-item>
        <el-form-item v-if="form.msgAbstract">
          <span>{{form.msgAbstract}}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { MessageOperating } from '../../../util/api'
import baseType from '../../../util/base'
import { validate } from '../../../util/tool'
import { uploadImg, queryQuizDetailbyId, queryExpertDetailbyId, queryMatchDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'messageOperating',
  data () {
    return {
      loading: false,
      start: 0,
      limit: 25,
      total: 1,
      list: [],
      urlRedirectType: baseType.urlRedirectType,
      form: {
        msgTypeId: '',
        userGroupCode: '',
        groupUser: '',
        excel: null,
        msgTitle: '',
        msgAbstract: '',
        msgImage: '',
        redirectType: '2',
        msgLink: '',
        pushType: ['1'],
        pushContent: '',
        pushStatus: '1',
        pushTime: ''
      },
      redirectPreview: '',
      previewLoading: false,
      updateLoading: false,
      dialogFormVisible: false,
      categoryList: [],
      userGroupList: [],
      tableHeight: null,
      previewVisible: false,
      fileList: []
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  filters: {
    msgStatus2CH (val) {
      let dict = {
        0: '未发送',
        1: '正在发送',
        2: '已发送',
        3: '消息异常'
      }
      return dict[val] || '-'
    }
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
    userIdRule (rule, value, callback) {
      if (this.form.userGroupCode === '002') {
        if (!value) {
          callback(new Error('不为空'))
        } else if (!/^[0-9,]+$/.test(value)) {
          callback(new Error('必须为数字且英文(,)隔开'))
        } else {
          if (value.split(',').length > 200) {
            callback(new Error('最多200个用户ID'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    },
    linkRules (rule, value, callback) {
      if (parseInt(this.form.redirectType) < 5 || parseInt(this.form.redirectType) === 23 || parseInt(this.form.redirectType) === 28 || parseInt(this.form.redirectType) === 34) {
        if (parseInt(this.form.redirectType) === 1 || parseInt(this.form.redirectType) === 34) {
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
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.start = page ? (page - 1) * this.limit : 0
      this.$service(MessageOperating.list, {
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
    beforeMsgImageUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传图片大小不能超过 5MB!')
        return false
      }
    },
    uploadMsgImage (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.form.msgImage = res
      }, err => {
        if (err) this.$message.error('上传失败，请稍后再传！')
      })
    },
    handleFileExceed () {
      this.$message.warning('请先移除Excel文件。')
    },
    handleFileRemove (file) {
      this.form.excel = null
    },
    handleFileChange (file, fileList) {
      this.form.excel = file.raw
    },
    operatingPop (data) {
      this.form = {
        msgTypeId: '',
        userGroupCode: '',
        groupUser: '',
        excel: null,
        msgTitle: '',
        msgAbstract: '',
        msgImage: '',
        redirectType: 2,
        msgLink: '',
        pushType: ['1'],
        pushContent: '',
        pushStatus: '1',
        pushTime: ''
      }
      this.fileList = []
      this.getCategoryList().then(() => {
        this.getUerGroupList().then(() => {
          this.form.msgTypeId = this.categoryList[0].msgTypeId
          this.form.userGroupCode = this.userGroupList[0].userGroupCode
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs.form.clearValidate()
          })
        })
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          let _data = Object.assign({}, this.form)
          _data.msgAbstract = _data.msgAbstract.replace(/\r|\n/g, '')
          _data.pushContent = _data.pushContent ? _data.pushContent.replace(/\r|\n/g, '') : _data.pushContent
          let pcUrlMatch = _data.msgLink.match(/^(http|https):\/\/(hongcai|sports)\.163\.com(\/article)?\/\d{2}\/\d{4}\/\d{2}\/([a-zA-Z0-9]{16})\.html$/)
          let pcUrl = ''
          if (pcUrlMatch) {
            pcUrl = 'https://c.m.163.com/nc/qa/3g-expand/hc-article.html?docid=' + pcUrlMatch[4] + '#pcarticle=' + this.form.msgLink
          }
          _data.pushType = this.sum(_data.pushType)
          _data.msgLink = pcUrl || _data.msgLink
          if (parseInt(_data.redirectType) > 4 && parseInt(_data.redirectType) !== 23 && parseInt(_data.redirectType) !== 28 && parseInt(_data.redirectType) !== 34) {
            _data.msgLink = ''
          }
          Object.keys(_data).forEach(item => {
            if (!_data[item]) delete _data[item]
          })
          let _exceleData = new FormData()
          if (_data.excel) {
            Object.keys(_data).forEach(item => {
              _exceleData.append(item, _data[item])
            })
          }
          this.$service(MessageOperating.add, {
            method: 'post',
            headers: _data.excel ? {
              'Content-Type': 'multipart/form-data'
            } : null,
            data: _data.excel ? _exceleData : _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success('添加成功')
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
    sum (arr) {
      let val = 0
      arr.forEach(item => {
        val += parseInt(item)
      })
      return val
    },
    msgDel (data) {
      this.$set(data, 'loading', true)
      this.$service(MessageOperating.del, {
        method: 'post',
        data: {
          isDel: 1,
          msgLogId: data.msgLogId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          data.isDel = true
          this.$message.success('删除成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getCategoryList () {
      if (this.categoryList.length > 0) return Promise.resolve()
      return this.$service(MessageOperating.msgType).then(res => {
        if (res.code === 200) {
          this.categoryList = res.data
          return Promise.resolve()
        } else {
          this.$message.error('获取消息类型列表失败')
        }
      }, err => {
        if (err) this.$message.error('获取消息类型列表失败')
      })
    },
    getUerGroupList () {
      if (this.userGroupList.length > 0) return Promise.resolve()
      return this.$service(MessageOperating.userGroup).then(res => {
        if (res.code === 200) {
          this.userGroupList = res.data
          return Promise.resolve()
        } else {
          this.$message.error('获取用户群体列表失败')
        }
      }, err => {
        if (err) this.$message.error('获取用户群体列表失败')
      })
    },
    previewID () {
      this.redirectPreview = ''
      if ([2, 3, 4, 23, 28].indexOf(parseInt(this.form.redirectType)) === -1 || !/^\d+$/.test(this.form.msgLink) || this.previewLoading) return
      this.previewLoading = true
      const id = this.form.msgLink
      switch (parseInt(this.form.redirectType)) {
        case 4:
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
        case 3:
        case 23:
        case 28:
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
        case 2:
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
    previewForm () {
      this.previewVisible = true
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
.msgImage-uploader {
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
  .msgImage-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 340px;
    height: 128px;
    line-height: 128px;
    text-align: center;
  }
  .msgImage {
    width: 340px;
    height: 128px;
    display: block;
  }
}
</style>
