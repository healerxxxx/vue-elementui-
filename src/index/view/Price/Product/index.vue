<template>
  <div class="price-product">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-dropdown @command="handleCommand">
          <el-button size="small" type="primary">
            切换 - {{{0: '红彩主包', 1: '精准比分'}[appTab]}} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0">红彩主包</el-dropdown-item>
            <el-dropdown-item command="1">精准比分</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="primary" size="small" @click="priceProductPop()">{{activeTab==='5'&&pointCardTab==='userLevel' ? '新建用户组' : '新建价格'}}</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs()">
      <el-tab-pane label="文章价格" :disabled="loading" name="1"></el-tab-pane>
      <el-tab-pane label="交叉盘价格" :disabled="loading" name="2"></el-tab-pane>
      <el-tab-pane label="五星指数价格" :disabled="loading" name="3"></el-tab-pane>
      <el-tab-pane label="盘赔变动价格" :disabled="loading" name="4"></el-tab-pane>
      <el-tab-pane label="点卡价格" :disabled="loading" name="5"></el-tab-pane>
      <el-tab-pane label="红彩指数价格" :disabled="loading" name="6"></el-tab-pane>
      <el-tab-pane label="VIP大会员" :disabled="loading" name="13"></el-tab-pane>
      <el-tab-pane label="旋转矩阵价格" :disabled="loading" name="15"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="spGroupTab" @tab-click="handleClickTabs()" v-show="activeTab==='2'">
      <el-tab-pane label="主包(新)" :disabled="loading" name="11"></el-tab-pane>
      <el-tab-pane label="主包(老)" :disabled="loading" name="2"></el-tab-pane>
      <el-tab-pane label="马甲包1" :disabled="loading" name="8"></el-tab-pane>
      <el-tab-pane label="马甲包2" :disabled="loading" name="9"></el-tab-pane>
      <el-tab-pane label="马甲包3" :disabled="loading" name="10"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="pointCardTab" @tab-click="handleClickTabs()" v-show="activeTab==='5'">
      <el-tab-pane label="普通价位" :disabled="loading" name="common"></el-tab-pane>
      <el-tab-pane label="抽卡价位" :disabled="loading" name="lottery"></el-tab-pane>
      <el-tab-pane label="活动点卡" :disabled="loading" name="activity"></el-tab-pane>
      <el-tab-pane label="VIP会员卡" :disabled="loading" name="vip"></el-tab-pane>
      <el-tab-pane label="分享拉新点卡" :disabled="loading" name="sharePullNew"></el-tab-pane>
      <el-tab-pane label="VIP补充卡" :disabled="loading" name="vipSupply"></el-tab-pane>
      <el-tab-pane label="聊天室抽奖卡" :disabled="loading" name="chatRoomDraw"></el-tab-pane>
      <el-tab-pane label="生日点卡" :disabled="loading" name="birthdayGift"></el-tab-pane>
      <el-tab-pane label="点卡用户群" :disabled="loading" name="userLevel"></el-tab-pane>
    </el-tabs>
    <!-- 文章价格 begin -->
    <el-table
      v-show="activeTab==='1'"
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        fixed
        prop="threadPriceId"
        label="商品ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="threadPriceName"
        label="商品名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="threadPrice"
        label="商品价格(元)"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="redCurrency"
        label="红豆数量(豆)"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="70">
        <template slot-scope="scope">
          {{scope.row.status==0 ? '正常' : '停用'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="70">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="priceProductPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 文章价格 end -->
    <!-- 交叉盘、五星指数、盘赔变动、红彩指数、VIP大会员 旋转矩阵付费 begin -->
    <el-table
      v-show="[2, 3, 4, 6, 13, 15].indexOf(parseInt(activeTab)) > -1"
      ref="elTableSP"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        fixed
        prop="subscribeProductId"
        label="商品ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="title"
        label="商品全称"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="subTitle"
        label="商品简称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="appleGoodsId"
        label="iOS产品码"
        min-width="140">
      </el-table-column>
      <el-table-column
        prop="freeSign"
        label="付费类型"
        width="100">
        <template slot-scope="scope">
          {{freeSign2CH[scope.row.freeSign] || '-'}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="activeTab==='2'"
        prop="dataCount"
        label="可用场次数"
        width="100">
      </el-table-column>
      <el-table-column
        v-if="activeTab==='2'"
        prop="creditPresent"
        label="赠送积分"
        width="100">
      </el-table-column>
      <el-table-column
        prop="price"
        label="定价(元)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="redCurrency"
        label="红豆(豆)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="days"
        label="有效期"
        width="100">
        <template slot-scope="scope">
          {{scope.row.effectiveType ? scope.row.days + '天' : '无限期'}}
        </template>
      </el-table-column>
      <el-table-column
        label="平台"
        width="80">
        <template slot-scope="scope">
          <span v-if="appTab.toString() === '0'">{{scope.row.payTerminalId === 9 ? 'iOSWAP' : scope.row.payTerminalId === 4 ? 'WAP' : '其他'}}</span>
          <span v-if="appTab.toString() === '1'">{{scope.row.payTerminalId === 5 ? 'iOSWAP' : scope.row.payTerminalId === 4 ? 'WAP' : '其他'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="70">
        <template slot-scope="scope">
          {{scope.row.status==0 ? '正常' : '停用'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="70">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="priceProductPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 交叉盘、五星指数、盘赔变动、红彩指数 end -->
    <!-- 点卡价格 begin -->
    <el-table
      v-show="activeTab==='5'&&pointCardTab!=='userLevel'"
      ref="elTablePC"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        fixed
        prop="pointCardId"
        label="商品ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="shortName"
        label="商品简称"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="productCode"
        label="iOS产品码"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="price"
        label="定价(元)"
        width="80">
      </el-table-column>
      <el-table-column
        prop="redCurrency"
        label="红豆(豆)"
        width="80">
      </el-table-column>
      <el-table-column
        prop="point"
        label="点数"
        width="60">
      </el-table-column>
      <el-table-column
        label="有效期"
        width="80">
        <template slot-scope="scope">
          {{scope.row.validDay ? scope.row.validDay + '天' : '无限期'}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="pointCardTab==='vipSupply'"
        prop="noActiveValidDay"
        label="未激活有效期"
        width="110">
        <template slot-scope="scope">
          {{scope.row.noActiveValidDay && scope.row.noActiveValidDay !== 0 ? scope.row.noActiveValidDay + '天' : '无限期'}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="pointCardTab==='common'"
        prop="userLevelIdList"
        label="用户组"
        min-width="120">
        <template slot-scope="scope">
          {{userLevel2CH(scope.row.userLevelIdList)}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="pointCardTab==='common'"
        prop="url"
        label="链接"
        min-width="120">
      </el-table-column>
      <el-table-column
        v-if="pointCardTab==='lottery'"
        prop="totalCount"
        label="卡总数"
        width="80">
      </el-table-column>
      <el-table-column
        v-if="pointCardTab==='lottery'"
        prop="totalFetchCount"
        label="已发放数"
        width="80">
      </el-table-column>
      <el-table-column
        v-if="pointCardTab==='lottery'"
        label="开放时间"
        min-width="115">
        <template slot-scope="scope">
          {{scope.row.timeRestrict === 1 ? scope.row.timeStart + ' ~ ' + scope.row.timeEnd : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="70">
        <template slot-scope="scope">
          {{scope.row.status==1 ? '正常' : '停用'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="70">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="1"
            :inactive-value="0"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="priceProductPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 点卡价格 end -->
    <!-- 用户组 end -->
    <el-table
      v-show="activeTab==='5'&&pointCardTab==='userLevel'"
      :row-class-name="setClassName"
      ref="elTableUL"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table
            :show-header="false"
            stripe
            :data="props.row.packageRelateLotteryCardVos">
            <el-table-column
              width="80">
              <template slot-scope="scope">
                {{appPackageType2CH[scope.row.appPackageType] || ''}}
              </template>
            </el-table-column>
            <el-table-column
              min-width="200">
              <template slot-scope="scope">
                <div class="relationCard" v-html="scope.row.relateLotteryCardDescList.join('<br />')"></div>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        prop="userLevelId"
        label="用户群ID"
        width="100">
      </el-table-column>
      <el-table-column
        prop="levelName"
        label="用户群等级"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="consumeDaysIntervalStr"
        label="消费天数"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="weeklyConsumeTimesIntervalStr"
        label="周消费天数"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="dailyConsumeIntervalStr"
        label="日均消费额"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="maxWeekConsumeIntervalStr"
        label="周最高消费额"
        min-width="120">
      </el-table-column>
      <el-table-column
        label="关联"
        width="70">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            trigger="hover">
            <div style="text-align: right; margin: 0">
              <el-button type="primary" size="mini" v-for="(value, key) in appPackageType2CH" :key="key" @click="relateCardPop(scope.row, key)">{{value}}</el-button>
            </div>
            <el-button slot="reference" type="text" size="small">关联</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="160">
        <template slot-scope="scope">
          <el-switch
            v-if="scope.row.userGroupType!==1"
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="1"
            :inactive-value="0"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="priceProductPop(scope.row)" v-if="scope.row.userGroupType!==1"></el-button>
          <el-popover
            v-if="scope.row.userGroupType!==1"
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="userLevelDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!-- 用户组 end -->
    <el-pagination
      v-show="activeTab!=='1'"
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <v-thread-dialog
      :data="dialogThreadData"
      :visible="dialogThread"
      :appTab="appTab"
      @closeDialog="dialogThread=false"
      @success="getList(pageIndex)">
    </v-thread-dialog>
    <v-sp-dialog
      :data="dialogSpData"
      :visible="dialogSp"
      :type="dialogSpType"
      :appTab="appTab"
      @closeDialog="dialogSp=false"
      @success="getList(pageIndex)">
    </v-sp-dialog>
    <v-point-card-dialog
      :data="dialogPointCardData"
      :visible="dialogPointCard"
      :type="dialogPointCardType"
      :appType="appPackageType"
      :userLevel="pointCardCommonUserLevelList"
      :appTab="appTab"
      @closeDialog="dialogPointCard=false"
      @success="getList(pageIndex)">
    </v-point-card-dialog>
    <v-level-dialog
      :data="dialogUserLevelData"
      :visible="dialogUserLevel"
      :appTab="appTab"
      @closeDialog="dialogUserLevel=false"
      @success="getList(pageIndex)">
    </v-level-dialog>
    <v-relate-card-dialog
      :data="relateCardData"
      :visible="dialogRelateCard"
      :cardList="relateCardList"
      :type="relateCardType"
      :appTab="appTab"
      @closeDialog="dialogRelateCard=false"
      @success="getList(pageIndex)">
    </v-relate-card-dialog>
  </div>
</template>

<script>
import { PriceProductArticle, PriceProductSp, PriceProductPointCard, PriceProductPointCardUserLevel } from '../../../util/api'
import VThreadDialog from './components/ThreadDialog'
import VSpDialog from './components/SpDialog'
import VPointCardDialog from './components/PointCardDialog'
import VLevelDialog from './components/LevelDialog'
import VRelateCardDialog from './components/RelateCardDialog'
import { mapState } from 'vuex'
export default {
  name: 'PriceProduct',
  data () {
    return {
      appTab: 0,
      activeTab: '1',
      spGroupTab: '11',
      pointCardTab: 'common',
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      freeSign2CH: {
        1: '普通',
        2: '免费试用',
        3: 'VIP免费试用',
        4: '彩票店地推免费试用'
      },
      pointCardCommonUserLevelList: [],
      dialogThread: false,
      dialogThreadData: {},
      dialogSp: false,
      dialogSpType: null,
      dialogSpData: {},
      dialogPointCard: false,
      dialogPointCardType: null,
      appPackageType: null,
      dialogPointCardData: {},
      dialogUserLevel: false,
      dialogUserLevelData: {},
      appPackageType2CH: {
        0: '主包',
        1: '马甲包1',
        2: '马甲包2',
        3: '马甲包3'
      },
      dialogRelateCard: false,
      relateCardList: {},
      relateCardData: {},
      relateCardType: null
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    PriceProductArticleApi () {
      return PriceProductArticle[this.appTab]
    },
    PriceProductSpApi () {
      return PriceProductSp[this.appTab]
    },
    PriceProductPointCardApi () {
      return PriceProductPointCard[this.appTab]
    },
    PriceProductPointCardUserLevelApi () {
      return PriceProductPointCardUserLevel[this.appTab]
    }
  },
  components: {
    VThreadDialog,
    VSpDialog,
    VPointCardDialog,
    VLevelDialog,
    VRelateCardDialog
  },
  created () {
    this.getList()
    this.getPointCardCommonUserLevelList()
    this.setHeight()
  },
  methods: {
    setClassName ({ row, index }) {
      return row.packageRelateLotteryCardVos && row.packageRelateLotteryCardVos.length > 0 ? '' : 'expend-hidden'
    },
    setHeight () {
      this.$nextTick(() => {
        let offsetTop = 0
        if (this.activeTab === '1') {
          offsetTop = this.$refs.elTable.$el.offsetTop
        } else if (this.activeTab === '5') {
          offsetTop = this.pointCardTab !== 'userLevel' ? this.$refs.elTablePC.$el.offsetTop : this.$refs.elTableUL.$el.offsetTop
        } else {
          offsetTop = this.$refs.elTableSP.$el.offsetTop
        }
        this.tableHeight = this.windowHeight - offsetTop - (this.activeTab !== '1' ? 63 : 20)
      })
    },
    handleCommand (val) {
      if (this.appTab.toString() !== val.toString()) {
        this.appTab = val
        this.handleClickTabs()
      }
    },
    handleClickTabs () {
      this.list = []
      this.getList()
      this.setHeight()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      if (this.activeTab === '1') {
        this.$service(this.PriceProductArticleApi.list).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.list = res.data || []
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.$refs.elTable.bodyWrapper.scrollLeft = 0
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        })
      } else if (this.activeTab === '5') {
        if (this.pointCardTab !== 'userLevel') {
          this.$service(this.PriceProductPointCardApi.list, {
            urlParams: {
              type: this.pointCardTab,
              pageIndex: this.pageIndex,
              pageSize: this.pageSize
            },
            params: {
              appPackageType: 0
            }
          }).then(res => {
            this.loading = false
            if (res.code === 200) {
              this.list = res.data.records || []
              this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
              this.$refs.elTableUL.bodyWrapper.scrollTop = 0
              this.$refs.elTableUL.bodyWrapper.scrollLeft = 0
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          })
        } else {
          this.$service(this.PriceProductPointCardUserLevelApi.list, {
            urlParams: {
              pageIndex: this.pageIndex,
              pageSize: this.pageSize
            }
          }).then(res => {
            this.loading = false
            if (res.code === 200) {
              this.list = res.data.records || []
              this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
              this.$refs.elTableUL.bodyWrapper.scrollTop = 0
              this.$refs.elTableUL.bodyWrapper.scrollLeft = 0
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      } else {
        this.$service(this.PriceProductSpApi.list, {
          params: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            typeId: this.activeTab === '2' ? this.spGroupTab : this.activeTab
          }
        }).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.list = res.data.records || []
            this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
            this.$refs.elTableSP.bodyWrapper.scrollTop = 0
            this.$refs.elTableSP.bodyWrapper.scrollLeft = 0
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        })
      }
    },
    changeWeight (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{1,2}$/,
        inputErrorMessage: '0-99之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        let _data = {
          weight: value
        }
        if (this.activeTab === '1') {
          _data['threadPriceId'] = data.threadPriceId
        } else if (this.activeTab === '5') {
          _data['pointCardId'] = data.pointCardId
        } else {
          _data['spId'] = data.subscribeProductId
        }
        this.$service(this.activeTab === '1' ? this.PriceProductArticleApi.weight : this.activeTab === '5' ? this.PriceProductPointCardApi.weight : this.PriceProductSpApi.weight, {
          method: this.activeTab === '5' ? 'get' : 'post',
          urlParams: this.activeTab === '5' ? _data : null,
          data: this.activeTab === '5' ? null : _data
        }).then(res => {
          if (res.code === 200) {
            this.getList()
            this.$message.success('权重修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    /**
     * @description: 更新状态的switch开关
     * @param {Object} data 数据对象，如果更新失败，则还原为原来的状态
     */
    switchStatus (data) {
      let _data = {
        status: data.status
      }
      if (this.activeTab === '1') {
        _data['threadPriceId'] = data.threadPriceId
      } else if (this.activeTab === '5') {
        if (this.pointCardTab === 'userLevel') {
          _data['userLevelId'] = data.userLevelId
        } else {
          _data['pointCardId'] = data.pointCardId
          _data['type'] = this.pointCardTab
        }
      } else {
        _data['spId'] = data.subscribeProductId
      }
      this.$set(data, 'statusLoading', true)
      this.$service(this.activeTab === '1' ? this.PriceProductArticleApi.status : this.activeTab === '5' ? this.PriceProductPointCardApi.status : this.PriceProductSpApi.status, {
        method: this.activeTab === '5' ? 'get' : 'post',
        urlParams: this.activeTab === '5' ? _data : null,
        data: this.activeTab === '5' ? null : _data
      }).then((res) => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'status', data.status ? 0 : 1)
          this.$message.error(res.code + ':' + res.message)
        }
      }, (err) => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    getPointCardCommonUserLevelList () {
      this.$service(this.PriceProductPointCardApi.userList).then(res => {
        if (res.code === 200) {
          this.pointCardCommonUserLevelList = res.data || []
        }
      })
    },
    userLevel2CH (arr) {
      if (!arr || arr.length === 0) return
      if (this.pointCardCommonUserLevelList.length === 0) return arr.join(',')
      let _arr = []
      arr.forEach(item => {
        this.pointCardCommonUserLevelList.forEach(_item => {
          if (item === _item.userLevelId) _arr.push(_item.levelName)
        })
      })
      return _arr.join('、')
    },
    userLevelDel (data) {
      this.$set(data, 'loading', true)
      this.$service(this.PriceProductPointCardUserLevelApi.del, {
        urlParams: {
          userLevelId: data.userLevelId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    priceProductPop (data) {
      if (this.activeTab === '1') {
        this.dialogThread = true
        this.dialogThreadData = data || {}
      } else if (this.activeTab === '5') {
        if (this.pointCardTab === 'userLevel') {
          this.dialogUserLevel = true
          this.dialogUserLevelData = data || {}
        } else {
          this.dialogPointCard = true
          this.dialogPointCardType = this.pointCardTab
          this.appPackageType = 0
          this.dialogPointCardData = data || {}
        }
      } else {
        this.dialogSp = true
        this.dialogSpType = this.activeTab === '2' ? this.spGroupTab : this.activeTab
        this.dialogSpData = data || {}
      }
    },
    relateCardPop (data, type) {
      this.$service(this.PriceProductPointCardUserLevelApi.addCardList, {
        params: {
          appPackageType: type
        }
      }).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.relateCardList[item.pointCardId] = item
          })
          this.relateCardData = data
          this.relateCardType = type
          this.dialogRelateCard = true
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
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
