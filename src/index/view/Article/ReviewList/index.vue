<template>
  <div class="review-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input
          placeholder="标题/文章ID/专家名"
          prefix-icon="el-icon-search"
          clearable
          v-model="queryParam"
          @change="getSearchList()"
          size="small"
          style="width:auto;">
        </el-input>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item label="复盘状态">
        <el-select v-model="filterQuery.reviewStatus"  @change="getList()">
          <el-option label="已复盘" value="1"></el-option>
          <el-option label="未复盘" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="lotteryCategoryId"
        label="彩种"
        width="80">
        <template slot-scope="scope">
          {{lottery2CH[scope.row.lotteryCategoryId] || ''}}
        </template>
      </el-table-column>
      <el-table-column
        prop="planReviewTime"
        label="复盘时间"
        width="160">
      </el-table-column>
      <el-table-column
        prop="content"
        label="复盘内容"
        min-width="160">
        <template slot-scope="scope">
          <router-link ne-if="scope.row.content" :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.content | removeXSS}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="文章发布时间"
        width="160">
      </el-table-column>
      <el-table-column
        prop="title"
        label="文章标题"
        min-width="160">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.title | removeXSS}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="threadId"
        label="文章ID"
        width="80">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.threadId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="userId"
        label="专家"
        width="80">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ExpertDetail', params: { id: scope.row.userId }}">{{scope.row.realName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="isWin"
        label="方案结果"
        width="80">
        <template slot-scope="scope">
          <el-tag size="mini" :color="scope.row.isWin===1?'#e62121':'#333'" style="color:#fff">{{scope.row.hitRateValue}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="price"
        label="价格"
        width="50">
        <template slot-scope="scope">
          <span v-if="scope.row.price > 0">{{scope.row.price}}</span>
          <span v-else class="text-red">免费</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="buyCount"
        label="购买数"
        width="70">
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="pageChange"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { CommonApi, ReviewList } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'ArticleReviewList',
  data () {
    return {
      filterQuery: {
        reviewStatus: '1'
      },
      lottery2CH: {},
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  filters: {
    removeXSS (val) {
      return val.replace(/<[^>]*>/g, '')
    }
  },
  created () {
    this.getList()
    this.getLottery()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    /**
     * @description: 获取彩种信息
     */
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.lottery2CH[item.cId] = item.cName
          })
        }
      })
    },
    getList (pageIndex) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = pageIndex || 1
      this.queryParam = ''
      this.$service(ReviewList.list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: {
          reviewStatus: this.filterQuery.reviewStatus
        }
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
    getSearchList (pageIndex) {
      if (this.loading) return
      if (!this.queryParam) {
        this.filterQuery.reviewStatus = '1'
        return this.getList()
      }
      this.loading = true
      this.pageIndex = pageIndex || 1
      this.filterQuery.reviewStatus = null
      this.$service(ReviewList.search, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: {
          queryParam: this.queryParam
        }
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
    pageChange (page) {
      if (this.queryParam) {
        this.getSearchList(page)
      } else {
        this.getList(page)
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
