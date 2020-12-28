<template>
  <div class="tab-thread" v-show="visible">
    <div v-if="info">
      <span>购买文章数：{{info.threadCount}}</span>；
      <span>总盈利率： {{info.totalEarningRate | toPercent}}</span>；
      <span>总命中率：{{info.totalHitRate | toPercent}}</span>；
      <span>红：{{info.threadWinCount}}</span>；
      <span>黑：{{info.threadLoseCount}}</span>；
      <span>近期连黑：{{info.threadContinueLoseCount}}</span>；
      <span>最高连黑：{{info.threadMaxContinueLoseCount}}</span>
    </div>
    <el-table
      :data="list"
      stripe
      style="width: 100%"
      v-loading="loading">
      <el-table-column
        prop="threadId"
        label="文章ID">
      </el-table-column>
      <el-table-column
        prop="title"
        label="文章标题">
        <template slot-scope="scope">
          <router-link :to="{name: 'ArticleQuizDetail', params: {id: scope.row.threadId}}">{{scope.row.title}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="文章发布时间">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="nickname"
        label="专家昵称">
      </el-table-column>
      <el-table-column
        prop="partOfAllRate"
        label="专家近X场命中率">
      </el-table-column>
      <el-table-column
        prop="threadHitRateStr"
        label="红/黑">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.threadHitRateStr" :color="scope.row.isWin===1?'#e62121':'#333'" style="color:#fff">{{scope.row.threadHitRateStr}}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { UserDetail } from '../../../../util/api'
export default {
  name: 'tabThread',
  props: {
    visible: {
      type: 'Boolean',
      default: false
    },
    userId: {
      type: 'Number'
    }
  },
  data () {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      list: [],
      info: null
    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
      this.getCount()
    }
  },
  methods: {
    // 购买文章列表
    getList (page) {
      this.loading = true
      this.pageIndex = page || 1
      this.$service(UserDetail[0]['getThreadOrderList'], {
        method: 'get',
        params: {
          userId: this.userId,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(
        res => {
          this.loading = false
          if (res.code === 200 && res.data) {
            this.list = res.data.records || []
            this.pageCount = res.data.page.pageCount || 1
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    // 购买文章相关信息
    getCount () {
      this.$service(UserDetail[0]['getThreadOrderStatsInfo'], {
        method: 'get',
        params: {
          userId: this.userId
        }
      }).then(
        res => {
          if (res.code === 200 && res.data) {
            this.info = res.data || {}
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.getCount()
      }
    },
    userId (val) {
      this.list = []
      this.info = {}
      if (this.visible) {
        this.getList()
        this.getCount()
      }
    }
  }
}
</script>
