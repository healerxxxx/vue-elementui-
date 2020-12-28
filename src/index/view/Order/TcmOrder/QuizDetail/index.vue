<template>
  <div class="order-quiz-detail">
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
            name="1"
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
                <td>{{orderDetail.subjectQuizId}}</td>
                <td>订单冻结时间</td>
                <td>{{[orderDetail.frozenTime, 'yyyy.MM.dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>用户账号</td>
                <td>{{orderDetail.account}}</td>
                <td>商品类型</td>
                <td>{{goodType2CH[orderDetail.goodsTypeId] || ''}}</td>
                <td>订单结算时间</td>
                <td>{{[orderDetail.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>订单金额（积分）</td>
                <td>{{orderDetail.orderCredit}}</td>
                <td>商品名称</td>
                <td>{{orderDetail.goodsName}}</td>
                <td>退款时间</td>
                <td>{{[orderDetail.refundTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
              </tr>
              <tr>
                <td>订单类型</td>
                <td>{{orderType2CH[orderDetail.orderType] || '-'}}</td>
                <td>投注项</td>
                <td>{{orderDetail.orderSelectionName}}</td>
                <td>退款金额</td>
                <td>{{orderDetail.refundCredit}}</td>
              </tr>
              <tr>
                <td>订单状态</td>
                <td>{{orderStatus2CH[orderDetail.orderStatus] || '-'}}</td>
                <td>最终赔率</td>
                <td>{{orderDetail.finalOdds}}</td>
                <td>IP</td>
                <td>{{orderDetail.ip || '-'}}</td>
              </tr>
              <tr>
                <td>订单创建时间</td>
                <td>{{[orderDetail.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
                <td>选项结果</td>
                <td>{{orderDetail.isWin? '赢': '输'}}</td>
                <td>设备ID</td>
                <td>{{orderDetail.deviceId}}</td>
              </tr>
              <tr>
                <td>返奖额(N币)</td>
                <td>{{orderDetail.netReturn || '-'}}</td>
                <td>购买数量</td>
                <td>{{orderDetail.buyCount}}</td>
                <td>终端</td>
                <td>{{orderDetail.payTerminal}}</td>
              </tr>
              <tr>
                <td>备注</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </table>
          </el-tab-pane>
          <el-tab-pane label="订单状态变更记录"
            name="2">
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
                  <span>{{orderStatus2CH[scope.row.orderStatus]}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="quizOrderStatusId"
                label="交易ID">
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
import { QuizOrderDetail } from '../../../../util/api'
export default {
  name: 'OrderQuizOrderDetail',
  data () {
    return {
      activeTab: '1',
      orderDetail: null,
      orderChangeList: null,
      orderLoading: true,
      statusLoading: true,
      orderStatusList: [],
      orderStatus2CH: {
        1: '冻结',
        2: '结算',
        3: '退款'
      },
      orderType2CH: {
        '1': '积分',
        '2': 'N币',
        '3': '积分+N币'
      },
      goodType2CH: {
        1: '主题竞猜',
        2: '单选项赛事',
        3: '双选项赛事'
      }
    }
  },
  props: ['id'],
  created () {
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
    getDetail (url) {
      return new Promise((resolve, reject) => {
        this.$service(QuizOrderDetail[url], {
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
