<template>
  <div class="order-tcm-detail">
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
      <div>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="订单详细信息"
            name="0"
            v-loading="orderLoading">
            <table class="detail-table"
              v-if="orderDetail">
              <colgroup>
                <col width="15%">
                <col width="20%">
                <col width="10%">
                <col width="25%">
                <col width="10%">
                <col width="20%">
              </colgroup>
              <tr>
                <td>订单ID</td>
                <td>{{orderDetail.orderId}}</td>
                <td>比赛ID</td>
                <td>{{orderDetail.tcmEventId}}</td>
                <td>订单冻结时间</td>
                <td>{{[orderDetail.frozenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>用户账号</td>
                <td>{{orderDetail.account}}</td>
                <td>商品名称(赛事对阵)</td>
                <td>{{orderDetail.goodsName}}</td>
                <td>订单结算时间</td>
                <td>{{[orderDetail.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>订单金额（积分+N币）</td>
                <td>{{orderDetail.orderPrice}}</td>
                <td>商品类型</td>
                <td>{{orderDetail.goodsType}}</td>
                <td>退款时间</td>
                <td>{{[orderDetail.refundTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>订单类型</td>
                <td>{{orderDetail.orderType | orderType2CH}}</td>
                <td>商品类型（ID）</td>
                <td>{{orderDetail.goodsTypeId}}</td>
                <td>退款金额</td>
                <td>{{orderDetail.refundPrice}}</td>
              </tr>
              <tr>
                <td>订单状态</td>
                <td>{{tcmOrderStatus2CH(orderDetail.orderStatus)}}</td>
                <td>玩法</td>
                <td>{{orderDetail.ruleTypeName}}</td>
                <td>退款积分</td>
                <td>{{orderDetail.refundCredit}}</td>
              </tr>
              <tr>
                <td>成功交易ID（数据商订单ID）</td>
                <td>{{orderDetail.orderTradeId || '-'}}</td>
                <td>marketID</td>
                <td>{{orderDetail.goodsId}}</td>
                <td>退款牛币</td>
                <td>{{orderDetail.refundNCoin || '-'}}</td>
              </tr>
              <tr>
                <td>订单创建时间</td>
                <td>{{[orderDetail.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
                <td>下单时比分</td>
                <td>{{orderDetail.matchScore}}</td>
                <td>IP地址</td>
                <td>{{orderDetail.ip || '-'}}</td>
              </tr>
              <tr>
                <td>订单消耗积分</td>
                <td>{{orderDetail.orderCredit || '-'}}</td>
                <td>投注项</td>
                <td>{{orderDetail.selectionName}}</td>
                <td>设备ID</td>
                <td>{{orderDetail.deviceId}}</td>
              </tr>
              <tr>
                <td>订单消耗牛币</td>
                <td>{{orderDetail.orderNCoin || '-'}}</td>
                <td>投注时赔率</td>
                <td>{{orderDetail.odds}}</td>
                <td>终端</td>
                <td>{{orderDetail.payTerminal}}</td>
              </tr>
              <tr>
                <td>盈亏金额</td>
                <td>{{orderDetail.netPrice || '-'}}</td>
                <td>结算时结果（比分）</td>
                <td>{{orderDetail.resultMatchScore || '-'}}</td>
                <td>备注</td>
                <td>{{orderDetail.mark || '-'}}</td>
              </tr>
              <tr>
                <td>盈亏积分</td>
                <td>{{orderDetail.netCredit}}</td>
                <td>购买数量</td>
                <td>{{orderDetail.buyCount}}</td>
                <td>返奖额</td>
                <td>{{orderDetail.netReturn}}</td>
              </tr>
              <tr>
                <td>盈亏牛币</td>
                <td>{{orderDetail.expertId || '-'}}</td>
                <td>加奖额</td>
                <td>{{orderDetail.bonus || '-'}}</td>
                <td></td>
                <td></td>
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
                label="序号">
              </el-table-column>
              <el-table-column prop="orderId"
                label="订单ID">
              </el-table-column>
              <el-table-column prop="orderStatus"
                label="订单状态">
                <template slot-scope="scope">
                  <span>{{ tcmOrderStatus2CH(scope.row.orderStatus) }}</span>
                </template>
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
import { GuessOrder, TcmOrderDetail } from '../../../../util/api'
export default {
  name: 'OrderTcmOrderDetail',
  data () {
    return {
      activeTab: '0',
      orderDetail: null,
      orderChangeList: null,
      orderLoading: true,
      statusLoading: true,
      orderStatusList: []
    }
  },
  props: ['id'],
  created () {
    this.getTcmOrderStatusList()
    this.getDetail('orderDetail').then(res => {
      this.orderDetail = res.data
      this.orderLoading = false
    }, err => {
      this.$message.error(err)
      this.orderLoading = false
    })
    this.getDetail('orderStatusList').then(res => {
      this.orderChangeList = res.data
      this.statusLoading = false
    }, err => {
      this.orderChangeList = []
      this.$message.error(err)
      this.statusLoading = false
    })
  },
  methods: {
    tcmOrderStatus2CH (status) {
      let name
      this.orderStatusList.filter(item => {
        if (item.id === status) name = item.desc
      })
      return name || '-'
    },
    getTcmOrderStatusList () {
      this.$service(GuessOrder[0].orderStatusList).then(
        res => {
          if (res.code === 200) {
            this.orderStatusList = res.data || []
          } else {
            this.$message.error(res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getDetail (url) {
      return new Promise((resolve, reject) => {
        this.$service(TcmOrderDetail[url], {
          method: 'get',
          params: {
            orderId: this.id
          }
        }).then(
          res => {
            if (res.code === 200) {
              resolve(res)
            } else {
              reject(res.message)
            }
          },
          err => {
            if (err) {
              reject(JSON.stringify(err))
            }
          })
      })
    }
  }
}
</script>
