<template>
  <div class="order-product-detail">
    <div class="payment-detail"
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
      <div v-loading="loading">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="订单详细信息"
            name="0">
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
                <td>订单冻结时间</td>
                <td>{{[orderDetail.frozenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>用户账号</td>
                <td>{{orderDetail.account}}</td>
                <td>商品名称</td>
                <td>{{orderDetail.goodsName}}</td>
                <td>订单结算时间</td>
                <td>{{[orderDetail.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>订单类型</td>
                <td>{{{
                    '1': '红豆购买',
                    '2': '现金购买',
                    '3': '点卡购买'
                  }[orderDetail.orderType]}}
                </td>
                <td>商品类型</td>
                <td>{{orderDetail.goodsType}}</td>
                <td>订单退豆时间</td>
                <td>{{[orderDetail.refundTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>订单价格</td>
                <td>{{orderDetail.orderPrice}}</td>
                <td>商品定价</td>
                <td>{{orderDetail.goodsPrice}}</td>
                <td>退豆价格</td>
                <td>{{orderDetail.refundPrice}}</td>
              </tr>
              <tr>
                <td>订单状态</td>
                <td>{{orderDetail.orderStatus | productOrderStatus2CH}}</td>
                <td>商品类型ID</td>
                <td>{{orderDetail.goodsTypeId}}</td>
                <td>优惠券类型</td>
                <td>{{orderDetail.couponType | couponType2CH}}</td>
              </tr>
              <tr>
                <td>成功交易ID</td>
                <td>{{orderDetail.threadTradeId}}</td>
                <td>购买数量</td>
                <td>{{orderDetail.buyCount}}</td>
                <td>优惠券码</td>
                <td>{{orderDetail.couponCode || '-'}}</td>
              </tr>
              <tr>
                <td>专家ID</td>
                <td>{{orderDetail.expertId || '-'}}</td>
                <td>服务开始日期</td>
                <td>{{[orderDetail.serviceStartTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
                <td>优惠力度</td>
                <td>{{orderDetail.couponTypeDesc}}</td>
              </tr>
              <tr>
                <td>专家网易宝</td>
                <td>{{orderDetail.expertEpay || '-'}}</td>
                <td>服务结束日期</td>
                <td>{{[orderDetail.serviceEndTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
                <td>优惠额</td>
                <td v-if="!(parseInt(type) === 1 && (orderDetail.goodsTypeId === 1 || orderDetail.goodsTypeId === 5))">{{orderDetail.preferentialAmount || '-'}}<span v-show="orderDetail.preferentialAmount">豆</span></td>
                <td v-if="(parseInt(type) === 1 && orderDetail.goodsTypeId === 5)">{{orderDetail.goodsPrice - orderDetail.orderPrice}}</td>
                <td v-if="parseInt(type) === 1 && orderDetail.goodsTypeId === 1">{{Math.round(orderDetail.goodsPrice-(orderDetail.price/orderDetail.point)*orderDetail.orderPrice) || '0'}}</td>
              </tr>
              <tr>
                <td>分成比例</td>
                <td>{{orderDetail.shareRate | toPercent }}</td>
                <td>总服务天数</td>
                <td>{{parseInt(type) === 0 ? (orderDetail.serviceTotalDays ? orderDetail.serviceTotalDays + '天' : '-') : (orderDetail.validDay ? orderDetail.validDay + '天' : '-')}}</td>
                <td>支付平台</td>
                <td>{{[orderDetail.payTerminal, 1] | payTerminal2CH}}</td>
              </tr>
              <tr>
                <td>IP地址</td>
                <td>{{orderDetail.ip }}</td>
                <td>已服务天数</td>
                <td v-if="parseInt(type) === 0 || orderDetail.goodsTypeId !== 5">{{orderDetail.serviceNowDays}}</td>
                <td v-if="parseInt(type) === 1 && orderDetail.goodsTypeId === 5">{{serviceDay}}</td>
                <td>通道费率</td>
                <td>{{orderDetail.channelRate | toPercent}}</td>
              </tr>
              <tr>
                <td>点卡名称</td>
                <td>{{orderDetail.name || '-'}}</td>
                <td>点数</td>
                <td>{{orderDetail.point || '-'}}</td>
                <td>已使用点数</td>
                <td>{{orderDetail.goodsTypeId === 5 && orderDetail.point ? orderDetail.point - orderDetail.usedPoints : '-'}}</td>
              </tr>
              <tr>
                <td>总场次数</td>
                <td>{{orderDetail.dataCount || '-'}}</td>
                <td>已使用场次数</td>
                <td>{{orderDetail.serveDataCount || '-'}}</td>
                <td>赠送积分</td>
                <td>{{orderDetail.creditPresent}}</td>
              </tr>
              <tr>
                <td>备注</td>
                <td>-</td>
                <td>设备型号</td>
                <td>{{orderDetail.devicesModel || '-'}}</td>
                <td>设备ID</td>
                <td>{{orderDetail.deviceId}}</td>
              </tr>
            </table>
          </el-tab-pane>
          <el-tab-pane label="状态变更记录"
            name="1">
            <el-table :data="orderChangeList"
              stripe
              style="width: 100%"
              v-if="orderDetail"
              v-loading="loading">
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
                  <span>{{scope.row.orderStatus | productOrderStatus2CH}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="threadTradeId"
                label="交易ID">
              </el-table-column>
              <el-table-column
                prop="reduceCount"
                :label="orderDetail.goodsTypeId && orderDetail.goodsTypeId === 11 ? '现金消耗': parseInt(type) === 0 ? '红豆消耗' : '点数消耗'">
              </el-table-column>
              <el-table-column prop="createTime"
                label="时间">
                <template slot-scope="scope">
                  {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { OrderProductDetail } from '../../../../util/api'
export default {
  name: 'OrderProductDetail',
  data () {
    return {
      activeTab: '0',
      orderDetail: null,
      orderChangeList: [],
      loading: false
    }
  },
  props: ['id', 'jzbf', 'type', 'appId'],
  computed: {
    serviceDay () {
      const orderDetail = this.orderDetail
      return new Date().getTime() < orderDetail.serviceStartTime ? '0天' : new Date().getTime() > orderDetail.serviceEndTime && orderDetail.validDay ? orderDetail.validDay + '天' : Math.ceil((new Date().getTime() - orderDetail.serviceStartTime) / 24 / 60 / 60 / 1000) + '天'
    }
  },
  created () {
    this.getInfo()
    this.getChangeList()
  },
  methods: {
    getInfo () {
      if (this.loading || !this.id) return
      this.loading = true
      let url = OrderProductDetail[0]
      if (this.jzbf.toString() === '1') {
        url = OrderProductDetail[1]
      }
      this.$service(this.type.toString() === '1' ? url.detailOfPointCard : url.detail, {
        params: {
          orderId: this.id,
          appId: this.appId
        }
      }).then(res => {
        if (res.code === 200) {
          this.orderDetail = res.data
          this.orderDetail['serviceNowDays'] = '-'
          if (this.orderDetail.serviceTotalDays) {
            const _now = new Date().valueOf()
            if (this.orderDetail.serviceStartTime > _now) {
              this.orderDetail['serviceNowDays'] = '0天'
            }
            if (this.orderDetail.serviceEndTime < _now) {
              this.orderDetail['serviceNowDays'] = this.orderDetail.serviceTotalDays + '天'
            }
            if (this.orderDetail.serviceStartTime < _now && _now < this.orderDetail.serviceEndTime) {
              this.orderDetail['serviceNowDays'] = Math.ceil((_now - this.orderDetail.serviceStartTime) / (24 * 60 * 60 * 1000)) + '天'
            }
          }
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.loading = false
      }).catch(err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getChangeList () {
      if (!this.id) return
      let url = OrderProductDetail[0]
      if (this.jzbf.toString() === '1') {
        url = OrderProductDetail[1]
      }
      this.$service(url.changeList, {
        params: {
          orderId: this.id,
          appId: this.appId
        }
      }).then(res => {
        if (res.code === 200) {
          this.orderChangeList = res.data
        }
      })
    }
  }
}
</script>
