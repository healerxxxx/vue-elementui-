<template>
  <div class="tab-match" v-show="visible">
    <div v-if="info">
      <span>购买2篇相同赛事次数：{{info.twoCount || '-'}}</span>；
      <span>购买3篇以上相同赛事次数： {{info.overThreeCount || '-'}}</span>
    </div>
    <el-table
      :data="list"
      stripe
      style="width: 100%"
      v-loading="loading">
      <el-table-column
        prop="matchInfoId"
        label="赛事ID">
      </el-table-column>
      <el-table-column
        prop="matchTitle"
        label="比赛对阵">
        <template slot-scope="scope">
          <router-link :to="{name: 'MatchDetail', params: {id: scope.row.matchInfoId}}">{{scope.row.matchTitle}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="matchTime"
        label="开赛时间">
        <template slot-scope="scope">
          {{[scope.row.matchTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="expert"
        label="专家昵称">
      </el-table-column>
      <el-table-column
        prop="isTarget"
        label="红/黑">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.isTarget !== -1" :color="scope.row.isTarget===1?'#e62121': scope.row.isTarget===0?'#333': 'transparent'" style="color:#fff">&nbsp;&nbsp;</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
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
  name: 'tabMatch',
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
    getList (page) {
      this.loading = true
      this.pageIndex = page || 1
      this.$service(UserDetail[0]['getMatchOrderList'], {
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
    // 购买赛事信息
    getCount () {
      this.$service(UserDetail[0]['getMatchOrderStatsInfo'], {
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
