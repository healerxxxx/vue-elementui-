<template>
  <div class="classroom-notice">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools" v-show="listType==='global'">
        <el-button
          type="primary"
          size="mini"
          @click="openDialogOfGlobal">新建全局通知</el-button>
      </div>
      <div class="tools" v-show="listType==='single'">
        <el-form
          :model="nicknameForm"
          ref="nicknameForm"
          label-width="98px"
          size="mini"
          class="nickname-form">
          <el-form-item label="小助手昵称:" prop="nickname" :rules="[
          { required: true, message: '昵称不能为空', trigger: 'blur'},
          { min: 2, max:6, message: '昵称为2-6个字符', trigger: 'blur'},
          { validator: nicknameRule, message: '昵称只能包含字母、数字和汉字字符', trigger: 'blur'}]" >
            <el-input v-model="nicknameForm.nickname" autocomplete="off" :disabled="!nicknameEdit"></el-input>
            <el-button type="text" @click="editNickname" v-show="!nicknameEdit">修改</el-button>
            <el-button type="text" @click="saveNickname" v-show="nicknameEdit">保存</el-button>
            <el-button type="text" @click="cancelEditNickname" v-show="nicknameEdit">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-tabs v-model="listType" @tab-click="handleClick" ref="elTable">
      <el-tab-pane label="单场通知" name="single">
      </el-tab-pane>
      <el-tab-pane label="全局通知" name="global">
        <el-table
          :data="global.list"
          v-loading="global.loading"
          stripe
          :max-height="tableHeight<400?400:tableHeight"
          >
          <el-table-column
            prop="content"
            label="通知内容"
            min-width="150">
          </el-table-column>
          <el-table-column
            prop="operateName"
            label="发布人"
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
                  <el-button type="primary" size="mini" :loading="scope.row.loading" @click="deleteGlobalNotice(scope.row)">确定</el-button>
                </div>
                <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
        background
        layout="prev, pager, next"
        @current-change="getGlobalList"
        :current-page.sync="global.pageIndex"
        :page-count="global.pageCount"
        class="page-bar-reset">
        </el-pagination>
      </el-tab-pane>
    </el-tabs>
    <div class="single-list" v-show="listType==='single'">
      <div class="single-form">
        <el-form :model="singlePublish" ref="singleForm" label-width="98px" size="mini" >
          <el-form-item label="赛事ID:"  prop="matchInfoId"
          :rules="[{ required: true, message: '赛事ID不能为空', trigger: 'blur'}]">
            <el-input v-model="singlePublish.matchInfoId" autocomplete="off"></el-input>
          </el-form-item>
          <!-- <el-form-item label="小助手昵称:" prop="nickname" :rules="[
          { required: true, message: '昵称不能为空', trigger: 'blur'},
          { min: 2, max:6, message: '昵称为2-6个字符', trigger: 'blur'},
          { validator: nicknameRule, message: '昵称只能包含字母、数字和汉字字符', trigger: 'blur'}]" >
            <el-input v-model="singlePublish.nickname" autocomplete="off"></el-input>
          </el-form-item> -->
          <el-form-item label="通知类型:" prop="sendType"
          :rules="[{ required: true, message: '通知类型不能为空', trigger: 'blur'}]">
            <el-select v-model="singlePublish.sendType" placeholder="请选择通知类型">
              <el-option label="单场信息流" value="1"></el-option>
              <el-option label="单场顶部栏通知" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通知内容:" prop="content" :rules="singleContentRule">
            <el-input type="textarea" @keydown.native="handlerGlobalNotice" v-model="singlePublish.content" rows="5"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publishingleSingleNotice" size="mini">发布</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :data="single.list"
        v-loading="single.loading"
        stripe
        :max-height="tableHeight<400?400:tableHeight"
        >
        <el-table-column
          prop="content"
          label="通知内容"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="sendType"
          label="通知类型"
          min-width="90">
          <template slot-scope="scope">{{sendType[scope.row.sendType]}}</template>
        </el-table-column>
        <el-table-column
          prop="chatDataId"
          label="赛事ID"
          min-width="100">
        </el-table-column>
        <el-table-column
          prop="matchVSData"
          label="赛事对阵"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="operateName"
          label="发布人"
          min-width="80">
        </el-table-column>
      </el-table>
        <el-pagination
        background
        layout="prev, pager, next"
        @current-change="getSingleList"
        :current-page.sync="single.pageIndex"
        :page-count="single.pageCount"
        class="page-bar-reset">
      </el-pagination>
    </div>
    <el-dialog title="快捷全局通知" :visible.sync="dialogAllVisible" center>
      <el-form :model="globalNotice" label-width="100px" ref="globalNoticeForm">
        <el-form-item label="通知内容:" prop="content" :rules="[{ required: true, message: '通知内容不能为空', trigger: 'blur'}]">
          <el-input type="textarea" @keydown.native="handlerGlobalNotice" v-model="globalNotice.content" rows="3"></el-input>
        </el-form-item>
        <el-form-item class="text-align: right;">
          <el-button type="primary" @click="publishGlobalNotice" size="mini">发布</el-button>
        </el-form-item>
      </el-form>
      <!-- <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="publish" size="mini">发布</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>
