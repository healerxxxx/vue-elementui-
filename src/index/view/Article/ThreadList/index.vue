<template>
  <div class="thread-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      stripe
      @sort-change="sortList"
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="docId"
        label="DocId"
        width="165">
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="topicName"
        label="标题"
        width="100" />
      <el-table-column
        prop="nickname"
        label="作者"
        width="80">
      </el-table-column>
      <el-table-column
        prop="source"
        label="来源"
        width="80">
      </el-table-column>
      <el-table-column
        prop="ptime"
        label="发布时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.ptime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="cmsWeight"
        label="cms权重"
        width="80">
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="sortRrders"
        prop="appWeight"
        label="APP权重"
        width="110">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.appWeight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="80">
        <template slot-scope="scope">
          <el-button size="mini" :loading="scope.row.loading" :type="scope.row.status ? 'primary' : 'text'" @click="update(scope.row)">{{scope.row.status ? '隐藏' : '展示'}}</el-button>
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
  </div>
</template>

<script>
import { ThreadList } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'ArticleThreadList',
  data () {
    return {
      sortRrders: ['descending', 'ascending', null],
      filterQuery: {},
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
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (pageIndex) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = pageIndex || 1
      this.$service(ThreadList.list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: this.filterQuery.sortField ? {'sortByWeight': this.filterQuery.sortDesc} : null
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
    sortList (column, prop, order) {
      this.filterQuery.sortField = column.prop
      this.filterQuery.sortDesc = column.order === 'ascending' ? false : column.order === 'descending' ? true : null
      this.getList(1)
    },
    changeWeight (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{1,3}$/,
        inputErrorMessage: '0-999之间',
        closeOnClickModal: false,
        inputValue: data.appWeight
      }).then(({ value }) => {
        this.$service(ThreadList.weight, {
          method: 'post',
          urlParams: {
            id: data.id
          },
          data: {
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList(this.pageIndex)
            this.$message.success('修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    update (data) {
      const { status } = data
      if (data.loading) return
      this.$set(data, 'loading', true)
      this.$service(status ? ThreadList.inactivate : ThreadList.activate, {
        method: 'post',
        urlParams: {
          id: data.id
        }
      }).then(res => {
        if (res.code === 200) {
          data.status = status ? 0 : 1
          this.$message.success('修改成功！')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      }).finally(() => {
        data.loading = false
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
