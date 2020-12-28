<template>
  <div class="user-buy-thread-wrap">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker v-model="filter.startDate" type="date" editable="false" width="100" placeholder="开始日期"
          value-format="yyyy-MM-dd" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endDate).getTime() !== 0 && time.getTime() > new Date(filter.endDate).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filter.endDate" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startDate).getTime() !== 0 && time.getTime() < new Date(filter.startDate).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getList('filter')">查询</el-button>
        <el-button size="mini" type="danger" :loading="exportLoading" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item>
        人数：{{totalPerson}} 人 ； 金额 ：{{totalFee}} 元
      </el-form-item>
      <el-form-item label="" style="float:right">
        <el-input placeholder="搜索专家ID/邀请码" prefix-icon="el-icon-search" clearable v-model="filter.queryParam"
          @clear="getList()" @change="getList('search')" size="mini" style="width:auto;">
        </el-input>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe style="width: 100%" @sort-change="sortList"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="pushHandsUserId" label="店铺ID" min-width="80">
      </el-table-column>
      <el-table-column prop="inviteCode" label="邀请码" min-width="80" v-if="!search">
      </el-table-column>
      <el-table-column prop="invitePerson" label="新增邀请人数（人）" min-width="80" sortable="custom" :sort-orders="sortRrders">
      </el-table-column>
      <el-table-column prop="fee" label="结算金额（元）" min-width="80" sortable="custom" :sort-orders="sortRrders">
      </el-table-column>
      <el-table-column prop="settleDate" label="结算日期" min-width="80" v-if="search">
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset" v-if="search">
    </el-pagination>
  </div>
</template>

<script>
import { StatisticsConsumer } from '../../../../util/api'
import { isNumber } from '../../../../util/tool'
export default {
  name: 'lotteryPush',
  props: {
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      listType: 'filter', // filter || search
      sortRrders: ['descending', 'ascending', null],
      filter: {
        startDate: '',
        endDate: '',
        queryParam: '',
        sortDesc: '',
        sortField: ''
      },
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      exportLoading: false,
      tableHeight: null,
      totalFee: 0,
      totalPerson: 0,
      search: false
    }
  },
  created () {
    this.getList()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = isNumber(page) ? page : 1
      let _data = {}
      if (this.filter.startDate) {
        _data['startDate'] = this.filter.startDate
      }
      if (this.filter.endDate) {
        _data['endDate'] = this.filter.endDate
      }
      if (this.filter.queryParam) {
        this.search = true
        _data['queryParam'] = this.filter.queryParam
        _data['pageIndex'] = this.pageIndex
        _data['pageSize'] = this.pageSize
      }
      if (page === 'search') {
        _data['startDate'] = null
        _data['endDate'] = null
        this.filter.startDate = ''
        this.filter.endDate = ''
      }
      if (!page || page === 'category') this.filter.sortField = null
      if (this.filter.sortField) {
        _data = Object.assign(_data, { sortField: this.filter.sortField, sortDesc: this.filter.sortDesc })
      }
      this.$service(StatisticsConsumer[0].lotterPush.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.page.records || []
          this.pageCount = res.data.page ? res.data.page.page.pageCount : 1
          this.totalFee = res.data.totalFee || 0
          this.totalPerson = res.data.totalPerson || 0
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
    /**
     * @description: 根据服务器数据排序
     * @param {String} column 列状态
     */
    sortList (column, prop, order) {
      this.filter.sortField = column.prop
      this.filter.sortDesc = column.order === 'ascending' ? false : column.order === 'descending' ? true : null
      this.getList('sort')
    },
    exportList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      const downloadUrl = location.origin + StatisticsConsumer[0].lotterPush.export
      let _arr = []
      Object.keys(this.filter).forEach(item => {
        if (this.filter[item]) _arr.push(item + '=' + this.filter[item])
      })
      window.open(downloadUrl + '?' + _arr.join('&'))
    },
    handleFileChange (file, fileList) {
      this.fileName = file.name
      this.filter.excel = file.raw
      if (fileList.length > 1) {
        fileList.splice(0, fileList.length - 1)
      }
    }
  },
  watch: {
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>