<script>
import { ChatroomNotice } from '../../../util/api'
import { mapActions } from 'vuex'
export default {
  name: 'ChatroomNotice',
  data () {
    return {
      tableHeight: 0,
      singlePublish: {
        matchInfoId: '',
        sendType: '',
        content: ''
      },
      sendType: {
        0: '单场顶部栏通知',
        1: '单场信息流'
      },
      dialogAllVisible: false,
      globalNotice: {
        content: ''
      },
      nicknameEdit: false,
      nickname: '',
      nicknameForm: {
        nickname: ''
      },
      listType: 'single',
      single: {
        loading: false,
        list: [],
        pageIndex: 1,
        pageSize: 20,
        pageCount: 1
      },
      global: {
        loading: false,
        list: [],
        pageIndex: 1,
        pageSize: 20,
        pageCount: 1
      }
    }
  },
  computed: {
    singleContentRule () {
      let rule = [{required: true, message: '通知内容不能为空', trigger: 'blur'}]
      if (this.singlePublish.sendType === '1') {
        rule.push({min: 1, max: 200, message: '长度在1-200个字符', tigger: 'blur'})
      }
      return rule
    }
  },
  created () {
    this.getSingleList()
    this.getGlobalList()
    this.setHeight()
    this.nickname = this.nicknameForm.nickname = this.$store.state.userInfo.nickname || ''
  },
  methods: {
    ...mapActions(['getUserInfo']),
    nicknameRule (rule, value, callback) {
      if (value && !/^[0-9A-Za-z\u4e00-\u9fa5]+$/gi.test(value)) {
        callback(new Error('昵称只能包含字母、数字和汉字字符'))
      } else {
        callback()
      }
    },
    editNickname () {
      this.nicknameEdit = true
    },
    cancelEditNickname () {
      this.nicknameEdit = false
      this.$refs['nicknameForm'].resetFields()
      this.$refs['nicknameForm'].clearValidate()
      this.nicknameForm.nickname = this.nickname
    },
    saveNickname () {
      this.$refs['nicknameForm'].validate(valid => {
        if (valid) {
          this.$service(ChatroomNotice.single.editnickname, {
            method: 'post',
            data: this.nicknameForm
          }).then(res => {
            if (res.code === 200) {
              this.nicknameEdit = false
              this.nickname = this.nicknameForm.nickname
              this.getUserInfo()
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.single.loading = false
            this.$message.error(JSON.stringify(err))
          })
        } else {
          return false
        }
      })
    },
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.$store.state.windowHeight - this.$refs.elTable.$el.offsetTop - 120
      })
    },
    publishingleSingleNotice () {
      this.$refs['singleForm'].validate(valid => {
        if (valid) {
          this.add(ChatroomNotice.single.add, this.singlePublish)
        } else {
          return false
        }
      })
    },
    publishGlobalNotice () {
      this.$refs['globalNoticeForm'].validate(valid => {
        if (valid) {
          this.add(ChatroomNotice.global.add, this.globalNotice)
        } else {
          return false
        }
      })
    },
    openDialogOfGlobal () {
      this.dialogAllVisible = true
      this.$nextTick(() => {
        this.$refs['globalNoticeForm'].resetFields()
        this.$refs['globalNoticeForm'].clearValidate()
      })
    },
    add (url, data) {
      this.$service(url, {
        method: 'post',
        data: data
      }).then(res => {
        if (url === ChatroomNotice.single.add) this.singlePublish.content = ''
        if (res.code === 200) {
          if (this.listType === 'single') this.getSingleList()
          if (this.listType === 'global') this.getGlobalList()
          this.dialogAllVisible = false
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.single.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    deleteGlobalNotice (data) {
      this.$service(ChatroomNotice.global.delete, {
        urlParams: {
          chatSystemAnnounceId: data.chatSystemMsgId
        }
      }).then(res => {
        if (res.code === 200) {
          this.getGlobalList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.single.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getSingleList (page, noScroll) {
      if (this.single.loading) return
      this.single.loading = true
      this.single.pageIndex = page || 1
      this.$service(ChatroomNotice.single.list, {
        urlParams: {
          pageIndex: this.single.pageIndex,
          pageSize: this.single.pageSize
        }
      }).then(res => {
        this.single.loading = false
        if (res.code === 200) {
          this.single.list = res.data.records || []
          this.single.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          // !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
          this.setHeight()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.single.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getGlobalList (page, noScroll) {
      if (this.global.loading) return
      this.global.loading = true
      this.global.pageIndex = page || 1
      this.$service(ChatroomNotice.global.list, {
        urlParams: {
          pageIndex: this.global.pageIndex,
          pageSize: this.global.pageSize
        }
      }).then(res => {
        this.global.loading = false
        if (res.code === 200) {
          this.global.list = res.data.records || []
          this.global.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          // !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.global.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    handlerGlobalNotice (e) {
      if (e.key === 'Enter') {
        e.returnValue = false
      }
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    },
    globalNotice: {
      deep: true,
      handler (val) {
        this.globalNotice.content = val.content.replace(/\r|\n/g, '')
      }
    },
    singlePublish: {
      deep: true,
      handler (val) {
        this.singlePublish.content = val.content.replace(/\r|\n/g, '')
      }
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
.nickname-form{
  .el-input{
    width: 180px;
  }
}
.single-list{
  position: relative;
  padding-left: 330px;
  // min-height: 400px;
  .single-form{
    width: 290px;
    position: absolute;
    left: 0;
    top: 0;
    height: 340px;
    padding: 20px 10px;
    border: 1px solid #ddd;
  }
}
</style>
