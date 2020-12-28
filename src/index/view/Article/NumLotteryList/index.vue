<template>
  <div class="numlottery-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- <div class="tools">
        <el-input
          placeholder="标题/文章ID/专家名"
          prefix-icon="el-icon-search"
          clearable
          v-model="searchQuery"
          @clear="getFilterList()"
          @change="getSearchList('search')"
          size="mini"
          style="width:auto;">
        </el-input>
      </div> -->
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item>
        <el-radio-group v-model="filterQuery.threadTypeId" @change="getFilterList('gameType')">
          <el-radio-button label="0">全部</el-radio-button>
          <el-radio-button :label="item.cId" v-for="item in lotteryList" :key="item.cId">{{item.cName}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker v-model="filterQuery.startTime" type="date" editable="false" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00" style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.endTime).getTime() !== 0 && time.getTime() > new Date(filterQuery.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filterQuery.endTime" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.startTime).getTime() !== 0 && time.getTime() < new Date(filterQuery.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="期数">
        <el-input v-model="filterQuery.degree" @keyup.native="handlerDegreeSearch" placeholder="请输入期数" clearable
          style="width:110px">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getFilterList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" v-loading="loading" @sort-change="sortList" stripe style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column label="彩种" width="80">
        <template slot-scope="scope">
          {{scope.row.threadTypeId | numLotteryId2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="numLotteryThreadId" label="文章ID" width="140">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.numLotteryThreadId }}">
            {{scope.row.numLotteryThreadId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.numLotteryThreadId}}">
            {{scope.row.title}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="185">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="专家" width="110">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ExpertDetail', params: { id: scope.row.userId }}">{{scope.row.name}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="buyCount" label="购买数" width="115">
      </el-table-column>
      <el-table-column prop="points" label="点数" width="60">
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.price > 0">{{scope.row.price}}</span>
          <span v-else class="text-red">免费</span>
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="权重" width="60">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeightColumn(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          {{scope.row.plock | articleStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="periodsDegree" label="期数" min-width="100">
      </el-table-column>
    </el-table>
    <el-pagination
      background layout="prev, pager, next"
      @current-change="getFilterList"
      :current-page="Math.floor(offset/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset" />
  </div>
</template>

<script>
import { NumLotteryList } from '../../../util/api'
import { mapState } from 'vuex'
// import { formatDate } from '../../../util/tool'
const lotteryList = [
  { cName: '双色球', cId: 101 },
  { cName: '3D', cId: 102 },
  { cName: '大乐透', cId: 103 },
  { cName: '排列3', cId: 104 },
  { cName: '排列5', cId: 105 }
]
const lotteryListObj = {}
lotteryList.map(item => {
  lotteryListObj[item.cId] = item.cName
})
export default {
  name: 'ArticleNumLotteryList',
  data () {
    return {
      listType: 'filter', // filter || search
      offset: 0,
      limit: 20,
      total: 1,
      lotteryList: lotteryList,
      list: [],
      filterQuery: {
        lotteryCategoryId: '0',
        startTime: null,
        threadTypeId: '0',
        endTime: null,
        numLotteryThreadId: '0',
        degree: null
      },
      // searchQuery: '',
      loading: false,
      tableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  filters: {
    numLotteryId2CH (val) {
      return lotteryListObj[val] || ''
    }
  },
  created () {
    this.getFilterList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    /**
     * @description: 获取filter条件列表
     */
    getFilterList (page) {
      if (this.loading) return
      this.loading = true
      if (typeof page === 'number') {
        this.offset = page ? (page - 1) * this.limit : 0
      } else {
        this.offset = 0
      }
      const filter = {
        offset: this.offset,
        limit: this.limit
      }
      if (this.filterQuery.threadTypeId !== '0') {
        filter['gameType'] = this.filterQuery.threadTypeId
      }
      if (this.filterQuery.startTime) {
        filter['startTime'] = this.filterQuery.startTime
      }
      if (this.filterQuery.endTime) {
        filter['endTime'] = this.filterQuery.endTime
      }
      if (this.filterQuery.degree) {
        filter['degree'] = this.filterQuery.degree
      }
      this.$service(NumLotteryList.filterList, {
        params: filter
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.listType = 'filter'
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
    // getSearchList (arg) {
    //   if (!this.searchQuery || this.loading) return
    //   this.loading = true
    //   this.pageIndex = arg === 'search' ? 1 : arg
    //   this.filterQuery.lotteryCategoryId = null
    //   this.$service(NumLotteryList.searchList, {
    //     urlParams: {
    //       pageIndex: this.pageIndex,
    //       pageSize: this.pageSize
    //     },
    //     params: {
    //       queryParam: this.searchQuery
    //     }
    //   }).then(res => {
    //     this.loading = false
    //     if (res.code === 200) {
    //       this.listType = 'search'
    //       this.$refs.elTable.bodyWrapper.scrollTop = 0
    //       this.list = res.data.records || []
    //       this.pageCount = res.data.page ? res.data.page.pageCount : 1
    //     } else {
    //       this.$message.error(res.code + ':' + res.message)
    //     }
    //   }, err => {
    //     if (err) {
    //       this.loading = false
    //       this.$message.error(JSON.stringify(err))
    //     }
    //   })
    // },
    /**
     * @description: 通过keyup事件，正则替换非数字
     */
    handlerDegreeSearch () {
      this.filterQuery.degree = this.filterQuery.degree.replace(/[^0-9-]/g, '')
    },
    changeWeightColumn (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^-?\d{1,3}$/,
        inputErrorMessage: '-999-999之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        this.$service(NumLotteryList.modifyWeight, {
          method: 'post',
          urlParams: {
            threadId: data.numLotteryThreadId
          },
          params: {
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            data.weight = value
            this.$message.success('修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
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
