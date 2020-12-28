<template>
  <div class="push-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="pushPop()">新建PUSH</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="pushId"
        label="pushId"
        width="80">
      </el-table-column>
      <el-table-column
        prop="pushTitle"
        label="标题"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="pushDesc"
        label="简介"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="pushType"
        label="类型"
        width="100">
        <template slot-scope="scope">
          {{pushType[scope.row.pushType] || ''}}
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="ID/URL"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="pushRange"
        label="推送范围"
        min-width="130">
        <template slot-scope="scope">
          {{pushRangeType[scope.row.pushRange]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="155">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="operator"
        label="操作人"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="pushStatus"
        label="状态"
        width="60">
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(pageStart/pageLimit) + 1"
      :page-size="limit"
      :total="total"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      title="新建PUSH"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :rules="formRules" :disabled="formLoading" label-width="80px" size="mini" ref="pushForm">
        <el-form-item label="标题" prop="pushTitle">
          <el-input v-model="form.pushTitle" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="pushDesc">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="简介"
            v-model="form.pushDesc">
          </el-input>
        </el-form-item>
        <el-form-item label="类型" prop="pushType">
          <el-select v-model="form.pushType" @change="previewID" placeholder="请选择">
            <el-option
              v-for="(value, key) in pushType"
              :key="key"
              :label="value"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="ID/URL" prop="content">
          <el-input v-model="form.content" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="redirectPreview">
          <span>{{redirectPreview}}</span>
        </el-form-item>
        <el-form-item label="推送范围" prop="pushRange">
          <el-select v-model="form.pushRange" placeholder="请选择">
            <el-option
              v-for="(value, key) in pushRangeType"
              :key="key"
              :label="value"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="formLoading" @click="submitForm('pushForm')">提交</el-button>
        <el-button size="mini" v-if="form.pushType === 'MULTI_THREAD'" type="danger" :loading="previewThreadLoading" @click="previewThread()">预览</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="多方案PUSH预览"
      :visible.sync="previewThreadVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form label-width="80px" size="mini">
        <el-form-item
          :label="'方案'+(index+1)+'：'"
          v-for="(item, index) in previewThreadData"
          :key="index">
          <p><span class="text-red">专家昵称：</span>{{item.expertNickName}}</p>
          <p><span class="text-red">方案名称：</span>{{item.title}}</p>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { Push } from '../../util/api'
import { validate } from '../../util/tool'
import { queryQuizDetailbyId, queryExpertDetailbyId, queryMatchDetailbyId } from '../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'Push',
  data () {
    return {
      loading: false,
      list: [],
      offset: 1,
      limit: 25,
      total: 1,
      tableHeight: null,
      pushRangeType: {
        ALL: '红彩、精准比分',
        HONGCAI: '红彩',
        JZBF: '精准比分'
      },
      pushType: {
        expert: '专家',
        match: '赛事',
        URL: 'URL',
        thread: '专家文章',
        TMESSAGEPUSH__H5_URL_REDIRECT_MODEL: '竞猜类型链接',
        MULTI_THREAD: '多方案'
      },
      redirectPreview: '',
      previewLoading: false,
      dialogFormVisible: false,
      formLoading: false,
      form: {
        pushType: 'expert',
        pushTitle: '',
        pushDesc: '',
        content: '',
        pushRange: 'ALL'
      },
      formRules: {
        pushTitle: [
          {required: true, message: '标题必填', trigger: ['blur', 'change']},
          {max: 13, message: '标题最多13字', trigger: ['blur', 'change']}
        ],
        pushDesc: [
          {required: true, message: '简介必填', trigger: ['blur', 'change']},
          {max: 56, message: '简介最多56字', trigger: ['blur', 'change']}
        ],
        content: [
          {validator: this.urlRules, trigger: ['blur', 'change']}
        ]
      },
      previewThreadData: [],
      previewThreadVisible: false,
      previewThreadLoading: false
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
    urlRules (rule, value, callback) {
      if (!value) {
        callback(new Error('ID/URL必填'))
      } else if (['expert', 'match', 'thread'].indexOf(this.form.pushType) > -1) {
        if (/^\d+$/.test(value)) {
          callback()
        } else {
          callback(new Error('ID必须为数字'))
        }
      } else if (['URL', 'TMESSAGEPUSH__H5_URL_REDIRECT_MODEL'].indexOf(this.form.pushType) > -1) {
        if (!validate.url.test(value)) {
          callback(new Error('URL不合法'))
        } else {
          callback()
        }
      } else if (this.form.pushType === 'MULTI_THREAD') {
        if (!value) {
          callback(new Error('不为空'))
        } else if (!/^[0-9,]+$/.test(value)) {
          callback(new Error('必须为数字且英文(,)隔开'))
        } else {
          if (value.split(',').length > 8) {
            callback(new Error('最多8个方案ID'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      this.$service(Push.list, {
        urlParams: {
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.total = res.data.size || 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    previewID () {
      this.redirectPreview = ''
      if (['expert', 'match', 'thread'].indexOf(this.form.pushType) === -1 || !/^\d+$/.test(this.form.content) || this.previewLoading) return
      const id = this.form.content
      this.previewLoading = true
      switch (this.form.pushType) {
        case 'thread':
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
        case 'match':
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
        case 'expert':
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
    pushPop () {
      this.form = {
        pushType: 'expert',
        pushTitle: '',
        pushDesc: '',
        content: '',
        pushRange: 'ALL'
      }
      this.redirectPreview = ''
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.pushForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let pcUrlMatch = this.form.content.match(/^(http|https):\/\/(hongcai|sports)\.163\.com(\/article)?\/\d{2}\/\d{4}\/\d{2}\/([a-zA-Z0-9]{16})\.html$/)
          let pcUrl = ''
          if (pcUrlMatch) {
            pcUrl = 'https://c.m.163.com/nc/qa/3g-expand/hc-article.html?docid=' + pcUrlMatch[4] + '#pcarticle=' + this.form.content
          }
          this.form.content = pcUrl || this.form.content
          if (this.form.pushType === 'MULTI_THREAD' && this.form.pushRange !== 'HONGCAI') {
            return this.$message.warning('PUSH类型为「多方案」时，推送范围只能是【红彩】')
          }
          this.formLoading = true
          this.$service(Push.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.formLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success('添加成功')
              this.getList()
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.formLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    previewThread () {
      if (!/^[0-9,]+$/.test(this.form.content)) return
      if (this.previewThreadLoading) return
      this.previewThreadLoading = true
      this.$service(Push.previewThread, {
        method: 'get',
        params: {
          threadIds: this.form.content
        }
      }).then(res => {
        this.previewThreadLoading = false
        if (res.code === 200) {
          this.previewThreadData = res.data
          this.previewThreadVisible = true
        } else {
          this.$message.error('获取多方案预览失败')
        }
      }, err => {
        if (err) {
          this.previewThreadLoading = false
          this.$message.error('网络错误，获取多方案预览失败')
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
