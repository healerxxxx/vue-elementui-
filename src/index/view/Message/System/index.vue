<template>
  <div class="message-system">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input
          placeholder="模板名/模板ID"
          prefix-icon="el-icon-search"
          clearable
          v-model="queryParam"
          @change="getList('search')"
          @clear="getList('search')"
          size="small"
          style="width:auto;">
        </el-input>
        <el-button type="primary" size="small" @click="systemPop()">新建模板</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="templetId"
        label="模板ID"
        width="70">
      </el-table-column>
      <el-table-column
        prop="title"
        label="模板标题"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="模板内容"
        min-width="180">
        <template slot-scope="scope">
          <div v-if="JSON.parse(scope.row.content) && JSON.parse(scope.row.content).length > 0">
            <p v-for="(item, index) in JSON.parse(scope.row.content)" :key="index">
              <span>{{item.name}}</span><span style="color:#333;">{{item.keywords}}</span>
            </p>
          </div>
          <span v-else>{{scope.row.content}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="optionPushAlert"
        label="PUSH固定文案"
        min-width="140">
      </el-table-column>
      <el-table-column
        prop="linkType"
        label="跳转类型"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.linkType | urlRedirect2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="linkUrl"
        label="跳转链接"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="conditionName"
        label="关联触发条件"
        min-width="90">
      </el-table-column>
      <el-table-column
        label="推送范围"
        width="110">
        <template slot-scope="scope">
          {{scope.row.isMessage ? '消息' : ''}}{{scope.row.isMessage && scope.row.isPush ? '、' : ''}}{{scope.row.isPush ? 'PUSH' : ''}}
        </template>
      </el-table-column>
      <el-table-column
        label="推送时间"
        width="80">
        <template slot-scope="scope">
          {{scope.row.fixSendPushTime ? scope.row.fixSendPushTime : '即时'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="useStatus"
        label="状态"
        width="50">
        <template slot-scope="scope">
          {{scope.row.useStatus === 'USE_IN' ? '启用' : '停用'}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="systemPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="systemDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-switch
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
      :title="!form.templetId?'新建模板':'修改模板'"
      :visible.sync="dialogFormVisible"
      width="530px"
      :close-on-click-modal="false"
      center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        size="small"
        label-width="70px"
        ref="form">
        <el-form-item
          label="标题"
          prop="title"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.title" autocomplete="off" :disabled="form.templetId"></el-input>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form.content"
          :label="index===0?'推荐内容':''"
          :key="index"
          :prop="index + ''"
          :rules="{validator: contentRule, trigger: ['blur', 'change']}">
          <el-input v-if="item.type==='key'" :ref="'nameKey' + index" v-model="item.name" style="width:130px" placeholder="名称" :disabled="form.templetId"></el-input> <span v-if="item.type==='key'">=</span>
          <el-select v-if="item.type==='key'" :ref="'keyword' + index" v-model="item.keywords" filterable placeholder="请选择关键词">
            <el-option
              v-for="item in keywordList"
              :key="item.keywordId"
              :label="item.keywordName"
              :value="item.keywordCode">
            </el-option>
          </el-select>
          <el-input v-if="item.type!=='key'" :ref="'nameString' + index" type="textarea" maxlength="100" :rows="2" placeholder="文本内容" v-model="item.name" style="width:360px" :disabled="form.templetId"></el-input>
          <el-button type="primary" icon="el-icon-delete" circle size="small" @click="removeContentInput(index)"></el-button>
        </el-form-item>
        <el-form-item v-if="!form.templetId">
          <el-button size="mini" type="primary" @click="addContentInput('key')">添加关键词参数</el-button><el-button size="mini" type="primary" plain @click="addContentInput('string')">添加文本</el-button>
        </el-form-item>
        <el-form-item
          label="Push可选内容"
          prop="optionPushAlert"
          v-show="form.sendType.indexOf('push') > -1">
          <el-input type="textarea" maxlength="200" :rows="2" placeholder="push内容" v-model="form.optionPushAlert"></el-input>
        </el-form-item>
        <el-form-item
          label="推送"
          prop="sendType"
          :rules="{type: 'array', required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-checkbox-group v-model="form.sendType">
            <el-checkbox label="message">消息</el-checkbox>
            <el-checkbox label="push">PUSH</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="推送时间" prop="timeType">
          <el-radio v-model="form.timeType" label="0">即时</el-radio>
          <el-radio v-model="form.timeType" label="1">固定时间</el-radio>
        </el-form-item>
        <el-form-item label="" prop="fixSendPushTime" v-show="form.timeType === '1'" :rules="{required: form.timeType === '1', message: '不为空', trigger: ['blur', 'change']}">
          <el-time-picker
            arrow-control
            v-model="form.fixSendPushTime"
            value-format="HH:mm"
            placeholder="选择时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="跳转类型"
          prop="linkType">
          <el-select v-model="form.linkType" placeholder="请选择" :disabled="form.templetId" @change="previewID">
            <el-option
              v-for="(item, index) in urlRedirectType"
              :key="index"
              :label="item.name"
              :value="item.type">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="['EXPERT', 'MATCH', 'THREAD', 'URL', 'MACAUS_MATCHPAGE', 'H5_URL_REDIRECT_MODEL'].indexOf(form.linkType) > -1"
          label="ID/URL"
          prop="linkUrl"
          :rules="{validator: linkRules, trigger: ['blur', 'change']}">
          <el-input v-model="form.linkUrl" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''" :disabled="form.templetId"></el-input>
        </el-form-item>
        <el-form-item v-if="redirectPreview">
          <span>{{redirectPreview}}</span>
        </el-form-item>
        <el-form-item label="状态" prop="useStatus">
          <el-select v-model="form.useStatus" placeholder="请选择" :disabled="form.templetId">
            <el-option label="启用" value="USE_IN"></el-option>
            <el-option label="停用" value="USE_STOP"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
        <el-button size="small" type="primary" plain @click="previewForm" v-if="form.title&&(form.msgImage||form.msgAbstract)">预览</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MessageSystem } from '../../../util/api'
import baseType from '../../../util/base'
import { isNumber, validate } from '../../../util/tool'
import { queryQuizDetailbyId, queryExpertDetailbyId, queryMatchDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'messageSystem',
  data () {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      urlRedirectType: baseType.urlRedirectType,
      queryParam: '',
      redirectPreview: '',
      previewLoading: false,
      form: {
        title: '',
        content: [],
        linkType: 'EXPERT',
        linkUrl: '',
        optionPushAlert: '',
        sendType: ['message'],
        timeType: '0',
        fixSendPushTime: '',
        useStatus: 'USE_IN'
      },
      updateLoading: false,
      dialogFormVisible: false,
      codeList: [],
      keywordList: [],
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
    linkRules (rule, value, callback) {
      if (['EXPERT', 'MATCH', 'THREAD', 'URL', 'MACAUS_MATCHPAGE', 'H5_URL_REDIRECT_MODEL'].indexOf(this.form.linkType) > -1) {
        if (['URL', 'H5_URL_REDIRECT_MODEL'].indexOf(this.form.linkType) > -1) {
          if (value && !validate.url.test(value)) {
            callback(new Error('URL不合法'))
          } else {
            callback()
          }
        } else {
          if (value && !/^\d+$/.test(value)) {
            callback(new Error('ID必须为数字'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    },
    contentRule (rule, value, callback) {
      let _id = rule.field
      if (this.form.content[_id].type === 'key') {
        let _nameKey = this.$refs['nameKey' + _id][0].value
        let _keyword = this.$refs['keyword' + _id][0].value
        if (!_nameKey) {
          callback(new Error('名称不为空'))
        } else {
          if (_nameKey.length > 5) {
            callback(new Error('名称不超5个字符'))
          } else {
            if (!_keyword) {
              callback(new Error('关键词不为空'))
            } else {
              callback()
            }
          }
        }
      } else {
        let _nameString = this.$refs['nameString' + _id][0].value
        if (!_nameString) {
          callback(new Error('文本内容不为空'))
        } else {
          if (_nameString.length > 300) {
            callback(new Error('文本内容不超300个字符'))
          } else {
            callback()
          }
        }
      }
    },
    getList (arg) {
      if (this.loading) return
      this.loading = true
      let _data = null
      if (isNumber(arg)) {
        this.pageIndex = arg || 1
      } else {
        this.pageIndex = 1
        if (this.queryParam) {
          _data = {
            queryParam: this.queryParam
          }
        }
      }
      this.$service(MessageSystem.list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: _data
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
        templetId: data.templetId,
        useStatus: data.useStatus
      }
      this.$service(MessageSystem.status, {
        method: 'post',
        urlParams: _data
      }).then((res) => {
        data.statusLoading = false
        if (res.code === 200) {
          data.status = data.useStatus === 'USE_STOP' ? 'NOT_NORMAL' : 'NORMAL'
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
    systemDel (data) {
      this.$set(data, 'loading', true)
      this.$service(MessageSystem.del, {
        method: 'post',
        urlParams: {
          templetId: data.templetId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(this.pageIndex)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    systemPop (data) {
      this.form = Object.assign({
        title: '',
        content: [],
        linkType: 'EXPERT',
        linkUrl: '',
        optionPushAlert: '',
        sendType: data ? [] : ['message'],
        timeType: '0',
        fixSendPushTime: '',
        useStatus: 'USE_IN'
      }, data || {})
      if (data) {
        if (data.isMessage) this.form.sendType.push('message')
        if (data.isPush) this.form.sendType.push('push')
        this.form.timeType = this.form.fixSendPushTime ? '1' : '0'
        if (JSON.parse(data.content)) {
          let _arr = JSON.parse(data.content)
          _arr.forEach(item => {
            item['type'] = item.name && item.keywords ? 'key' : 'string'
          })
          this.form.content = _arr
        }
      }
      this.getkeywordList().then(() => {
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      })
    },
    addContentInput (type) {
      let _obj = {
        type: type,
        name: '',
        keywords: ''
      }
      this.form.content.push(_obj)
    },
    removeContentInput (i) {
      this.form.content.splice(i, 1)
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = Object.assign({}, this.form)
          let _contentArr = []
          this.form.content.forEach(item => {
            _contentArr.push({
              name: item.name.replace(/:|：|\r|\n/ig, '') + (item.keywords ? ':' : ''),
              keywords: item.keywords
            })
          })
          if (_contentArr.length < 1) return this.$message.error('模板内容不能为空')
          _data.content = JSON.stringify(_contentArr)
          _data['isMessage'] = _data.sendType.indexOf('message') > -1
          if (_data.sendType.indexOf('push') > -1) {
            _data['isPush'] = true
            if (/\$\{\(userk/ig.test(_data.optionPushAlert)) return this.$message.error('PUSH可选内容内不允许有涉及用户的关键词')
            if (_data.optionPushAlert && /\$\{\(userk/ig.test(_data.content)) return this.$message.error('PUSH可选内容为空时，模板内容内不允许有涉及用户的关键词')
          } else {
            _data['isPush'] = false
            _data.optionPushAlert = ''
          }
          if (_data.optionPushAlert) _data.optionPushAlert.replace(/\r|\n/ig, '')
          if (['EXPERT', 'MATCH', 'THREAD', 'URL', 'MACAUS_MATCHPAGE', 'H5_URL_REDIRECT_MODEL'].indexOf(this.form.linkType) === -1) _data.linkUrl = ''
          if (['URL', 'H5_URL_REDIRECT_MODEL'].indexOf(this.form.linkType) > -1) {
            let pcUrlMatch = _data.linkUrl.match(/^(http|https):\/\/(hongcai|sports)\.163\.com(\/article)?\/\d{2}\/\d{4}\/\d{2}\/([a-zA-Z0-9]{16})\.html$/)
            let pcUrl = ''
            if (pcUrlMatch) {
              pcUrl = 'https://c.m.163.com/nc/qa/3g-expand/hc-article.html?docid=' + pcUrlMatch[4] + '#pcarticle=' + this.form.linkUrl
            }
            this.form.linkUrl = pcUrl
          }
          this.updateLoading = true
          this.$service(this.form.templetId ? MessageSystem.update : MessageSystem.add, {
            method: 'post',
            urlParams: this.form.templetId ? {
              templetId: this.form.templetId
            } : null,
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.templetId ? '修改' : '添加') + '成功')
              this.getList(this.form.templetId ? this.pageIndex : 1)
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
    getkeywordList () {
      if (this.keywordList.length > 0) return Promise.resolve()
      return this.$service(MessageSystem.keyword).then(res => {
        if (res.code === 200) {
          this.keywordList = res.data || []
          return Promise.resolve()
        } else {
          this.$message.error('获取消息模板失败，请稍后再试')
        }
      }, err => {
        if (err) this.$message.error('获取消息模板失败，请稍后再试')
      })
    },
    previewID () {
      this.redirectPreview = ''
      if (['EXPERT', 'MATCH', 'THREAD'].indexOf(this.form.linkType) === -1 || !/^\d+$/.test(this.form.linkUrl) || this.previewLoading) return
      const id = this.form.linkUrl
      this.previewLoading = true
      switch (this.form.linkType) {
        case 'THREAD':
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
        case 'MATCH':
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
        case 'EXPERT':
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
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
