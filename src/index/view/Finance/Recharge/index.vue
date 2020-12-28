<template>
  <div class="finance-recharge">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" size="mini" :disabled="loading">
      <el-form-item>
        <el-date-picker v-model="month" type="month" :clearable="false" style="width:120px;" value-format="yyyy-MM"
          :picker-options="{disabledDate: (time) => {
            return time.getTime() > Date.now()
          }}" @change="getList()">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportList">导出</el-button>
      </el-form-item>
      <el-form-item v-if="list.length">
        总计：<span>{{sumGoodsCount}}豆</span>；<span>{{sumTradeAmount}}元</span>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="startDay" type="date" editable="false" width="100" placeholder="开始日期"
          value-format="yyyy-MM-dd" format="yyyy-MM-dd" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(endTime).getTime() !== 0 && time.getTime() > new Date(endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="endDay" type="date" editable="false" placeholder="结束日期" value-format="yyyy-MM-dd"
          format="yyyy-MM-dd" :clearable="false" style="width:130px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(startTime).getTime() !== 0 && time.getTime() < new Date(startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportDayList">导出</el-button>
      </el-form-item>
      <el-button type="primary" @click="testNumberShow = true" size="mini" style="position: absolute;
    right: 40px;">测试账号汇总</el-button>
    </el-form>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name='0' :disabled="loading"></el-tab-pane>
      <el-tab-pane label="精准比分" name='1' :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="orderId" label="订单ID" min-width="180">
      </el-table-column>
      <el-table-column prop="createTime" label="订单创建时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.orderTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="订单成功时间" min-width="160">
        <template slot-scope="scope">
          {{[scope.row.successTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="account" label="用户通行证" min-width="180">
      </el-table-column>
      <el-table-column prop="exOrderId" label="渠道流水号" min-width="160">
      </el-table-column>
      <el-table-column prop="goodsCount" label="购买数量" min-width="80">
      </el-table-column>
      <el-table-column prop="tradeAmount" label="购买金额(元)" width="120">
      </el-table-column>
      <el-table-column prop="appId" label="支付终端" width="100">
        <template slot-scope="scope">
          {{[scope.row.payTerminal, activeTab] | payTerminal2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="payChannel" label="支付通道" width="100">
        <template slot-scope="scope">
          {{[scope.row.payChannel, activeTab] | payChannel2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="channelRate" label="通道费率" width="100">
        <template slot-scope="scope">
          {{scope.row.channelRate | toPercent}}
        </template>
      </el-table-column>
      <!-- <el-table-column label="来源"
        width="80">
        <template slot-scope="scope">
          {{activeTab | appSource2CH}}
        </template>
      </el-table-column> -->
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" page-size="pageSize"
      :current-page.sync="pageIndex" :page-count="pageCount" class="page-bar-reset"></el-pagination>
    <el-dialog title="测试账号汇总" :visible.sync="testNumberShow" center :close-on-click-modal="false" width="550px">
      <el-form label-width="100px" ref="form" :disabled="updateLoading"  style="max-height:620px; overflow:auto;margin-bottom: 20px;">
        <el-form-item :label="`${i+1}、账号:`" v-for="(item,i ) in form" :key="i">
          <el-input v-model="item.data1" style="width:250px; margin-right:20px" :disabled="item.data1"></el-input>
          <label for="date">{{[item.createTime,'yyyy.MM.dd' ]| dateFormat}}</label>
        </el-form-item>
        <el-form-item label="账号:" v-for="(item, i ) in accountList" :key="i">
          <el-input v-model="item.account" style="width:250px; margin-right:20px"></el-input>
          <el-button @click.prevent="addTestAccount(item.account)" type="primary">保存</el-button>
        </el-form-item>
        <el-form-item v-if="addShow">
          <el-button size="mini" icon="el-icon-plus" @click="addButton()">
          </el-button>
        </el-form-item>
        <el-form-item v-if="!addShow">
          <el-button size="mini" icon="el-icon-minus" @click="minButton()">
          </el-button>
        </el-form-item>
      </el-form>
      <!-- <div slot="footer" class="dialog-footer">
        <el-button @click="testNumberShow = false">取 消</el-button>
        <el-button type="primary" @click="addTest()">确 定</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>
<script>
import { financeRecharge } from '../../../util/api'
import { formatDate } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'FinanceRecharge',
  data () {
    return {
      activeTab: '0',
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      month: new Date().getFullYear() + '-' + (new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1),
      startDay: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
      endDay: formatDate(new Date(), 'yyyy-MM-dd'),
      loading: false,
      tableHeight: null,
      sumGoodsCount: null,
      sumTradeAmount: null,
      list: [],
      testNumberShow: false,
      form: [],
      updateLoading: false,
      addShow: true,
      accountList: []
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getList()
    this.getTestList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    handleClickTabs () {
      this.getList()
      this.getTestList()
      this.setHeight()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(financeRecharge[this.activeTab].list, {
        method: 'get',
        urlParams: {
          month: this.month,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
        // params: {
        //   startDay: this.startDay,
        //   endDay: this.endDay
        // }
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.records || []
            this.pageCount = res.data.page.pageCount || 1
            this.sumGoodsCount = res.data.sumGoodsCount || 0
            this.sumTradeAmount = res.data.sumTradeAmount || 0
          } else {
            this.list = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.list = []
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    exportList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      let downloadUrl = location.origin + financeRecharge[this.activeTab].export.replace(/{{month}}/, this.month)
      window.open(downloadUrl)
    },
    exportDayList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      let downloadUrl = location.origin + financeRecharge[this.activeTab].exportDay.replace(/{{startDay}}/, this.startDay).replace(/{{endDay}}/, this.endDay)
      window.open(downloadUrl)
    },
    getTestList () {
      if (this.updateLoading) return
      this.updateLoading = true
      this.$service(financeRecharge.listTestAccount, {
      }).then(
        res => {
          this.updateLoading = false
          if (res.code === 200) {
            this.form = res.data.reverse() || []
          } else {
            this.form = []
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.form = []
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    addTestAccount (item) {
      this.$service(financeRecharge.addTestAccount, {
        method: 'post',
        data: {
          account: item
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.$message.success('添加成功！')
            this.accountList = [{ acconut: '' }]
            this.getTestList()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    addButton () {
      this.accountList.splice(this.accountList.length, 0, { acconut: '' })
      this.$refs.form.clearValidate()
      this.addShow = false
    },
    minButton () {
      this.accountList.splice(this.accountList.length - 1, 1)
      this.$refs.form.clearValidate()
      this.addShow = true
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
