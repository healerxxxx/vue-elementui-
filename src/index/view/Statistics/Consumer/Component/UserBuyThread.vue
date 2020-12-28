<template>
  <div class="user-buy-thread-wrap">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.time"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          style="width:240px"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="用户Excel">
        <el-upload
          accept=".xls,.xlsx,.xlc,.xlm,.xlt,.xlw"
          :on-change="handleFileChange"
          :show-file-list="false"
          :auto-upload="false">
          <el-button slot="trigger" size="mini" type="primary">{{fileName?fileName:'选取文件'}}</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
        <el-button size="mini" type="danger" :loading="exportLoading" @click="getList('export')">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="userId"
        label="用户ID"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="orderType"
        label="购买类型"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.orderType | orderType2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="threadCount"
        label="文章数"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="goodsPriceSum"
        label="消费金额"
        min-width="80">
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
import { StatisticsConsumer } from '../../../../util/api'
export default {
  name: 'statisticsUserByThread',
  props: {
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      filter: {
        time: '',
        excel: null
      },
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      exportLoading: false,
      tableHeight: null,
      fileName: null
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (type) {
      if (!this.filter.time) return this.$message.warning('请选择具体的时间范围')
      if (!this.filter.excel) return this.$message.warning('请选择用户ID的Excel')
      let _data = new FormData()
      _data.append('startTime', this.filter.time[0] + ' 00:00:00')
      _data.append('endTime', this.filter.time[1] + ' 23:59:59')
      _data.append('excel', this.filter.excel)
      if (type === 'export') {
        if (this.exportLoading) return
        this.exportLoading = true
      } else {
        if (this.loading) return
        this.loading = true
        this.pageIndex = type || 1
        _data.append('pageIndex', this.pageIndex)
        _data.append('pageSize', this.pageSize)
      }
      this.$service(type === 'export' ? StatisticsConsumer[0].userBuyThread.export : StatisticsConsumer[0].userBuyThread.list, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: type === 'export' ? 'blob' : '',
        data: _data
      }).then(res => {
        if (type === 'export') {
          this.exportLoading = false
          if (res) {
            let reader = new FileReader()
            reader.readAsDataURL(res)
            reader.onload = function (e) {
              let element = document.createElement('a')
              element.download = '用户购买数据统计.xlsx'
              element.href = e.target.result
              document.body.appendChild(element)
              element.click()
            }
          }
        } else {
          this.loading = false
          if (res.code === 200) {
            this.list = res.data.records || []
            this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.setHeight()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
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
