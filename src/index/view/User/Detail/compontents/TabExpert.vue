<template>
  <div class="tab-expert" v-show="visible">
    <el-table
      :data="list"
      stripe
      style="width: 100%"
      v-loading="loading"
      ref="expertTable">
      <el-table-column prop="expertId"
        label="专家ID">
      </el-table-column>
      <el-table-column prop="orderStatus"
        label="专家昵称">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.expertId}}">{{scope.row.expertName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="totalEarningRate"
        label="专家总盈利率">
        <template slot-scope="scope">
          {{scope.row.totalEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="threadCount"
        label="购买此专家文章数">
      </el-table-column>
      <el-table-column prop="threadHit"
        label="购买命中篇数">
      </el-table-column>
      <el-table-column prop="favThread"
        label="收藏此专家文章数">
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
  name: 'tabExpert',
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
      list: []
    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
    }
  },
  methods: {
    getList (pageIndex = 1) {
      this.loading = true
      this.$service(UserDetail[0].getPayExpertList, {
        method: 'post',
        data: {
          userId: this.userId,
          offset: (pageIndex - 1) * this.pageSize,
          limit: this.pageSize
        }
      }).then(
        res => {
          this.loading = false
          if (res.code === 200 && res.data) {
            this.list = res.data.data || []
            this.pageIndex = pageIndex
            this.pageCount = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1
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
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
      }
    },
    userId (val) {
      this.list = []
      if (this.visible) {
        this.getList()
      }
    }
  }
}
</script>
