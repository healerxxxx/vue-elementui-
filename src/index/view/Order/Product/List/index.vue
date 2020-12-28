<template>
  <div class="order-product-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs
      v-model="activeTab"
      v-if="appList.length > 0"
      @tab-click="handleClickTabs">
      <el-tab-pane v-for="item in appList"
        :label="item.name"
        :name='item.typeId.toString()'
        :key="item.typeId"
        :disabled="loading">
      </el-tab-pane>
    </el-tabs>
    <el-form :inline="true"
      :model="filterQuery"
      size="mini"
      ref="filterForm"
      :disabled="loading">
      <el-form-item>
        <el-select
          clearable
          @clear="filterQuery.filterTypeName=''"
          v-model="filterQuery.filterType"
          style="width:125px">
          <el-option label="订单ID" value="orderId"></el-option>
          <el-option label="用户通行证" value="userAccount"></el-option>
          <el-option label="商品ID" value="threadId"></el-option>
          <el-option label="专家通行证" value="expertAccount"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="filterQuery.filterTypeName"
          placeholder="请输入订单ID/用户通行证"
          :disabled="!filterQuery.filterType"></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select clearable
          v-model="filterQuery.orderStatus"
          style="width:105px">
          <el-option
            v-for="item in productOrderStatus"
            :label="item.name"
            :value="item.id"
            :key="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="支付终端">
        <el-select clearable
          v-model="filterQuery.payTerminal"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in payTerminal"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品类型">
        <el-select clearable
          v-model="filterQuery.goodsTypeId"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in goodsType[parseInt(activeTab) === 0 ? 0 : 1]"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式"
        prop="orderType">
        <el-select clearable
          v-model="filterQuery.orderType"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in productPayType[appListObj[activeTab] === '精准比分' ? 1 : 0]"
            :value="item.id"
            :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间"
        prop="date">
        <el-date-picker v-model="filterQuery.date"
          value-format="yyyy-MM-dd"
          type="daterange"
          :editable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions0"
          size="small">
        </el-date-picker>
      </el-form-item>
      <el-button size="mini"
        type="primary"
        @click="filterList()">筛选</el-button>
    </el-form>
    <el-table ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      style="width: 100%"
      @sort-change="sortList"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="orderId"
        label="订单ID"
        fixed
        min-width="170">
        <template slot-scope="scope">
          <router-link :to="{name: 'OrderProductDetail', params: {
            jzbf: appListObj[activeTab] === '精准比分' ? 1 : 0,
            id: scope.row.orderId,
            appId: activeTab,
            type: (scope.row.goodsTypeId === 1 && scope.row.orderType === 3) || scope.row.goodsTypeId === 5 ? 1 : 0
          }}">
            {{scope.row.orderId}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatus"
        label="订单状态"
        width="90">
        <template slot-scope="scope">
          {{scope.row.orderStatus | productOrderStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="frozenTime"
        label="订单冻结时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.frozenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="successTime"
        label="订单成功时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="account"
        label="用户通行证"
        min-width="180">
      </el-table-column>
      <el-table-column prop="goodsId"
        label="商品ID"
        min-width="130">
      </el-table-column>
      <el-table-column prop="goodsType"
        label="类型"
        width="100">
      </el-table-column>
      <el-table-column prop="orderPrice"
        label="订单价格"
        width="80">
      </el-table-column>
      <el-table-column prop="payTerminal"
        label="支付方式"
        width="80">
        <template slot-scope="scope">
          {{[scope.row.orderType, appListObj[activeTab] === '精准比分' ? 1 : 0] | productPayType2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="channelName"
        label="支付终端"
        width="80">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, appListObj[activeTab] === '精准比分' ? 1 : 0] | payTerminal2CH}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
      layout="prev, pager, next"
      @current-change="getList"
      page-size="pageSize"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { ProductOrder, appSelectList } from '../../../../util/api'
import baseType from '../../../../util/base'
import { deleteObjEmpty } from '../../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'OrderProductList',
  data () {
    return {
      appList: [],
      list: [],
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      tableHeight: null,
      activeTab: '0',
      loading: false,
      productOrderStatus: baseType.productOrderStatus,
      orderType: baseType.orderType,
      goodsType: baseType.goodsType,
      productPayType: baseType.productPayType,
      filterQuery: {
        orderStatus: '',
        payTerminal: '',
        orderType: '',
        goodsTypeId: '',
        date: []
      },
      filter: {},
      pickerOptions0: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    payTerminal () {
      let tab = 0
      if (this.appListObj[this.activeTab] === '精准比分') {
        tab = 1
      }
      if (this.appListObj[this.activeTab] !== '红彩' && this.appListObj[this.activeTab] !== '精准比分') {
        tab = null
      }
      return baseType.payTerminal[tab] || []
    },
    appListObj () {
      const obj = {}
      this.appList.map(item => {
        obj[item.typeId] = item.name
      })
      return obj
    },
    ProductOrderApi () {
      let tab = 0
      if (this.appListObj[this.activeTab] === '精准比分' && parseInt(this.filterQuery.goodsTypeId) > 1) {
        tab = 1
      }
      return ProductOrder[tab]
    }
  },
  created () {
    this.getAPPlist()
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (pageIndex = this.pageIndex) {
      if (this.loading) return
      this.loading = true
      let data = {
        pageIndex: pageIndex,
        pageSize: this.pageSize,
        appId: this.activeTab
      }
      this.$service(this.ProductOrderApi.list, {
        method: 'post',
        data: Object.assign({}, data, this.filter)
      }).then(res => {
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.list = res.data.records || []
          this.pageCount = res.data.page.pageCount
          this.pageIndex = res.data.page.pageIndex
        } else {
          this.list = []
          this.pageCount = 1
          this.$message.error(typeof res === 'string' ? res : res.code + ':' + res.message)
        }
        this.loading = false
      }, err => {
        if (err) {
          this.list = []
          this.pageCount = 1
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    handleClickTabs () {
      this.$refs['filterForm'].resetFields()
      this.filter = {}
      this.getList(1)
    },
    filterList () {
      let filter = deleteObjEmpty(Object.assign({}, this.filterQuery))
      if (!filter.filterTypeName) {
        delete filter.filterType
      } else {
        filter[filter.filterType] = filter.filterTypeName
        delete filter.filterTypeName
        delete filter.filterType
      }
      if (filter.date && filter.date.length) {
        filter.startTime = filter.date[0] + ' 00:00:00'
        filter.endTime = filter.date[1] + ' 23:59:59'
        delete filter.date
      }
      this.filter = filter
      this.getList(1)
    },
    getAPPlist () {
      this.$service(appSelectList).then(res => {
        if (res.code === 200) {
          this.appList = res.data.filter(item => item.typeId !== -1)
          this.setHeight()
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
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
