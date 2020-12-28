<template>
  <div class="tcm-credit-add">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item label="月份">
        <el-date-picker v-model="filterQuery.month" :clearable="false" type="month" editable="false" width="100"
          value-format="yyyy.MM" style="width:110px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="filterQuery.typeId" style="width:130px">
          <el-option value="" label="全部"></el-option>
          <el-option value="1" label="购买数据服务"></el-option>
          <el-option value="2" label="任务"></el-option>
          <el-option value="5" label="购买竞猜失败"></el-option>
          <el-option value="9" label="退单返回"></el-option>
          <el-option value="12" label="下单返积分"></el-option>
          <el-option value="14" label="拉新竞猜退单"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getList()">查询</el-button>
      </el-form-item>
      <el-form-item label="当月总计新增积分">
        {{sumMonthCredit}}
      </el-form-item>
      <el-form-item label="累计新增积分">
        {{sumCredit}}
      </el-form-item>
      <el-form-item label="当前总计剩余积分">
        {{remainCredit}}
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportExcel">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="userCreditId" label="积分新增ID" width="120">
      </el-table-column>
      <el-table-column prop="orderId" label="订单ID" min-width="150">
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" min-width="130">
      </el-table-column>
      <el-table-column prop="successTime" label="成功时间" min-width="160">
      </el-table-column>
      <el-table-column prop="flowClassName" label="积分新增类型" min-width="120">
      </el-table-column>
      <el-table-column prop="logTypeName" label="商品名称" min-width="140">
      </el-table-column>
      <el-table-column prop="creditNCoinChange" label="新增积分数" width="140">
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { TcmDetailCreditAdd } from '../../../util/api'
import { formatDate, isNumber } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'TcmDetailCreditAdd',
  data () {
    return {
      filterQuery: {
        month: formatDate(new Date(), 'yyyy.MM'),
        typeId: ''
      },
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      sumMonthCredit: 0,
      sumCredit: 0,
      remainCredit: 0,
      tableHeight: null
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
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = isNumber(page) ? page : 1
      let _data = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        month: this.filterQuery.month
      }
      if (this.filterQuery.typeId) _data['typeId'] = this.filterQuery.typeId
      this.$service(TcmDetailCreditAdd.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.creditList && res.data.creditList.records ? res.data.creditList.records : []
          this.pageCount = res.data.creditList && res.data.creditList.page ? res.data.creditList.page.pageCount : 1
          this.sumMonthCredit = res.data.sumMonthCredit || 0
          this.sumCredit = res.data.sumCredit || 0
          this.remainCredit = res.data.remainCredit || 0
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    exportExcel () {
      if (this.list.length === 0) {
        return this.$message.warning('暂无数据')
      }
      let arr = []
      Object.keys(this.filterQuery).forEach(key => {
        if (this.filterQuery[key]) {
          arr.push(key + '=' + this.filterQuery[key])
        }
      })
      window.open(window.location.origin + TcmDetailCreditAdd.export + '?' + arr.join('&'))
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
