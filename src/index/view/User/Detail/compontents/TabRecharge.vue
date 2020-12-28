<template>
  <div class="tab-recharge" v-show="visible">
    <el-form
      :inline="true"
      :model="filter"
      size="mini"
      :disabled="loading">
      <el-form-item label="订单ID">
        <el-input clearable
          v-model="filter.orderId"
          placeholder="请输入订单ID">
        </el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select clearable
          v-model="filter.orderStatus"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in rechargeOrderStatus"
            :value="item.id"
            :key="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端">
        <el-select clearable
          v-model="filter.payTerminal"
          @change="getPrice"
          :disabled="priceLoading"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in payTerminal"
            :value="item.id"
            :key="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="价位" v-show="filter.payTerminal">
        <el-select
          clearable
          v-model="filter.orderPrice"
          style="width:105px"
          :loading="priceLoading">
          <el-option
            :label="item.name"
            v-for="item in price"
            :value="item.redCurrency"
            :key="item.goodsId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker v-model="filter.date"
          value-format="yyyy-MM-dd"
          type="daterange"
          :editable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <el-button type="primary" @click="filterList">筛选</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="list"
      stripe
      style="width: 100%"
      v-loading="loading">
      <el-table-column prop="orderId"
        label="订单ID"
        width="180">
        <template slot-scope="scope">
          <router-link :to="{name: 'OrderRechargeDetail', params: {id: scope.row.orderId, source: 0}}">{{scope.row.orderId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatus"
        label="订单状态">
        <template slot-scope="scope">
          {{scope.row.orderStatus | rechargeOrder2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime"
        label="订单创建时间">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="successTime"
        label="订单成功时间">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="buyCount"
        label="购买数">
      </el-table-column>
      <el-table-column prop="createTime"
        label="红豆价格/订单价格">
        <template slot-scope="scope">
          {{scope.row.redCurrency || '-'}} / {{scope.row.orderPrice || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="payTerminal"
        label="支付终端">
        <template slot-scope="scope">
          <span>{{ [scope.row.payTerminal, 0] | payTerminal2CH }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="channelName"
        label="支付通道">
        <template slot-scope="scope">
          <span>{{ scope.row.channelName || '-'}}</span>
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
import baseType from '../../../../util/base'
import { UserDetail, PriceRecharge } from '../../../../util/api'
import { deleteObjEmpty } from '../../../../util/tool'
export default {
  name: 'tabRecharge',
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
      rechargeOrderStatus: baseType.rechargeOrderStatus,
      payTerminal: baseType.payTerminal[0],
      loading: false,
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      list: [],
      filter: {
        date: [],
        orderId: '',
        orderStatus: '',
        orderPrice: null,
        payTerminal: null
      },
      filterQuery: {},
      price: [],
      priceLoading: false
    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
    }
  },
  methods: {
    getList (page) {
      this.loading = true
      this.pageIndex = page || 1
      let data = Object.assign({
        userId: this.userId,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }, this.filterQuery)
      this.$service(UserDetail[0]['rechargeOrderList'], {
        method: 'post',
        data: data
      }).then(res => {
        this.loading = false
        if (res.code === 200 && res.data) {
          this.list = res.data.records || []
          this.pageCount = res.data.page.pageCount || 1
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
    filterList () {
      let filter = deleteObjEmpty(Object.assign({}, this.filter))
      if (this.filter.date && this.filter.date.length) {
        filter.startTime = filter.date[0] + ' 00:00:00'
        filter.endTime = filter.date[1] + ' 23:59:59'
        delete filter.date
      } else {
        delete filter.date
      }
      this.filterQuery = filter
      this.getList(1)
    },
    getPrice (id) {
      if (this.priceLoading) return
      this.price = []
      if (!this.filter.payTerminal) return
      this.priceLoading = true
      this.$service(PriceRecharge[0]['list'], {
        urlParams: {
          payTerminalId: id
        }
      }).then(res => {
        this.priceLoading = false
        if (res.code === 200 && res.data) {
          this.price = res.data
        } else {
          this.$message.error('获取价格失败')
        }
      }, err => {
        if (err) {
          this.priceLoading = false
          this.$message.error('获取价格失败')
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
      }
    },
    userId (val) {
      this.filter = {
        date: [],
        orderId: '',
        orderStatus: '',
        orderPrice: null,
        payTerminal: null
      }
      this.filterQuery = {}
      this.price = {}
      this.list = []
      if (this.visible) {
        this.getList()
      }
    }
  }
}
</script>
