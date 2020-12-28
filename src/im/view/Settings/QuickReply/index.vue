<template>
  <div class="quick-reply">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input
          v-model="searchQuery"
          clearable
          @clear="getList()"
          @change="getSearchList('search')"
          style="width:130px"
          placeholder="搜索快捷回复" />
        <el-button type="primary" @click="replyPop()">添加快捷回复</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="公共库" name="0">
      </el-tab-pane>
      <el-tab-pane label="个人库" name="1">
      </el-tab-pane>
    </el-tabs>
    <el-table size="medium" ref="elTable" :data="list" v-loading="loading" stripe style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column label="快捷词" width="140" prop="fastKey">
      </el-table-column>
      <el-table-column prop="content" label="快捷回复内容">
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="replyPop(scope.row)">
          </el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="del(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="success" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-show="listType === 'filter'"
      background layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(offset/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      :title="form.fastReplyId? '修改快捷回复':'添加快捷回复'"
      :visible.sync="replyVisible"
      width="600px"
      :close-on-click-modal="false"
      center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        label-width="100px"
        ref="replyForm">
        <el-form-item
          label="快捷词"
          prop="fastKey"
          :rules="{required: true, message: '快捷词不为空', trigger: ['blur', 'change']}">
          <el-input placeholder="输入快捷回复" v-model="form.fastKey">
            <template slot="prepend">#</template>
          </el-input>
        </el-form-item>
        <el-form-item label="快捷回复内容">
          <Editor ref="editor" :value="form.content" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('replyForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Editor from './components/Editor'
import { quickReply } from '../../../util/api/settings'
import { removeScriptAndEvent } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'SettingsQuickReply',
  data () {
    return {
      listType: 'filter', // filter || search
      offset: 0,
      limit: 20,
      total: 1,
      loading: false,
      tableHeight: null,
      form: {},
      list: [],
      activeTab: '0',
      searchQuery: '',
      updateLoading: false,
      replyVisible: false
    }
  },
  components: {
    Editor
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
    handleClickTabs () {
      this.searchQuery = ''
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.listType = 'filter'
      if (typeof page === 'number') {
        this.offset = page ? (page - 1) * this.limit : 0
      } else {
        this.offset = 0
      }
      this.$service(quickReply.list, {
        params: {
          typeId: this.activeTab,
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.list = res.data.data || []
          this.total = res.data.total || 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getSearchList () {
      if (!this.searchQuery || this.loading) return
      this.loading = true
      this.listType = 'search'
      this.$service(quickReply.search, {
        method: 'post',
        data: {
          key: this.searchQuery
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.list = res.data.filter(item => item.typeId.toString() === this.activeTab)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    replyPop (data) {
      this.form = Object.assign({
        fastKey: '',
        content: ''
      }, data || {})
      if (this.$refs.editor) {
        this.$refs.editor.clear()
        if (this.form.content) {
          this.$refs.editor.setContent(this.form.content)
        }
      }
      this.$nextTick(() => {
        this.$refs.replyForm.clearValidate()
      })
      this.replyVisible = true
    },
    submitForm (from) {
      this.$refs.replyForm.validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          const _data = {
            typeId: this.activeTab,
            key: this.form.fastKey,
            content: removeScriptAndEvent(this.$refs.editor.content.replace('</p><p>', '<br />').replace('<p>', '').replace('</p>', ''))
          }
          if (this.form.fastReplyId) {
            _data.fastReplyId = this.form.fastReplyId
          }
          if (!(_data.content.length > 0 && _data.content !== '<p><br /></p>' && _data.content !== '<p><br/></p>' && _data.content !== '<p><br></p>')) {
            return this.$message.error('快捷回复内容不能为空')
          }
          this.updateLoading = true
          this.$service(_data.fastReplyId ? quickReply.update : quickReply.add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.replyVisible = false
              this.getList()
              this.$message.success((_data.fastReplyId ? '更新' : '添加') + '成功')
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
    del (data) {
      if (data.loading) return
      this.$set(data, 'loading', true)
      this.$service(quickReply.del, {
        method: 'post',
        data: {
          fastReplyId: data.fastReplyId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(Math.floor(this.offset / this.limit) + 1)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
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

<style lang="scss">
.customer-service {
  position: relative;
  .el-form,
  .radio {
    padding-top: 30px;
    padding-left: 40px;
    .el-form-item,
    .el-radio {
      display: block;
      margin-bottom: 35px;
      .el-form-item__label {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        padding-right: 26px;
      }
      p {
        padding-left: 15px;
        display: inline-block;
      }
    }
  }
  .search,
  .btn {
    position: absolute;
    top: 0;
    right: 0;
  }
  .search {
    right: 100px;
  }
  .el-dialog {
    .el-form {
      padding: 0 20px 0 0;
      .el-form-item {
        margin-bottom: 18px;
      }
    }
    .ql-toolbar {
      height: 50px;
    }
  }
}
</style>
