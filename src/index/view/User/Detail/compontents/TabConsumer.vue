<template>
  <div class="tab-consumer" v-show="visible">
    <el-form
      :inline="true"
      :model="filter"
      size="mini"
      :disabled="loading">
      <el-form-item>
        <el-select clearable
          v-model="filter.selectType"
          style="width:105px"
          @change="selectTypeChange">
          <el-option value="1"
            label="专家ID"></el-option>
          <el-option value="2"
            label="商品类型"></el-option>
          <el-option value="3"
            label="订单ID"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="parseInt(filter.selectType)===3">
        <el-input clearable
          v-model="filter.orderId"
          placeholder="请输入订单ID"></el-input>
      </el-form-item>
      <el-form-item v-show="parseInt(filter.selectType)===1">
        <el-input clearable
          v-model="filter.expertId"
          placeholder="请输入专家ID"></el-input>
      </el-form-item>
      <el-form-item v-show="parseInt(filter.selectType)===2">
        <el-select clearable
          v-model="filter.goodsTypeId"
          style="width:130px"
          placeholder="请选择商品类型"
          :disabled="priceLoading"
          @change="getPrice">
          <el-option
            v-for="item in goodsType"
            :value="item.id"
            :label="item.name"
            :key="item.id">
          </el-option>
          <el-option
            label="竞猜"
            value="100"
            key="100">
          </el-option>
          <el-option label="拉新竞猜"
            value="101"
            key="101"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="彩种" v-show="parseInt(filter.selectType)===2&&filter.goodsTypeId===1">
        <el-select
          v-model="filter.category"
          style="width:130px">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.cName" :value="item.cId" v-for="item in lotteryList" :key="item.cId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="价位" v-show="parseInt(filter.selectType)===2&&filter.goodsTypeId!==100&&filter.goodsTypeId!==101">
        <el-select
          clearable
          v-model="filter.price"
          style="width:105px"
          :loading="priceLoading">
          <el-option
            v-for="(price, index) in price"
            :label="price"
            :value="price"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          clearable
          v-model="filter.orderStatus"
          style="width:130px"
          v-show="!(filter.selectType==='2'&&(filter.goodsTypeId==='100'||filter.goodsTypeId==='101'))">
          <el-option
            v-for="item in productOrderStatus"
            :label="item.name"
            :value="item.id"
            :key="item.id">
          </el-option>
        </el-select>
        <el-select
          clearable
          v-model="filter.quizOrderStatus"
          style="width:130px"
          v-show="filter.selectType==='2'&&filter.goodsTypeId==='101'">
          <el-option label="冻结" value="1" key="1"></el-option>
          <el-option label="结算" value="2" key="2"></el-option>
          <el-option label="退款" value="3" key="3"></el-option>
        </el-select>
        <el-select
          clearable
          v-model="filter.tcmOrderStatus"
          style="width:105px"
          v-show="filter.selectType==='2'&&filter.goodsTypeId==='100'">
          <el-option
            :label="item.name"
            v-for="item in tcmOrderStatus"
            :value="item.id"
            :key="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端">
        <el-select clearable
          v-model="filter.payTerminal"
          style="width:105px">
          <el-option :label="item.name"
            v-for="item in payTerminal"
            :value="item.id"
            :key="item.id">
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
      <el-form-item v-if="priceSum.length">
        筛选后订单总额:<span v-for="(item, index) in priceSum" :key="index">{{item.orderPrice}} {{item.orderType===1?'红豆':'元'}}</span>
      </el-form-item>
    </el-form>
    <el-table
      :data="list"
      stripe
      v-loading="loading">
      <el-table-column prop="orderId"
        label="订单ID"
        width="180">
        <template slot-scope="scope">
          <router-link v-if="list.length && list[0].quizOrderId" :to="{name: 'OrderQuizOrderDetail', params: {id: scope.row.orderId}}">{{scope.row.orderId}}</router-link>
          <router-link v-if="list.length && list[0].tcmSelectionId" :to="{name: 'OrderTcmOrderDetail', params: {id: scope.row.orderId}}">{{scope.row.orderId}}</router-link>
          <router-link
            v-if="list.length && !list[0].tcmSelectionId && !list[0].quizOrderId"
            :to="{name: 'OrderProductDetail', params: {
              jzbf: 0,
              id: scope.row.orderId,
              appId: 0,
              type: ((scope.row.goodsTypeId === 1 && scope.row.orderType === 3) || scope.row.goodsTypeId === 5) ? 1 : 0
            }}">
            {{scope.row.orderId}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="orderStatus"
        label="订单状态"
        width="80">
        <template slot-scope="scope">
          <span v-if="list.length && list[0].tcmSelectionId">{{scope.row.orderStatus | tcmOrder2CH}}</span>
          <span v-if="list.length && list[0].quizOrderId">{{scope.row.orderStatus | quizOrderStatus2CH}}</span>
          <span v-if="list.length && !list[0].tcmSelectionId && !list[0].quizOrderId">{{scope.row.orderStatus | productOrderStatus2CH}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="订单冻结时间"
        width="110"
        show-overflow-tooltip>
        <template slot-scope="scope">
          {{[scope.row.frozenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="successTime"
        label="订单成功时间"
        width="110"
        show-overflow-tooltip>
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        width="80"
        :label="list.length && list[0].tcmSelectionId?'赛事ID':'商品ID'">
        <template slot-scope="scope">
          {{list.length && list[0].tcmSelectionId?scope.row.tcmEventId:scope.row.goodsId}}
        </template>
      </el-table-column>
      <el-table-column
        prop="lotteryCategoryId"
        label="彩种"
        width="60">
        <template slot-scope="scope">
          {{lotteryObj[scope.row.lotteryCategoryId] || ''}}
        </template>
      </el-table-column>
      <el-table-column
        label="商品类型">
        <template slot-scope="scope">
          {{list.length && list[0].quizOrderId?quizType2CH(item.goodsTypeId):list[0].tcmSelectionId?'竞猜':scope.row.goodsType}}
        </template>
      </el-table-column>
      <el-table-column prop="goodsName" label="商品名称" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="expertId" label="专家ID">
      </el-table-column>
      <el-table-column prop="orderPrice" label="订单价格">
      </el-table-column>
      <el-table-column prop="payTerminal" label="支付终端">
        <template slot-scope="scope">
          <span>{{ [scope.row.payTerminal, 0] | payTerminal2CH }}</span>
        </template>
      </el-table-column>
      <el-table-column
        width="120"
        label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.goodsTypeId === 13 && scope.row.orderStatus === 3"
            type="primary"
            size="mini"
            :loading="scope.row.loading"
            @click="refundVip(scope.row)">大会员退款</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
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
import { UserDetail, CommonApi, PriceProductArticle, PriceProductSp } from '../../../../util/api'
import { deleteObjEmpty, objSort } from '../../../../util/tool'
export default {
  name: 'tabConsumer',
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
      goodsType: baseType.goodsType[0],
      tcmOrderStatus: baseType.tcmOrderStatus,
      productOrderStatus: baseType.productOrderStatus,
      payTerminal: baseType.payTerminal[0],
      lotteryList: [],
      lotteryObj: {},
      list: [],
      pageIndex: 1,
      pageCount: 1,
      pageSize: 20,
      loading: false,
      filter: {
        expertId: null,
        payTerminal: null,
        orderStatus: null,
        orderId: null,
        price: null,
        goodsTypeId: null,
        category: '',
        date: []
      },
      filterQuery: {},
      price: {},
      priceSum: []
    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
      this.getLottery()
    }
  },
  filters: {
    quizOrderStatus2CH (code) {
      let dict = {
        '1': '冻结',
        '2': '结算',
        '3': '退单'
      }
      return dict[code] || '-'
    }
  },
  methods: {
    quizType2CH (val) {
      var dict = {
        1: '主题竞猜',
        2: '单选项赛事',
        3: '双选项赛事'
      }
      return dict[val] || '-'
    },
    getLottery () {
      if (this.lotteryList.length > 0) return
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          this.lotteryList = res.data.sort(objSort('cId'))
          res.data.forEach(item => {
            this.lotteryObj[item.cId] = item.lotteryName
          })
        }
      })
    },
    // 获取消费订单
    getList (page) {
      this.loading = true
      this.pageIndex = page || 1
      let data = Object.assign({
        userId: this.userId,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }, this.filterQuery)
      this.$service(UserDetail[0]['consumerThreadOrderList'], {
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
      delete filter.selectType
      this.filterQuery = filter
      this.getList()
      this.getSum()
    },
    getSum () {
      this.$service(UserDetail[0].getConsumerThreadOrderPriceSum, {
        method: 'post',
        data: Object.assign({}, this.filterQuery, {
          userId: this.userId,
          pageIndex: 1,
          pageSize: this.pageSize
        })
      }).then(res => {
        if (res.code === 200 && res.data) {
          this.priceSum = res.data || []
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    selectTypeChange (val) {
      if (parseInt(val) !== 2) {
        this.filter.goodsTypeId = null
        this.filter.price = null
      }
      this.filter.orderId = null
      this.filter.expertId = null
    },
    getPrice () {
      let type = this.filter.goodsTypeId
      this.price = []
      if (!type || parseInt(type) === 100 || parseInt(type) === 101) {
        return
      }
      if (type === 1) {
        if (this.priceLoading) return
        this.priceLoading = true
        this.$service(PriceProductArticle[0].list).then(res => {
          this.priceLoading = false
          if (res.code === 200 && res.data) {
            res.data.forEach(item => {
              this.price.push(item.threadPrice)
            })
          } else {
            this.$message.error('获取价格失败')
          }
        }, err => {
          if (err) {
            this.priceLoading = false
            this.$message.error('获取价格失败')
          }
        })
      } else if (type === 5) {
      } else {
        if (this.priceLoading) return
        this.priceLoading = true
        this.$service(PriceProductSp.list, {
          method: 'get',
          params: {
            pageIndex: 1,
            pageSize: 100,
            typeId: type
          }
        }).then(res => {
          this.priceLoading = false
          if (res.code === 200 && res.data) {
            res.data.records.forEach(item => {
              this.price.push(item.price)
            })
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
    refundVip (data) {
      if (data.loading) return
      this.$confirm('确定为用户退款VIP服务?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$set(data, 'loading', true)
        this.$service(CommonApi.refundVipService, {
          params: {
            orderId: data.orderId
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('用户大会员退款成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }).finally(() => {
          data.loading = false
        })
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.getLottery()
      }
    },
    userId (val) {
      this.filter = {
        expertId: null,
        payTerminal: null,
        orderStatus: null,
        orderId: null,
        price: null,
        goodsTypeId: null,
        category: '',
        date: []
      }
      this.filterQuery = {}
      this.price = {}
      this.priceSum = []
      this.list = []
      if (this.visible) {
        this.getList()
      }
    }
  }
}
</script>
