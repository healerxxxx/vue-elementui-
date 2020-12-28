<template>
  <div class="order-recharge-detail">
    <div class="payment-detail"
      v-loading="loading">
      <div class="nav-tools">
        <div class="nav">
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: fromRouter.fullPath }" v-if="fromRouter">{{fromRouter.meta.title}}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouter">{{currentRouter.meta.title}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="订单详细信息"
          name="0"
          v-loading="orderLoading">
          <table class="detail-table"
            v-if="orderDetail">
            <colgroup>
              <col width="10%">
              <col width="25%">
              <col width="10%">
              <col width="25%">
              <col width="10%">
              <col width="20%">
            </colgroup>
            <tr>
              <td>订单ID</td>
              <td>{{orderDetail.orderId}}</td>
              <td>商品ID</td>
              <td>{{orderDetail.goodsId}}</td>
              <td>订单创建时间</td>
              <td>{{[orderDetail.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
            </tr>
            <tr>
              <td>用户账号</td>
              <td>{{orderDetail.account}}</td>
              <td>商品名称</td>
              <td>{{orderDetail.goodsName}}</td>
              <td>订单成功时间</td>
              <td>{{[orderDetail.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
            </tr>
            <tr>
              <td>订单价格</td>
              <td>{{orderDetail.orderPrice}}元</td>
              <td>商品定价</td>
              <td>{{orderDetail.goodsPrice}}元</td>
              <td>退款时间</td>
              <td>{{[orderDetail.refundTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
            </tr>
            <tr>
              <td>订单类型</td>
              <td>{{orderDetail.orderType}}</td>
              <td>商品类型</td>
              <td>{{orderDetail.goodsTypeName}}</td>
              <td>IP地址</td>
              <td>{{orderDetail.ip}}</td>
            </tr>
            <tr>
              <td>订单状态</td>
              <td>{{orderDetail.orderStatus | rechargeOrder2CH}}</td>
              <td>商品类型ID</td>
              <td>{{orderDetail.goodsTypeId}}</td>
              <td>支付平台</td>
              <td>{{[orderDetail.payTerminal, source] | payTerminal2CH}}</td>
            </tr>
            <tr>
              <td>结算许可</td>
              <td>{{orderDetail.settlementLicense}}</td>
              <td>购买数量</td>
              <td>{{orderDetail.buyCount}}</td>
              <td>设备型号</td>
              <td>{{orderDetail.devicesModel || '-'}}</td>
            </tr>
            <tr>
              <td>渠道流水号</td>
              <td>{{orderDetail.exOrderId || '-'}}</td>
              <td>服务时长</td>
              <td>{{orderDetail.serviceDuration}}</td>
              <td>设备ID</td>
              <td>{{orderDetail.devicesId}}</td>
            </tr>
            <tr>
              <td>新增红豆数</td>
              <td>{{orderDetail.redCurrency}}豆</td>
              <td>备注</td>
              <td>{{orderDetail.remark || '-'}}</td>
              <td>充值优惠券信息</td>
              <td>{{orderDetail.couponDesc || ''}}</td>
            </tr>
          </table>
        </el-tab-pane>
        <el-tab-pane label="订单状态变更记录"
          name="1">
          <el-table :data="orderChangeList"
            stripe
            style="width: 100%"
            v-if="orderDetail"
            v-loading="statusLoading">
            <el-table-column type="index"
              label="序号"
              width="180">
            </el-table-column>
            <el-table-column prop="orderId"
              label="订单ID"
              width="180">
            </el-table-column>
            <el-table-column prop="orderStatus"
              label="状态">
              <template slot-scope="scope">
                <span>{{ scope.row.orderStatus | rechargeOrder2CH }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ip"
              label="IP地址">
            </el-table-column>
            <el-table-column prop="createTime"
              label="时间">
              <template slot-scope="scope">
                {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="支付详细信息"
          name="2">
          <p>交易状态变更记录</p>
          <el-table :data="tradeDetailList"
            stripe
            style="width: 100%"
            v-if="tradeDetailList"
            v-loading="tradeLoading">
            <el-table-column type="index"
              label="序号"
              width="180">
            </el-table-column>
            <el-table-column prop="tradeId"
              label="交易ID"
              width="180">
            </el-table-column>
            <el-table-column prop="channelName"
              label="通道名称">
            </el-table-column>
            <el-table-column prop="exOrderId"
              label="渠道流水号">
            </el-table-column>
            <el-table-column prop="ip"
              label="IP地址">
            </el-table-column>
            <el-table-column prop="createTime"
              label="支付创建时间">
              <template slot-scope="scope">
                {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column prop="createTime"
              label="支付成功时间">
              <template slot-scope="scope">
                {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column prop="payTerminal"
              label="支付平台">
              <template slot-scope="scope">
                {{[scope.row.payTerminal, source] | payTerminal2CH}}
              </template>
            </el-table-column>
            <el-table-column prop="tradeStatus"
              label="交易状态">
              <template slot-scope="scope">
                <span>{{ scope.row.tradeStatus | rechargeOrder2CH }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import { RechargeDetail } from '../../../../util/api'
export default {
  name: 'OrderRechargeDetail',
  data () {
    return {
      fromRouter: null,
      currentRouter: null,
      activeTab: '0',
      orderDetail: null,
      orderChangeList: null,
      tradeDetailList: null,
      orderLoading: true,
      statusLoading: true,
      tradeLoading: true
    }
  },
  props: ['orderType', 'id', 'source'],
  computed: {
    serviceDay () {
      let orderDetail = this.orderDetail
      return new Date().getTime() < orderDetail.serviceStartTime ? '0天' : new Date().getTime() > orderDetail.serviceEndTime && orderDetail.validDay ? orderDetail.validDay + '天' : Math.ceil((new Date().getTime() - orderDetail.serviceStartTime) / 24 / 60 / 60 / 1000) + '天'
    }
  },
  created () {
    console.log('recharge detail')
    this.getRechargeDetail('getRechargeOrderDetail').then(res => {
      this.orderDetail = res.data
      this.orderLoading = false
    }, err => {
      this.$message.error(err)
      this.orderLoading = false
    })
    this.getRechargeDetail('getRechargeOrderChangeList').then(res => {
      this.orderChangeList = res.data
      this.statusLoading = false
    }, err => {
      this.$message.error(err)
      this.orderChangeList = []
      this.statusLoading = false
    })
    this.getRechargeDetail('getChannelTradeDetailList').then(res => {
      this.tradeDetailList = res.data
      this.tradeLoading = false
    }, err => {
      this.$message.error(err)
      this.tradeDetailList = []
      this.tradeLoading = false
    })
  },
  methods: {
    getRechargeDetail (url) {
      return new Promise((resolve, reject) => {
        this.$service(RechargeDetail[this.source][url], {
          method: 'get',
          params: {
            orderId: this.id
          }
        }).then(res => {
          if (res.code === 200) {
            resolve(res)
          } else {
            reject(res.message)
          }
        }, err => {
          if (err) {
            reject(JSON.stringify(err))
          }
        })
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.fromRouter = from && from.name ? from : null
      vm.currentRouter = to
    })
  }
}
</script>
