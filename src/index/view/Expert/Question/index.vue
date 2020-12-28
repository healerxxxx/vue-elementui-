<template>
  <div class="expert-question">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="状态">
        <el-select v-model="filter.status" style="width:105px">
          <el-option label="全部" value="">全部</el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in questionStatus" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-from-item>
        <el-input
          placeholder="专家名/专家ID/通行证"
          prefix-icon="el-icon-search"
          clearable
          v-model="filter.query"
          size="mini"
          style="width:auto;">
        </el-input>
        <el-button type="primary" size="mini" @click="getList()">搜索</el-button>
      </el-from-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="questionAnsweringTopicId"
        label="心愿ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="askTime"
        label="发布时间"
        width="140">
        <template slot-scope="scope">
          {{[scope.row.askTime, 'yyyy-MM-dd hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="心愿描述"
        min-width="180"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="nickName"
        label="用户昵称"
        min-width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.userId, source: 0}}">{{scope.row.nickName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="expertNickName"
        label="专家"
        min-width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.expertId}}">{{scope.row.expertNickName}}</router-link>({{scope.row.xCount+'/'+scope.row.yCount}})
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template slot-scope="scope">
          {{scope.row.status | questionStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="replyContent"
        label="专家回复内容"
        min-width="200"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="replyTime"
        label="回复时间"
        width="140">
        <template slot-scope="scope">
          <span>{{[scope.row.replyTime, 'yyyy-MM-dd hh:mm'] | dateFormat}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="80">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="getQuestionInfo(scope.row)">详情</el-button>
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
      title="详情"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="600px">
      <div class="question-detail">
        <div class="title-detail" v-if="questionDetail">
          <p>
            <span>{{vip2CH[questionDetail.level]}}会员：{{questionDetail.nickName.slice(0,1) + '***' + questionDetail.nickName.slice(-1)}}</span>
            <span class="time">
              <span>提问于：{{[questionDetail.askTime, 'yyyy-MM-dd hh:mm'] | dateFormat}}</span>
              <el-button type="primary" size="mini" :loading="rejectLoading" v-if="questionDetail.status===0" @click="questionReject()">驳回</el-button>
              <el-button type="warning" size="mini" v-if="questionDetail.status===1">已驳回</el-button>
            </span>
          </p>
          <p v-if="!questionDetail.titleEditor">
            <span>问：</span>
            <span v-if="questionDetail.status!==1" @dblclick="$set(questionDetail, 'titleEditor', true),$set(questionDetail, 'titleTemp', questionDetail.title)">{{questionDetail.title}}</span>
            <span v-if="questionDetail.status===1">{{questionDetail.title}}</span>
          </p>
          <p v-if="questionDetail.titleEditor">
            <el-input
              type="textarea"
              :rows="3"
              placeholder="请输入新的问题"
              v-model="questionDetail.titleTemp">
            </el-input>
            <el-button style="position: absolute;right: 10px;bottom: 10px;" :loading="titleLoading" type="primary" size="mini" @click="updateQuestionTitle">提交</el-button>
          </p>
        </div>
        <div class="content-detail" v-if="questionDetail">
          <p>
            <span>专家：{{questionDetail.expertNickName}}</span>
            <span class="time" v-if="questionDetail.replyTime">
              <span>回答于：{{[questionDetail.replyTime, 'yyyy-MM-dd hh:mm'] | dateFormat}}</span>
            </span>
          </p>
          <p v-if="questionDetail.replyContent&&!questionDetail.contentEditor">
            <span>答：</span>
            <span v-if="questionDetail.status!==1&&questionDetail.status!==2" @dblclick="$set(questionDetail, 'contentEditor', true),$set(questionDetail, 'replyContentTemp', questionDetail.replyContent)">{{questionDetail.replyContent}}</span>
            <span v-if="questionDetail.status===1||questionDetail.status===2">{{questionDetail.replyContent}}</span>
          </p>
          <p v-if="questionDetail.contentEditor">
            <el-input
              type="textarea"
              :rows="3"
              placeholder="请输入新的问题"
              v-model="questionDetail.replyContentTemp">
            </el-input>
            <el-button style="position: absolute;right: 10px;bottom: 10px;" :loading="contentLoading" type="primary" size="mini" @click="updateQuestionContent">提交</el-button>
          </p>
          <p v-if="questionDetail.status===0" style="color:#999;">待回复</p>
          <p v-if="questionDetail.status===2" style="color:#999;">已超时</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ExpertQuestion } from '../../../util/api'
import baseType from '../../../util/base'
import { mapState } from 'vuex'
export default {
  name: 'ExpertQuestion',
  data () {
    return {
      loading: false,
      filter: {
        status: '',
        query: ''
      },
      questionStatus: baseType.questionStatus,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      visible: false,
      questionDetail: null,
      rejectLoading: false,
      titleLoading: false,
      contentLoading: false,
      vip2CH: {
        0: '小白',
        1: '银卡',
        2: '金卡',
        3: '钻石卡',
        4: '至尊VIP卡'
      }
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
    getList (arg) {
      if (this.loading) return
      this.pageIndex = arg || 1
      let _data = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }
      if (this.filter.query) _data['query'] = this.filter.query
      if (this.filter.status !== '') _data['status'] = this.filter.status
      this.loading = true
      this.$service(ExpertQuestion.list, {
        method: 'post',
        data: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
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
    getQuestionInfo (data) {
      this.questionDetail = Object.assign({}, data)
      this.visible = true
    },
    questionReject () {
      if (this.rejectLoading) return
      this.rejectLoading = true
      this.$service(ExpertQuestion.reject, {
        params: {
          topicId: this.questionDetail.questionAnsweringTopicId
        }
      }).then(res => {
        this.rejectLoading = false
        if (res.code === 200) {
          this.questionDetail.status = 1
          this.getList(this.pageIndex)
          this.$message.success('驳回成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.rejectLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    updateQuestionTitle () {
      if (this.questionDetail.titleTemp.length === 0) return this.$message.warning('用户问题不为空')
      if (this.questionDetail.titleTemp.length > 200) return this.$message.warning('用户问题字数最多200字')
      if (this.titleLoading) return
      this.titleLoading = true
      this.$service(ExpertQuestion.updateTitle, {
        method: 'post',
        data: {
          topicId: this.questionDetail.questionAnsweringTopicId,
          content: this.questionDetail.titleTemp
        }
      }).then(res => {
        this.titleLoading = false
        if (res.code === 200) {
          this.questionDetail.title = this.questionDetail.titleTemp
          this.questionDetail.titleEditor = false
          this.getList(this.pageIndex)
          this.$message.success('修改问题成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.titleLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    updateQuestionContent () {
      if (this.questionDetail.replyContentTemp.length === 0) return this.$message.warning('专家回答不为空')
      if (this.questionDetail.replyContentTemp.length > 2000) return this.$message.warning('专家回答字数最多2000字')
      if (this.contentLoading) return
      this.contentLoading = true
      this.$service(ExpertQuestion.updateContent, {
        method: 'post',
        data: {
          topicId: this.questionDetail.questionAnsweringTopicId,
          content: this.questionDetail.replyContentTemp
        }
      }).then(res => {
        this.contentLoading = false
        if (res.code === 200) {
          this.questionDetail.replyContent = this.questionDetail.replyContentTemp
          this.questionDetail.contentEditor = false
          this.getList(this.pageIndex)
          this.$message.success('修改专家回答成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.contentLoading = false
          this.$message.error(JSON.stringify(err))
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
.question-detail {
  color: #333;
  p {
    line-height: 1.5;
    margin: 1em 0;
    position: relative;
    word-break: break-all;
    word-wrap: break-word;
    span {
      &.time {
        float: right;
        color: #999;
      }
    }
  }
  .content-detail {
    border-top: 1px solid #ddd;
  }
}
</style>
