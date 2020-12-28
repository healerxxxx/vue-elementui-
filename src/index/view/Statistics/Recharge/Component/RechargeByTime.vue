<template>
  <div class="recharge-time-wrap">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker v-model="filter.startTime" type="date" editable="false" width="100" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filter.endTime" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="">
        <el-select v-model="filter.goodsTypeId" style="width:105px">
          <el-option label="全部" :value="0">全部</el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in goodsTypeId" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="getList()">查询</el-button>
      </el-form-item>
      <el-form-item label="" v-if="totalStat">
        总充值次数：<b>{{totalStat.totalRecharge}}</b>；
        充值总用户数：<b>{{totalStat.totalUser}}</b>；
        充值总额：<b>{{totalStat.totalAmount}}</b>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="date" label="日期" min-width="100">
      </el-table-column>
      <el-table-column prop="rechargeCount" label="充值次数" min-width="80">
      </el-table-column>
      <el-table-column prop="userCount" label="充值用户数" min-width="80">
      </el-table-column>
      <el-table-column prop="amount" label="充值总额" min-width="100">
      </el-table-column>
      <el-table-column label="充值次数占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.rechargeScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column label="充值用户占比" min-width="120">
        <template slot-scope="scope">
          {{scope.row.userScale | toPercent}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList"
      :current-page.sync="currentPage" :total="total" :page-size="limit" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { formatDate } from '../../../../util/tool'
import { StatisticsRecharge } from '../../../../util/api'
const goodsTypeId = [{ id: 1, name: '红豆' }, { id: 3, name: '五星指数' }, { id: 5, name: '点卡' }, { id: 6, name: '红彩指数' }, { id: 13, name: '大会员' }, { id: 15, name: '旋转矩阵' }]
export default {
  name: 'statisticsRechargeByTime',
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
      filter: {
        startTime: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd hh:mm:ss'),
        endTime: formatDate(new Date(), 'yyyy-MM-dd') + ' 23:59:59',
        goodsTypeId: 0
      },
      start: 0,
      limit: 25,
      total: 1,
      list: [],
      totalStat: null,
      loading: false,
      goodsTypeId: goodsTypeId,
      tableHeight: null
    }
  },
  computed: {
    currentPage () {
      return Math.floor(this.start / this.limit) + 1
    }
  },
  created () {
    if (this.visible) {
      this.getList()
      this.setHeight()
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (page) {
      if (this.loading) return
      this.totalStat = null
      this.loading = true
      if (typeof page === 'number') {
        this.start = page ? (page - 1) * this.limit : 0
      } else {
        this.start = 0
      }
      let _data = {
        start: this.start,
        limit: this.limit
      }
      if (this.filter.startTime) _data['startTime'] = this.filter.startTime
      if (this.filter.endTime) _data['endTime'] = this.filter.endTime
      if (this.filter.goodsTypeId) _data['goodsTypeId'] = this.filter.goodsTypeId
      this.$service(StatisticsRecharge[this.appTab].listByTime, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.totalStat = null
          this.list = res.data.data || []
          this.total = res.data.total || 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          if (this.list.length > 0) {
            this.totalStat = {
              totalRecharge: this.list[0].totalRecharge,
              totalUser: this.list[0].totalUser,
              totalAmount: this.list[0].totalAmount
            }
          }
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
