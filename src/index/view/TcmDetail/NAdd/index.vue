<template>
  <div class="tcm-n-add">
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
          <el-option value="4" label="提前结算"></el-option>
          <el-option value="5" label="购买竞猜失败"></el-option>
          <el-option value="6" label="竞猜赢得"></el-option>
          <el-option value="8" label="奖品退款"></el-option>
          <el-option value="9" label="退单返回"></el-option>
          <el-option value="10" label="重新结算退款"></el-option>
          <el-option value="14" label="拉新竞猜赢得"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getList()">查询</el-button>
      </el-form-item>
      <el-form-item label="当月总计新增N币">
        {{sumMonthNCoin}}
      </el-form-item>
      <el-form-item label="累计新增N币">
        {{sumNCoin}}
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportExcel">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="userNCoinId" label="N币新增ID" width="120">
      </el-table-column>
      <el-table-column prop="orderId" label="订单ID" min-width="150">
      </el-table-column>
      <el-table-column prop="successTime" label="成功时间" min-width="160">
      </el-table-column>
      <el-table-column prop="flowClassName" label="N币新增类型" min-width="120">
      </el-table-column>
      <el-table-column prop="logTypeName" label="商品名称" min-width="140">
      </el-table-column>
      <el-table-column prop="creditNCoinChange" label="新增N币数" width="140">
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { TcmDetailNadd } from '../../../util/api'
import { formatDate, isNumber } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'tcmNAdd',
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
      sumMonthNCoin: 0,
      sumNCoin: 0,
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
      this.$service(TcmDetailNadd.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.nCoinList && res.data.nCoinList.records ? res.data.nCoinList.records : []
          this.pageCount = res.data.nCoinList && res.data.nCoinList.page ? res.data.nCoinList.page.pageCount : 1
          this.sumMonthNCoin = res.data.sumMonthNCoin || 0
          this.sumNCoin = res.data.sumNCoin || 0
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
      window.open(window.location.origin + TcmDetailNadd.export + '?' + arr.join('&'))
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
