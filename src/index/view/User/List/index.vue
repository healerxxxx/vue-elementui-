<template>
  <div class="user-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input placeholder="账号/昵称/手机号/用户ID/设备号"
          prefix-icon="el-icon-search"
          clearable
          v-model="searchQuery.userName"
          size="mini"
          style="width:246px;"
          @clear="search">
        </el-input>
        <el-button type="primary"
          size="mini"
          @click="search">搜索</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <!-- 红彩 start -->
    <el-form v-if="!parseInt(activeTab)"
      :inline="true"
      :model="filterQuery"
      size="mini"
      :disabled="loading">
      <el-form-item label="预警状态">
        <el-select
          v-model="filterQuery.type"
          @change="getList()"
          style="width:105px">
          <el-option label="全部" value="0"></el-option>
          <el-option label="预警中" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="当季会员等级">
        <el-select
          v-model="filterQuery.vipType"
          @change="getList()"
          style="width:105px">
          <el-option label="全部" value="-1"></el-option>
          <el-option :label="item.name" :value="item.id + ''" v-for="item in vipLevel" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="exportUser">预警用户导出</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="vipVisible=true">会员用户导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable"
      :data="list"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight"
      v-show="activeTab==='0'"
      @sort-change="sortList">
      <el-table-column
        prop="userId"
        fixed
        label="用户ID"
        width="80">
      </el-table-column>
      <el-table-column
        fixed
        prop="account"
        label="用户账号"
        :min-width="200">
        <template slot-scope="scope">
          <router-link :to="{name: 'UserDetail', params: {id: scope.row.userId, source: 0}}">{{scope.row.account}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="earlyWarning"
        label="状态"
        width="90">
        <template slot-scope="scope">
          {{scope.row.earlyWarning?'预警中':'正常'}}
          <el-popover v-if="scope.row.earlyWarning"
            placement="top-start"
            title=""
            trigger="hover">
            <el-table :data="warningLog">
              <el-table-column width="60"
                property="warningId"
                label="ID"></el-table-column>
              <el-table-column width="100"
                property="status"
                label="状态">
                <template slot-scope="scope">
                  {{scope.row.status?'预警中':'取消预警'}}
                </template>
              </el-table-column>
              <el-table-column property="content"
                label="内容"
                width="220">
                <template slot-scope="scope">
                  {{scope.row.content || '-'}}
                </template>
              </el-table-column>
              <el-table-column property="warningDay"
                label="预警天数"
                width="100">
                <template slot-scope="scope">
                  {{scope.row.warningDay?scope.row.warningDay+'天':'-'}}
                </template>
              </el-table-column>
              <el-table-column property="warningTime"
                label="预警时间"
                width="100">
                <template slot-scope="scope">
                  {{scope.row.warningTime || '-'}}
                </template>
              </el-table-column>
            </el-table>
            <i
              slot="reference"
              class="el-icon-warning"
              style="color:#FFD306;"
              @mouseenter="warningPop(scope.row.userId)">
            </i>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="nickname"
        label="昵称"
        :min-width="150">
      </el-table-column>
      <!-- <el-table-column prop="phone"
        label="手机号"
        width="110">
        <template slot-scope="scope">
          {{scope.row.phone || '-'}}
        </template>
      </el-table-column> -->
      <el-table-column prop="deviceIdList"
        label="查看设备号"
        width="100">
        <template slot-scope="scope">
          <el-popover
            placement="right"
            width="370"
            trigger="click"
            v-if="scope.row.deviceIdList && scope.row.deviceIdList.length">
            <div class="device-content">
              <p v-for="(item, index) in scope.row.deviceIdList" :key="index">{{item}}</p>
            </div>
            <el-button size="small" type="text" slot="reference">查看设备号</el-button>
          </el-popover>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column prop="couponStatus"
        label="是否领取新人礼包"
        width="140">
        <template slot-scope="scope">
          {{scope.row.couponStatus ? '是' : '否'}}
        </template>
      </el-table-column>
      <el-table-column prop="firstDate"
        label="首次消费时间"
        width="120">
        <template slot-scope="scope">
          {{scope.row.firstDate || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="firstTime"
        label="首次消费时长"
        width="120">
        <template slot-scope="scope">
          {{scope.row.firstTime || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="lastTime"
        label="最后消费时间"
        width="120">
        <template slot-scope="scope">
          {{scope.row.lastTime || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="orderByRechargeCount"
        :sortable="filterQuery.type==='0'&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="充值总额(元)"
        width="130">
        <template slot-scope="scope">
          {{scope.row.rechargeCount || '-'}}
        </template>
      </el-table-column>
      <el-table-column prop="orderByCostCount"
        :sortable="filterQuery.type==='0'&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="消费总额(豆)"
        width="130">
        <template slot-scope="scope">
          {{scope.row.costCount||'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="orderByRedCurrency"
        :sortable="filterQuery.type==='0'&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="账户余额(豆)"
        width="130">
        <template slot-scope="scope">
          {{scope.row.redCurrency||'-'}}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="refundRedCurrency"
        label="不中退返总额（含首单不中退）"
        width="140">
        <template slot-scope="scope">
          {{scope.row.refundRedCurrency ||'-'}}
        </template>
      </el-table-column> -->
      <el-table-column prop="orderByRechargeNum"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="充值次数"
        width="100">
        <template slot-scope="scope">
          {{scope.row.rechargeNum||'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="orderByCostNum"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="消费次数"
        width="100">
        <template slot-scope="scope">
          {{scope.row.costNum||'-'}}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="credit"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="剩余积分"
        width="100">
        <template slot-scope="scope">
          {{scope.row.credit||'-'}}
        </template>
      </el-table-column> -->
      <el-table-column prop="nCoin"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="剩余N币"
        width="100">
        <template slot-scope="scope">
          {{scope.row.nCoin||'-'}}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="totalOrderCredit"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="总投注积分"
        width="120">
        <template slot-scope="scope">
          {{scope.row.totalOrderCredit||'-'}}
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="totalOrderNCoin"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="总投注N币"
        width="120">
        <template slot-scope="scope">
          {{scope.row.totalOrderNCoin||'-'}}
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="tcmOrderPrice"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="总投注金额"
        width="120">
        <template slot-scope="scope">
          {{scope.row.tcmOrderPrice||'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="tcmNetPrice"
        :sortable="filterQuery.type==='0'&&!filterQuery.vipType&&!searchQuery.userName?'custom':false"
        :sort-orders="sortRrders"
        label="总盈亏额"
        width="100">
        <template slot-scope="scope">
          {{scope.row.tcmNetPrice||'-'}}
        </template>
      </el-table-column> -->
      <el-table-column
        prop="level"
        label="当季会员等级"
        width="110">
        <template slot-scope="scope">
          {{scope.row.level | vipLevel2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="levelPre"
        label="上季会员等级"
        width="110">
        <template slot-scope="scope">
          {{scope.row.levelPre | vipLevel2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="vipStatus"
        label="是否VIP"
        width="80">
      </el-table-column>
      <el-table-column prop="dayAvgNum"
        label="日均消费次数"
        width="110">
        <template slot-scope="scope">
          {{scope.row.dayAvgNum||'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="weekAvgNum"
        label="周均消费次数"
        width="110">
        <template slot-scope="scope">
          {{scope.row.weekAvgNum||'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="dayAvgCount"
        label="日均消费总额"
        width="110">
        <template slot-scope="scope">
          {{scope.row.dayAvgCount||'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="weekAvgCount"
        label="周均消费总额"
        width="110">
        <template slot-scope="scope">
          {{scope.row.weekAvgCount||'-'}}
        </template>
      </el-table-column>
      <el-table-column label="备注"
        width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="currentOperate(scope.row)">增加</el-button>
          <el-button size="mini" type="text" @click="lookRemark(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="余额"
        width="150">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            v-if="parseInt(scope.row.status)===2"
            @click="confirm(scope.row, 'freeze')">解冻</el-button>
          <el-button
            type="danger"
            size="mini"
            v-if="parseInt(scope.row.status)!==2"
            @click="confirm(scope.row, 'freeze')">冻结</el-button>
          <el-button
            type="primary"
            @click="confirm(scope.row, 'clear')"
            size="mini">清除</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作"
        width="110">
        <template slot-scope="scope">
          <el-button v-if="scope.row.phone" type="primary" size="mini" @click="unbindPhone(scope.row)">解绑手机</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="activeTab==='0'"
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(pageStart/pageLimit) + 1"
      :total="pageTotal"
      :page-size="pageLimit"
      class="page-bar-reset">
    </el-pagination>
    <!-- 红彩 end -->
    <!-- 精准比分 start -->
    <el-table ref="elTableJzbf"
      :data="jzbfList"
      stripe
      v-loading="loading"
      :max-height="tableHeight<400?400:tableHeight"
      v-show="activeTab==='1'">
      <el-table-column prop="userId"
        fixed
        label="用户ID"
        width="80">
      </el-table-column>
      <el-table-column prop="account"
        fixed
        label="用户账号"
        :min-width="180">
      </el-table-column>
      <el-table-column prop="status"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status==2?'冻结':scope.row.status==1?'删除':'正常'}}
        </template>
      </el-table-column>
      <el-table-column prop="nickname"
        label="昵称"
        :min-width="150">
      </el-table-column>
      <!-- <el-table-column prop="phone"
        label="手机号"
        width="120">
        <template slot-scope="scope">
          {{scope.row.phone || '-'}}
        </template>
      </el-table-column> -->
      <el-table-column prop="deviceIdList"
        label="查看设备号"
        width="130">
        <template slot-scope="scope">
          <el-popover
            placement="right"
            width="370"
            trigger="click"
            v-if="scope.row.deviceIdList && scope.row.deviceIdList.length">
            <div class="device-content">
              <p v-for="(item, index) in scope.row.deviceIdList" :key="index">{{item}}</p>
            </div>
            <el-button size="small" type="text" slot="reference">查看设备号</el-button>
          </el-popover>
          <p v-else>-</p>
        </template>
      </el-table-column>
      <el-table-column prop="couponStatus"
        label="是否领取新人礼包"
        width="140">
        <template slot-scope="scope">
          {{scope.row.couponStatus ? '是' : '否'}}
        </template>
      </el-table-column>
      <el-table-column prop="follow"
        label="关注专家"
        width="90">
        <template slot-scope="scope">
          {{scope.row.follow || '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="birthday"
        label="生日"
        width="80">
        <template slot-scope="scope">
          {{[scope.row.birthday, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="gender"
        label="性别"
        width="60">
        <template slot-scope="scope">
          {{{0: '男', 1: '女', 2: '未知'}[scope.row.gender]}}
        </template>
      </el-table-column>
      <el-table-column prop="redCurrency"
        label="金币"
        width="70">
        <template slot-scope="scope">
          {{scope.row.redCurrency || '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="vipStatus"
        label="是否VIP"
        width="80">
      </el-table-column>
      <el-table-column prop="device"
        label="设备"
        width="110">
        <template slot-scope="scope">
          {{[scope.row.device, 1] | payTerminal2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="ip"
        label="IP"
        width="130">
      </el-table-column>
      <el-table-column prop="lastTime"
        label="最后登录时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.lastLoginTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="lastTime"
        label="创建时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="activeTab==='1'"
      background
      layout="prev, pager, next"
      @current-change="getJzbfList"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <!-- 精准比分 end -->
    <!-- 增加备注 -->
    <el-dialog
      title="维护处理"
      :close-on-click-modal="false"
      :visible.sync="dialogRemarkVisible"
      width="500px"
      @close="markForm.remark=''">
      <el-form status-icon
        size="small"
        :model="markForm"
        :disabled="markLoading"
        ref="markForm"
        label-width="50px">
        <el-form-item label="备注"
          prop="remark"
          :rules="[{ required: true, message: '请输入备注', trigger: 'blur' }]">
          <el-input type="textarea"
            v-model="markForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
        class="dialog-footer">
        <el-button @click="dialogRemarkVisible = false"
          size="small">取 消</el-button>
        <el-button type="primary"
          @click="submitMarkForm('markForm')"
          :loading="markLoading"
          size="small">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 备注详情 start -->
    <el-dialog :title="remarkLogTitle"
      width="600px"
      :visible.sync="remarkLogVisible">
      <el-table :data="remarkLog">
        <el-table-column property="adminName"
          label="姓名"
          width="100"></el-table-column>
        <el-table-column property="content"
          label="内容"
          width="300"></el-table-column>
        <el-table-column property="createTime"
          width="150"
          label="时间"></el-table-column>
      </el-table>
    </el-dialog>
    <!-- 备注详情 end -->
    <!-- 按季度导出会员 begin -->
    <el-dialog
      title="会员用户导出"
      center
      width="360px"
      :visible.sync="vipVisible"
      :close-on-click-modal="false">
      <el-form :model="vipForm" label-width="100px" size="small">
        <el-form-item label="选择导出季度" prop="status">
          <date-year-quarter v-model="vipForm.date"></date-year-quarter>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="vipVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="exportLoading" @click="exportVip()">提交</el-button>
      </div>
    </el-dialog>
    <!-- 按季度导出会员 end -->
  </div>
</template>
<script>
import { UserList } from '../../../util/api'
import { isNumber } from '../../../util/tool'
import baseType from '../../../util/base'
import { mapState } from 'vuex'
import DateYearQuarter from '../../../component/DateYearQuarter'
export default {
  data () {
    return {
      vipLevel: baseType.vipLevel,
      sortRrders: ['descending', 'ascending', null],
      activeTab: '0',
      list: [],
      jzbfList: [],
      loading: false,
      pageIndex: 1, // 精准比分页码
      pageCount: 1, // 精准比分总页数
      pageStart: 0, // 红彩翻页起始数字
      pageTotal: 1, // 红彩翻页总条数
      pageLimit: 20, // 每页条数
      tableHeight: null,
      tableHeightJzbf: null,
      filterQuery: {
        type: '0',
        vipType: '-1'
      },
      searchQuery: {
        userName: ''
      },
      dialogRemarkVisible: false,
      markForm: {
        remark: ''
      },
      markLoading: false,
      operateData: null,
      remarkLogVisible: false, // 备注详情dialog是否显示
      remarkLogTitle: '', // 备注详情的title
      remarkLog: [], // 备注详情
      warningLog: [], // 预警日志
      vipForm: {},
      vipVisible: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getList()
    this.setHeight()
  },
  components: {
    DateYearQuarter
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - (this.activeTab === '0' ? this.$refs.elTable.$el.offsetTop : this.$refs.elTableJzbf.$el.offsetTop) - 63
      })
    },
    search () {
      if (parseInt(this.activeTab)) {
        if (this.searchQuery.userName) {
          this.searchJzbf()
        } else {
          this.getJzbfList()
        }
      } else {
        this.getList('search')
      }
    },
    pageChange () {
      if (parseInt(this.activeTab)) {
        this.getJzbfList()
      } else {
        this.pageStart = (this.pageIndex - 1) * this.pageLimit
        this.getList()
      }
    },
    // 切换tab
    handleClickTabs () {
      if (parseInt(this.activeTab)) {
        this.getJzbfList()
      } else {
        this.getList()
      }
      this.setHeight()
    },
    getList (arg, noScroll) {
      if (this.loading) return
      this.loading = true
      let data = {}
      if (isNumber(arg)) {
        this.pageStart = (arg - 1) * this.pageLimit
        if (this.searchQuery.userName) {
          data = Object.assign({
            start: this.pageStart,
            limit: this.pageLimit
          }, this.searchQuery)
        } else {
          data = Object.assign({
            start: this.pageStart,
            limit: this.pageLimit
          }, this.sortQuery, this.filterQuery)
        }
      } else if (arg === 'search' && !!this.searchQuery.userName) {
        this.pageStart = 0
        data = Object.assign({
          start: this.pageStart,
          limit: this.pageLimit
        }, this.searchQuery)
      } else {
        this.searchQuery.userName = ''
        this.pageStart = 0
        data = Object.assign({
          start: this.pageStart,
          limit: this.pageLimit
        }, this.sortQuery, this.filterQuery)
      }
      this.$service(UserList[0].list, {
        method: 'post',
        data: data
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.list = res.data.data || []
            this.pageTotal = res.data.total || 1
            if (!noScroll) {
              this.$refs.elTable.bodyWrapper.scrollTop = 0
              this.$refs.elTable.bodyWrapper.scrollLeft = 0
            }
            if (this.filterQuery.type === '1' || arg === 'search') this.$refs.elTable.clearSort()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getJzbfList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.searchQuery.userName = ''
      this.$service(UserList[1].list, {
        method: 'post',
        data: Object.assign(this.searchQuery.userName ? this.searchQuery : {}, {
          pageIndex: this.pageIndex,
          pageSize: this.pageLimit
        })
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.jzbfList = res.data.records || []
            this.pageCount = res.data.page ? res.data.page.pageCount : 1
            if (!noScroll) {
              this.$refs.elTableJzbf.bodyWrapper.scrollTop = 0
              this.$refs.elTableJzbf.bodyWrapper.scrollLeft = 0
            }
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    // 精准比分搜索
    searchJzbf () {
      if (this.loading) return
      this.loading = true
      this.$service(UserList[1].search, {
        params: {
          query: this.searchQuery.userName
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200 && res.data) {
          this.jzbfList = []
          if (res.data.account) {
            this.jzbfList.push(res.data)
          }
          this.pageCount = 1
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
    /**
     * @description: 服务端排序
     * @param {column}  排序相关参数
     */
    sortList (column) {
      this.sortQuery = {}
      this.sortQuery[column.prop] = column.order === 'ascending' ? 1 : 2
      if (column.prop === 'credit') this.sortQuery['creditNcoinOrderBy'] = column.order === 'ascending' ? 1 : 2
      if (column.prop === 'nCoin') this.sortQuery['creditNcoinOrderBy'] = column.order === 'ascending' ? 3 : 4
      if (column.prop === 'totalOrderCredit') this.sortQuery['tcmOrderBy'] = column.order === 'ascending' ? 1 : 2
      if (column.prop === 'totalOrderNCoin') this.sortQuery['tcmOrderBy'] = column.order === 'ascending' ? 3 : 4
      if (column.prop === 'tcmNetPrice') this.sortQuery['tcmOrderBy'] = column.order === 'ascending' ? 7 : 8
      if (column.prop === 'tcmOrderPrice') this.sortQuery['tcmOrderBy'] = column.order === 'ascending' ? 5 : 6
      this.getList()
    },
    /**
      * @description: 预警用户导出
      */
    exportUser () {
      window.open(window.location.origin + UserList[0].exportWarning)
    },
    exportVip () {
      if (this.vipForm.date && this.vipForm.date.split('-')) {
        const _time = this.vipForm.date.split('-')
        window.open(window.location.origin + UserList[0].exportVip + `?year=${_time[0]}&quarter=${_time[1]}`)
        this.vipVisible = false
      } else {
        this.$message.warning('请选择导出日期')
      }
    },
    currentOperate (val) {
      this.operateData = val
      this.dialogRemarkVisible = true
    },
    // 增加备注
    submitMarkForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addRrmark()
        }
      })
    },
    addRrmark () {
      this.markLoading = true
      this.$service(UserList[0].addRemark, {
        method: 'post',
        data: {
          content: this.markForm.remark,
          userId: this.operateData.userId
        }
      }).then(res => {
        this.markLoading = false
        if (res.code === 200) {
          this.dialogRemarkVisible = false
          this.getList(Math.floor(this.pageStart / this.pageLimit) + 1, true)
          this.$message.success('操作成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.markLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    confirm (data, type) {
      let typeText
      if (type === 'freeze') {
        typeText = parseInt(data.status) === 2 ? '解冻' : '冻结'
      } else if (type === 'clear') {
        typeText = '清除'
      }
      this.$confirm(`确定${typeText} ${data.account} 的账户红豆余额?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitFreeOrClear(data, type)
      })
    },
    submitFreeOrClear (data, type) {
      let url
      if (type === 'freeze') {
        url = parseInt(data.status) === 2 ? UserList[0].unfreezeUser : UserList[0].freezeUser
      } else if (type === 'clear') {
        url = UserList[0].flushBalance
      }
      this.$service(url, {
        method: 'post',
        data: {
          userId: data.userId
        }
      }).then(res => {
        if (res.code === 200) {
          this.getList(Math.floor(this.pageStart / this.pageLimit) + 1, true)
          this.$message.success('操作成功!')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    // 预警日志
    warningPop (userId) {
      this.warningLog = []
      this.$service(UserList[0].userWarningLog, {
        method: 'get',
        params: {
          userId: userId
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.warningLog = res.data
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
    // 查看备注
    lookRemark (row) {
      this.remarkLog = []
      this.remarkLogVisible = true
      this.remarkLogTitle = `备注详情 (用户ID：${row.userId})`
      this.$service(UserList[0].Remark, {
        method: 'get',
        params: {
          userId: row.userId
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.remarkLog = res.data
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
    // 解绑手机号
    unbindPhone (data) {
      this.$confirm(`确定解绑尾号为${data.phone.slice(-4)}的手机号？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true
      }).then(() => {
        this.$service(UserList[0].erasingPhone, {
          params: {
            userId: data.userId
          }
        }).then(res => {
          data.loading = false
          if (res.code === 200) {
            data.unbindPop = false
            this.getList(Math.floor(this.pageStart / this.pageLimit) + 1, true)
            this.$message.success('解绑成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            data.loading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
.device-content {
  p {
    text-align: center;
    word-break: break-all;
    text-align:left;
    line-height: 35px;
    padding: 0 12px;
    &:nth-child(2n) {
      background: #eee;
    }
  }
}
</style>
