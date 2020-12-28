<template>
  <div class="consumer-price-wrap" v-show="visible">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="商品类别">
        <el-select v-model="filter.countType" style="width:105px">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in goodsType[appTab]" :key="item.id"></el-option>
          <el-option label="竞猜" value="1000" v-if="appTab==='0'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品类别" v-show="parseInt(filter.countType)==1">
        <el-select v-model="filter.category" style="width:105px">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.cName" :value="item.cId" v-for="item in lotteryList" :key="item.cId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端">
        <el-select v-model="filter.payTerminal" style="width:105px">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in payTerminal[appTab]" :key="item.id"></el-option>
          <el-option label="其他" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <!-- 正常统计 begin -->
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="price"
        label="价格"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="consumerNum"
        label="消费次数"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="userNum"
        label="消费用户数"
        min-width="90">
      </el-table-column>
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="consumerScale"
        label="消费次数占比"
        min-width="110">
        <template slot-scope="scope">
          {{scope.row.consumerScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="userScale"
        label="消费用户数占比"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.userScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="consumption"
        label="消费额(定价*消费次数)"
        min-width="170">
      </el-table-column>
      <el-table-column
        v-if="listType===0"
        :key="Math.random()"
        prop="averageConsumption"
        label="人均消费额(消费额/消费用户数)"
        min-width="220">
        <template slot-scope="scope">
          {{Math.round(scope.row.averageConsumption * 100) / 100}}
        </template>
      </el-table-column>
      <!-- 正常统计 end -->
      <!-- 方案统计 begin -->
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="price"
        label="价格"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="threadCount"
        label="文章数量"
        min-width="90">
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="threadEarningRate"
        label="文章盈利率"
        min-width="90">
        <template slot-scope="scope">
          {{scope.row.threadEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="cardConsumer"
        label="点卡消费"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="consumerNum"
        label="消费次数"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="userNum"
        label="消费用户数"
        min-width="90">
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        label="消费次数占比"
        min-width="110">
        <template slot-scope="scope">
          {{scope.row.consumerScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        label="消费用户数占比"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.userScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="consumption"
        label="消费额(定价*消费次数)"
        min-width="170">
      </el-table-column>
      <el-table-column
        v-if="listType===1"
        :key="Math.random()"
        prop="averageConsumption"
        label="人均消费额(消费额/消费用户数)"
        min-width="220">
        <template slot-scope="scope">
          {{Math.round(scope.row.averageConsumption * 100) / 100}}
        </template>
      </el-table-column>
      <!-- 方案统计 end -->
      <!-- 竞猜 begin -->
      <el-table-column
        v-if="listType===2"
        :key="Math.random()"
        prop="orderPrice"
        label="价格"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="listType===2"
        :key="Math.random()"
        prop="orderTimes"
        label="投注量(次数)"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="listType===2"
        :key="Math.random()"
        prop="userTimes"
        label="投注用户数"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="listType===2"
        :key="Math.random()"
        prop="orderTimesPer"
        label="投注量占比"
        min-width="110">
        <template slot-scope="scope">
          {{scope.row.orderTimesPer | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="listType===2"
        :key="Math.random()"
        prop="userTimesPer"
        label="投注用户占比"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.userTimesPer | toPercent}}
        </template>
      </el-table-column>
      <!-- 竞猜 end -->
    </el-table>
  </div>
</template>

<script>
import { objSort } from '../../../../util/tool'
import baseType from '../../../../util/base'
import { StatisticsConsumer, CommonApi } from '../../../../util/api'
export default {
  name: 'statisticsConsumerByPrice',
  props: {
    appTab: {
      type: 'String',
      default: '0'
    },
    visible: {
      type: 'Boolean',
      default: false
    },
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      lotteryList: [],
      filter: {
        countType: '',
        category: '',
        payTerminal: ''
      },
      goodsType: baseType.goodsType,
      payTerminal: baseType.payTerminal,
      list: [],
      loading: false,
      tableHeight: null,
      listType: 1
    }
  },
  mounted () {
    this.getLottery()
    if (this.visible) {
      this.getList()
      this.setHeight()
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          this.lotteryList = res.data.sort(objSort('cId'))
        }
      })
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      let _data = {}
      if (this.filter.countType) _data['countType'] = this.filter.countType
      if (parseInt(this.filter.countType) === 1 && this.filter.category) _data['category'] = this.filter.category
      if (this.filter.payTerminal) _data['payTerminal'] = this.filter.payTerminal
      let url = StatisticsConsumer[this.appTab].consumerByPrice.list
      if (this.filter.countType === '1000') {
        url = StatisticsConsumer[this.appTab].consumerByPrice.tcmList
      }
      this.listType = 0
      if (parseInt(this.filter.countType) === 1) {
        this.listType = 1
      }
      if (this.filter.countType === '1000') {
        this.listType = 2
        url = StatisticsConsumer[this.appTab].consumerByPrice.tcmList
      }
      this.$service(url, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.setHeight()
      }
    },
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>
