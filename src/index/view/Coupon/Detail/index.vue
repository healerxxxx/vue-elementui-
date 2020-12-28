<template>
  <div class="coupon-detail">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: fromRouter.fullPath }" v-if="fromRouter">{{fromRouter.meta.title}}
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentRouter">{{currentRouter.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-popover v-if="showAddCoupon" v-model="addPop" placement="left-start" trigger="click">
          <el-input size="small" v-model="addCount" placeholder="整数且大于0"></el-input>
          <div style="text-align: right; margin: 10px 0 0">
            <el-button size="mini" type="" :loading="addLoading" @click="couponAdd()">增加</el-button>
            <el-button type="primary" size="mini" @click="couponAdd(true)">增加并导出</el-button>
          </div>
          <el-button slot="reference" type="danger" size="small" @click.native="addCount=''">增加券数</el-button>
        </el-popover>
        <el-popover v-if="couponInfo&&couponInfo.amountType==1" placement="left-start" width="400" trigger="click">
          <el-table size="mini" ref="logElTable" :data="logList" v-loading="logLoading" stripe max-height="350">
            <el-table-column width="140" property="createTime" label="日期">
            </el-table-column>
            <el-table-column width="160" property="userAccount" label="操作者">
            </el-table-column>
            <el-table-column width="100" property="incAmount" label="数量">
              <template slot-scope="scope">
                {{scope.row.incAmount || '-'}}个
              </template>
            </el-table-column>
          </el-table>
          <el-pagination small background layout="prev, pager, next" @current-change="getLogList"
            :current-page="logPageIndex" :page-count="logPageCount" class="page-bar-reset">
          </el-pagination>
          <el-button slot="reference" type="primary" size="small" @click.native="getLogList()">操作记录</el-button>
        </el-popover>
      </div>
    </div>
    <table class="coupon-table" v-if="couponInfo">
      <tr>
        <td class="bg-fa">序号：</td>
        <td>{{couponInfo.couponId}}</td>
        <td class="bg-fa">类型：</td>
        <td>{{couponInfo.couponType | couponType2CH}}</td>
        <td class="bg-fa">名称：</td>
        <td>{{couponInfo.couponName}}</td>
        <td class="bg-fa">创建方式：</td>
        <td>{{couponInfo.amountType === 0 ? '自动' : '手动'}}</td>
        <td class="bg-fa">状态：</td>
        <td>{{couponInfo.validStatus === 0 ? '正常' : '停用'}}</td>
      </tr>
      <tr>
        <td class="bg-fa">使用/领取/总数：</td>
        <td>
          {{couponInfo.useCount}}/{{couponInfo.fetchCount}}/{{couponInfo.amountType==0?couponInfo.fetchCount:couponInfo.amount}}
        </td>
        <td colspan="2" class="bg-fa">类型发放日期：</td>
        <td colspan="2">
          {{couponInfo.releaseTimeType == 0 ? '-' : couponInfo.releaseStartDate + ' ~ ' + couponInfo.releaseEndDate}}
        </td>
        <td colspan="2" class="bg-fa">券有效日期：</td>
        <td colspan="2">
          {{couponInfo.validType === 0 ? couponInfo.validDay + '天' : couponInfo.validStartDate + ' ~ ' + couponInfo.validEndDate}}
        </td>
      </tr>
    </table>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane :label="'待使用('+(couponInfo?couponInfo.tabUnUseCount:0)+')'" name="1" :disabled="loading">
      </el-tab-pane>
      <el-tab-pane :label="'已使用('+(couponInfo?couponInfo.tabUseCount:0)+')'" name="2" :disabled="loading"></el-tab-pane>
      <el-tab-pane :label="'待发放('+(couponInfo?couponInfo.tabUnSendCount:0)+')'" name="3" :disabled="loading">
      </el-tab-pane>
      <el-tab-pane :label="'已过期('+(couponInfo?couponInfo.tabExpiredCount:0)+')'" name="4" :disabled="loading">
      </el-tab-pane>
    </el-tabs>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="userCouponId" label="序号" width="90">
      </el-table-column>
      <el-table-column prop="couponCode" label="优惠券码" width="120">
      </el-table-column>
      <el-table-column prop="userAccount" label="领取人" min-width="100">
      </el-table-column>
      <el-table-column label="有效日期" min-width="160">
        <template slot-scope="scope">
          {{scope.row.validStartDate}} ~ {{scope.row.validEndDate}}
        </template>
      </el-table-column>
      <el-table-column v-if="activeTab==='1'" prop="fetchTime" label="领取时间" width="150">
      </el-table-column>
      <el-table-column v-if="activeTab==='2'" prop="useTime" label="使用时间" width="150">
      </el-table-column>
      <el-table-column v-if="activeTab==='3'" prop="createTime" label="创建时间" width="150">
      </el-table-column>
      <el-table-column v-if="activeTab==='4'" prop="expiredTime" label="过期时间" width="150">
      </el-table-column>
      <el-table-column prop="adminShowStatus" label="状态" width="100">
      </el-table-column>
      <el-table-column prop="useRangeShow" label="适用范围" min-width="150">
      </el-table-column>
      <el-table-column prop="couponDesc" label="说明" min-width="160">
      </el-table-column>
      <el-table-column prop="adminName" label="发放人" min-width="160">
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { CouponDetail } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'couponDetail',
  data () {
    return {
      tab: '0',
      fromRouter: null,
      currentRouter: null,
      activeTab: '1',
      couponId: null,
      couponInfo: null,
      list: [],
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      logList: [],
      logLoading: false,
      logPageIndex: 1,
      logPageSize: 25,
      logPageCount: 1,
      tableHeight: null,
      addCount: '',
      addPop: false,
      addLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    showAddCoupon () {
      return this.couponInfo && this.couponInfo.couponWrapType !== '1001' && this.couponInfo.amountType === 1 && !(this.couponInfo.validType === 1 && new Date(this.couponInfo.validEndDate).valueOf() < new Date().valueOf())
    }
  },
  created () {
    this.couponId = this.$route.params.id
    this.tab = this.$route.params.source
    this.getList()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    handleClickTabs () {
      this.pageIndex = 1
      this.pageCount = 1
      this.list = []
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.pageIndex = page || 1
      this.loading = true
      this.$service(CouponDetail[this.tab].list, {
        urlParams: {
          couponId: this.couponId,
          type: this.activeTab,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.couponInfo = res.data.couponDetail
          this.list = res.data.userCouponListPage.records || []
          this.pageCount = res.data.userCouponListPage.page && res.data.userCouponListPage.page.pageCount ? res.data.userCouponListPage.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.setHeight()
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
    getLogList (page) {
      if (this.logLoading) return
      this.logPageIndex = page || 1
      this.logLoading = true
      this.$service(CouponDetail[this.tab].log, {
        urlParams: {
          couponId: this.couponId,
          pageIndex: this.logPageIndex,
          pageSize: this.logPageSize
        }
      }).then(res => {
        this.logLoading = false
        if (res.code === 200) {
          this.logList = res.data.records || []
          this.logPageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.logElTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.logLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    couponAdd (type) {
      if (!/\d+/.test(this.addCount)) return this.$message.warning('要增加的券数必须为整数')
      if (this.addCount < 1) return this.$message.warning('要增加的券数必须大于0')
      if (type) {
        window.open(location.origin + CouponDetail[this.tab].addExport + '?couponId=' + this.couponId + '&count=' + this.addCount)
        this.addPop = false
        this.getList()
      } else {
        if (this.addLoading) return
        this.addLoading = true
        this.$service(CouponDetail[this.tab].add, {
          method: 'post',
          data: {
            couponId: this.couponId,
            count: this.addCount
          }
        }).then(res => {
          this.addLoading = false
          if (res.code === 200) {
            this.addPop = false
            this.$message.success('券数增加成功')
            this.getList()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.addLoading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.couponId = to.params.id
    this.pageIndex = 1
    this.pageCount = 1
    this.list = []
    this.activeTab = '1'
    this.couponInfo = null
    this.getList()
    next()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.fromRouter = from && from.name ? from : null
      vm.currentRouter = to
    })
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>

<style lang="scss">
.coupon-table {
  width: 100%;
  margin: 0 0 20px;
  font-size: 16px;
  th {
    background-color: #fafafa;
    color: #666;
    text-align: left;
  }
  td,
  th {
    padding: 10px;
    border: 1px solid #ebeef5;
    word-break: break-all;
    vertical-align: middle;
    &.bg-fa {
      background-color: #fafafa;
    }
  }
}
</style>
