<template>
  <div class="order-payment-detail"
    v-loading="loading">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="支付详细信息"
        name="0">
        <table class="detail-table"
          v-if="tradeDetail">
          <colgroup>
            <col width="10%">
            <col width="25%">
            <col width="10%">
            <col width="25%">
            <col width="10%">
            <col width="20%">
          </colgroup>
          <tr>
            <td>交易ID</td>
            <td>{{tradeDetail.tradeId}}</td>
            <td>通道ID</td>
            <td>{{tradeDetail.channelId}}</td>
            <td>支付创建时间</td>
            <td>{{[tradeDetail.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
          </tr>
          <tr>
            <td>用户账号</td>
            <td>{{tradeDetail.account}}</td>
            <td>通道标识</td>
            <td>{{tradeDetail.channelType}}</td>
            <td>支付成功时间</td>
            <td>{{[tradeDetail.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
          </tr>
          <tr>
            <td>订单ID</td>
            <td>{{tradeDetail.orderId}}</td>
            <td>通道名称</td>
            <td>{{tradeDetail.channelName}}</td>
            <td>退款时间</td>
            <td>{{[tradeDetail.refundTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
          </tr>
          <tr>
            <td>交易状态</td>
            <td>{{tradeDetail.tradeStatus | rechargeOrder2CH}}</td>
            <td>通道费率</td>
            <td>{{tradeDetail.channelRate | toPercent}}</td>
            <td>IP地址</td>
            <td>{{tradeDetail.ip}}</td>
          </tr>
          <tr>
            <td>渠道流水号</td>
            <td>{{tradeDetail.exOrderId}}</td>
            <td>通道支付账户</td>
            <td>{{tradeDetail.channelUser}}</td>
            <td>支付平台</td>
            <td>{{[tradeDetail.payTerminal, source] | payTerminal2CH}}</td>
          </tr>
          <tr>
            <td>金额</td>
            <td>{{parseFloat(tradeDetail.tradePrice)}}元</td>
            <td>备注</td>
            <td>{{tradeDetail.remark}}</td>
            <td>设备型号</td>
            <td>{{tradeDetail.devicesModel}}</td>
          </tr>
          <tr>
            <td>设备ID</td>
            <td>{{tradeDetail.devicesId}}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </el-tab-pane>
      <el-tab-pane label="交易状态变更记录"
        name="1">
        <el-table :data="tradeChangeList"
          stripe
          style="width: 100%">
          <el-table-column type="index"
            label="序号"
            width="180">
          </el-table-column>
          <el-table-column prop="orderId"
            label="订单ID"
            width="180">
          </el-table-column>
          <el-table-column prop="tradeId"
            label="交易ID">
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
            label="时间">
            <template slot-scope="scope">
              {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
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
</template>

<script>
import { PaymentDetail } from '../../../../util/api'
export default {
  name: 'OrderPaymentDetail',
  data () {
    return {
      activeTab: '0',
      tradeDetail: null,
      tradeChangeList: [],
      loading: false
    }
  },
  props: ['id', 'source'],
  created () {
    this.renderDetail()
  },
  methods: {
    getChannelTradeDetail (id, url) {
      return new Promise((resolve, reject) => {
        this.loading = true
        let data
        url === 'getChannelTradeDetail' ? data = { tradeId: id } : data = { orderId: id }
        this.$service(PaymentDetail[this.source][url], {
          method: 'get',
          params: data
        }).then(
          res => {
            this.loading = false
            if (res.code === 200) {
              //   this.detail = res.data
              resolve(res)
            } else {
              this.$message.error(res.code + ':' + res.message)
              reject(res.message)
            }
          },
          err => {
            if (err) {
              this.loading = false
              this.$message.error(JSON.stringify(err))
              reject(JSON.stringify(err))
            }
          }
        )
      })
    },
    renderDetail () {
      this.getChannelTradeDetail(this.id, 'getChannelTradeDetail').then(res => {
        this.tradeDetail = res.data
        return this.getChannelTradeDetail(this.tradeDetail.orderId, 'getChannelTradeChangeList')
      }).then(res => {
        this.tradeChangeList = res.data
      })
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
.detail-form {
  min-width: 780px;
}
.detail-form .el-form-item {
  width: 33%;
  margin-right: 0;
  margin-bottom: 0;
  label {
    width: 100px;
  }
}
</style>
