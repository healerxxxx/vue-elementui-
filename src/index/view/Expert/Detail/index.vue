<template>
  <div class="expert-detail"
    v-loading="loading">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: fromRouter.fullPath }"
            v-if="fromRouter">{{fromRouter.meta.title}}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentRouter">{{currentRouter.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <table-scroll>
      <table class="expert-table" style="min-width:800px" v-if="expertInfo">
        <tr>
          <td rowspan="5"
            class="avatar">
            <img :src="expertInfo.avatar + '?imageView&thumbnail=100y100&quality=85'"
              alt="expertInfo.nickname">
          </td>
          <td class="bg-fa">昵称：</td>
          <td>{{expertInfo.nickname}}</td>
          <td class="bg-fa">姓名：</td>
          <td>{{expertInfo.realName}}</td>
          <td class="bg-fa">创建时间：</td>
          <td>{{[expertInfo.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
          <td class="bg-fa">专家状态：</td>
          <td>{{expertInfo.eStatus | expertStatus2CH}}</td>
        </tr>
        <tr>
          <td class="bg-fa">认证：</td>
          <td>{{expertInfo.slogan}}</td>
          <td class="bg-fa">手机：</td>
          <td>{{expertInfo.phone}}</td>
          <td class="bg-fa">最后登录：</td>
          <td>{{[expertInfo.lastLoginTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}</td>
          <td class="bg-fa">协议状态：</td>
          <td>{{expertInfo.serviceStatus | serviceStatus2CH}}</td>
        </tr>
        <tr>
          <td class="bg-fa">账号：</td>
          <td>{{expertInfo.account}}</td>
          <td class="bg-fa">彩种：</td>
          <td>{{expertInfo.lotteryCategoryNames}}</td>
          <td class="bg-fa">擅长联赛：</td>
          <td>{{expertInfo.beGoodAtLeague}}</td>
          <td class="bg-fa">地区：</td>
          <td>{{expertInfo.region | region2CH}}</td>
        </tr>
        <tr>
          <td class="bg-fa">简介：</td>
          <td>{{expertInfo.description}}</td>
          <td class="bg-fa">简介URL：</td>
          <td>{{expertInfo.descLink}}</td>
          <td class="bg-fa">分类：</td>
          <td>{{[expertInfo.accountType] | accountType2CH}}</td>
          <td colspan="2"
            style="min-width: 130px;">
            <el-button type="primary"
              size="mini"
              @click="editorExpert()">修改</el-button>
            <el-button type="primary"
              size="mini"
              v-if="expertInfo.eStatus === 0"
              @click="onOffLine(1)">下线</el-button>
            <el-button type="primary"
              size="mini"
              v-if="expertInfo.eStatus === 1"
              @click="onOffLine(0)">恢复</el-button>
          </td>
        </tr>
        <tr>
          <td class="bg-fa">最近连红数：</td>
          <td class="text-red">{{expertInfo.continuityWin}}</td>
          <td class="bg-fa">最大连红数：</td>
          <td class="text-red">{{expertInfo.maxContinuityWin}}</td>
          <td class="bg-fa">文章数：</td>
          <td>{{expertInfo.threadCount}}</td>
          <td class="bg-fa">粉丝数：</td>
          <td>{{expertInfo.follower}}</td>
        </tr>
      </table>
    </table-scroll>
    <table-scroll>
      <table class="expert-table stat" style="min-width:620px;" v-if="expertStat && expertStat.commonStatDetailVo">
        <thead>
          <tr>
            <th colspan="5">命中率</th>
            <th colspan="4">盈利率</th>
          </tr>
          <tr>
            <th>类别</th>
            <th>百分比</th>
            <th>时间</th>
            <th>X中X</th>
            <th>百分比</th>
            <th>类别</th>
            <th>百分比</th>
            <th>时间</th>
            <th>百分比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="3">总命中率</td>
            <td rowspan="3">{{expertStat.commonStatDetailVo.totalHitRate | toPercent}}</td>
            <td>近3日</td>
            <td>{{expertStat.commonStatDetailVo.threeDaysPOARate}}</td>
            <td>{{expertStat.commonStatDetailVo.threeDaysHitRate | toPercent}}</td>
            <td rowspan="3">盈利率</td>
            <td rowspan="3">{{expertStat.commonStatDetailVo.totalEarningRate | toPercent}}</td>
            <td>近3日</td>
            <td>{{expertStat.commonStatDetailVo.threeDaysEarningRate | toPercent}}</td>
          </tr>
          <tr>
            <td>近7日</td>
            <td>{{expertStat.commonStatDetailVo.sevenDaysPOARate}}</td>
            <td>{{expertStat.commonStatDetailVo.sevenDaysHitRate | toPercent}}</td>
            <td>近7日</td>
            <td>{{expertStat.commonStatDetailVo.sevenDaysEarningRate | toPercent}}</td>
          </tr>
          <tr>
            <td>近30日</td>
            <td>{{expertStat.commonStatDetailVo.thirtyDaysPOARate}}</td>
            <td>{{expertStat.commonStatDetailVo.thirtyDaysHitRate | toPercent}}</td>
            <td>近30日</td>
            <td>{{expertStat.commonStatDetailVo.thirtyDaysEarningRate | toPercent}}</td>
          </tr>
        </tbody>
        <!-- <tbody v-for="(item, index) in expertStat.commonStatDetailVo.playTacticStatList"
          :key="index">
          <tr>
            <td rowspan="3">{{item.playMetaName}}</td>
            <td rowspan="3">{{item.totalHitRate | toPercent}}</td>
            <td>近3日</td>
            <td>{{item.threeDaysPOARate}}</td>
            <td>{{item.threeDaysHitRate | toPercent}}</td>
            <td rowspan="3">{{item.playMetaName}}</td>
            <td rowspan="3">{{item.totalEarningRate | toPercent}}</td>
            <td>近3日</td>
            <td>{{item.threeDaysEarningRate | toPercent}}</td>
          </tr>
          <tr>
            <td>近7日</td>
            <td>{{item.sevenDaysPOARate}}</td>
            <td>{{item.sevenDaysHitRate | toPercent}}</td>
            <td>近7日</td>
            <td>{{item.sevenDaysEarningRate | toPercent}}</td>
          </tr>
          <tr>
            <td>近30日</td>
            <td>{{item.thirtyDaysPOARate}}</td>
            <td>{{item.thirtyDaysHitRate | toPercent}}</td>
            <td>近30日</td>
            <td>{{item.thirtyDaysEarningRate | toPercent}}</td>
          </tr>
        </tbody> -->
      </table>
    </table-scroll>
    <table-scroll>
      <table style="width:100%;min-width:620px;" v-if="expertStat && expertStat.opWinNineStatDetailVo">
        <tr>
          <td style="vertical-align: middle;">
            <table class="expert-table stat">
              <tr>
                <th></th>
                <th>历史全中次数</th>
                <th>总奖金数</th>
              </tr>
              <tr>
                <td>胜负彩</td>
                <td>{{expertStat.opWinNineStatDetailVo.winColoursHitDegreeCount}}</td>
                <td>{{expertStat.opWinNineStatDetailVo.winColoursAward}}</td>
              </tr>
              <tr>
                <td>任九</td>
                <td>{{expertStat.opWinNineStatDetailVo.optionalNineHitDegreeCount}}</td>
                <td>{{expertStat.opWinNineStatDetailVo.optionalNineAward}}</td>
              </tr>
            </table>
          </td>
          <td style="vertical-align: middle;">
            <table class="expert-table stat"
              v-if="expertStat.opWinNineStatDetailVo.latestDegreeHitList && expertStat.opWinNineStatDetailVo.latestDegreeHitList.length>0">
              <tr v-for="(item, index) in expertStat.opWinNineStatDetailVo.latestDegreeHitList"
                :key="index">
                <td v-if="index===0"
                  rowspan="3"
                  style="border-left:0;">近三期</td>
                <td>{{item.lotteryCategoryName}}</td>
                <td>{{item.hitInfo}}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </table-scroll>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="竞彩文章列表" name="0"></el-tab-pane>
      <el-tab-pane label="数字彩文章列表" name="1"></el-tab-pane>
    </el-tabs>
    <el-table
      v-show="activeTab === '0'"
      :data="threadList"
      v-loading="threadLoading"
      stripe>
      <el-table-column label="连红"
        width="50">
        <template slot-scope="scope">
          <span class="text-red"
            v-if="scope.row.isWin === 1 && scope.row.plock === 3 && scope.row.categoryId !== 3 && scope.row.categoryId !== 4">√</span>
          <span v-if="scope.row.isWin === 0 && scope.row.plock === 3 && scope.row.categoryId !== 3 && scope.row.categoryId !== 4">×</span>
        </template>
      </el-table-column>
      <el-table-column prop="hitRateValue"
        label="命中"
        width="60">
        <template slot-scope="scope">
          {{scope.row.plock === 3 ? scope.row.hitRateValue : ''}}
        </template>
      </el-table-column>
      <el-table-column prop="cName"
        label="彩种"
        width="80">
      </el-table-column>
      <el-table-column prop="title"
        label="文章标题"
        min-width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.refund"
            size="mini">不中退</el-tag>
            <el-tag v-if="scope.row.businessTypeId" size="mini">临场</el-tag>
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}"><span v-if="scope.row.categoryId==3||scope.row.categoryId==4"
              style="color:#e62121;">【{{scope.row.threadTypeId | threadType2CH}}】</span>{{scope.row.title}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="threadId"
        label="文章ID"
        min-width="130">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.threadId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="createTime"
        label="发布时间"
        width="155">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="favCount"
        label="收藏数"
        width="80">
      </el-table-column>
      <el-table-column
        prop="price"
        label="价格"
        width="60">
        <template slot-scope="scope">
          <span v-if="scope.row.price > 0">{{scope.row.price}}</span>
          <span v-else class="text-red">免费</span>
        </template>
      </el-table-column>
      <el-table-column prop="buyCount"
        label="购买数"
        width="80">
      </el-table-column>
      <el-table-column prop="plock"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.plock | articleStatus2CH}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-show="activeTab === '0'"
      background
      layout="prev, pager, next"
      @current-change="getThreadList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset" />
    <el-table
      v-show="activeTab === '1'"
      :data="numLotteryThreadList"
      v-loading="numLotteryThreadLoading"
      stripe>
      <el-table-column prop="threadTypeId"
        label="彩种"
        width="80">
        <template slot-scope="scope">
          {{numLotteryType[scope.row.threadTypeId] || ''}}
        </template>
      </el-table-column>
      <el-table-column prop="title"
        label="文章标题"
        min-width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.refund" size="mini">不中退</el-tag>
          <el-tag v-if="scope.row.businessTypeId" size="mini">临场</el-tag>
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">
            <span v-if="scope.row.categoryId==3||scope.row.categoryId==4" style="color:#e62121;">【{{scope.row.threadTypeId | threadType2CH}}】</span>{{scope.row.title}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="threadId"
        label="文章ID"
        min-width="130">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.threadId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="createTime"
        label="发布时间"
        width="155">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="favCount"
        label="收藏数"
        width="80">
      </el-table-column>
      <el-table-column
        prop="price"
        label="价格"
        width="60">
        <template slot-scope="scope">
          <span v-if="scope.row.price > 0">{{scope.row.price}}</span>
          <span v-else class="text-red">免费</span>
        </template>
      </el-table-column>
      <el-table-column prop="buyCount"
        label="购买数"
        width="80">
      </el-table-column>
      <el-table-column prop="plock"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.plock | articleStatus2CH}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-show="activeTab === '1'"
      background
      layout="prev, pager, next"
      @current-change="getNumLotteryList"
      :current-page="numLotteryPageIndex"
      :page-count="numLotteryPageCount"
      class="page-bar-reset" />
    <v-expert-dialog
      :expertInfo="expertInfo"
      :protocolList="protocolList"
      :visible="dialogExpert"
      @closeExpertDialog="dialogExpert=false"
      @success="getDetail($route.params.id)" />
  </div>
</template>

<script>
import { ExpertDetail } from '../../../util/api'
import { queryExpertDetailbyId } from '../../../util/commonQuery'
import VExpertDialog from '../component/ExpertDialog'
import TableScroll from '../../../component/TableScroll'
import { objSort } from '../../../util/tool'
export default {
  name: 'ExpertDetail',
  data () {
    return {
      activeTab: '0',
      fromRouter: null,
      currentRouter: null,
      loading: false,
      expertInfo: '',
      expertStat: '',
      dialogExpert: false,
      protocolList: [],
      threadList: [],
      pageIndex: 1,
      pageSize: 10,
      pageCount: 1,
      threadLoading: false,
      numLotteryThreadList: [],
      numLotteryPageIndex: 1,
      numLotteryPageSize: 10,
      numLotteryPageCount: 1,
      numLotteryThreadLoading: false,
      numLotteryType: {
        101: '双色球',
        102: '3D',
        103: '大乐透',
        104: '排列3',
        105: '排列5'
      },
      isLottery: false,
      isNumlottery: false
    }
  },
  created () {
    this.initRouter(this.$route.params.id)
  },
  filters: {
    expertStatus2CH (val) {
      let dict = {
        '0': '正常',
        '1': '下线'
      }
      return dict[val] || '-'
    },
    serviceStatus2CH (val) {
      let dict = {
        '-1': '待确认',
        '1': '正常',
        '0': '终止'
      }
      return dict[val] || '-'
    },
    region2CH (val) {
      let dict = {
        '0': '中国',
        '1': '外国',
        '2': '外国人中国卡',
        '3': '机构'
      }
      return dict[val] || '-'
    }
  },
  components: {
    VExpertDialog,
    TableScroll
  },
  methods: {
    initRouter (id) {
      this.getDetail(id).then(res => {
        if (res) {
          this.getStat(res.userId)
          this.getThreadList()
        }
      })
    },
    getDetail (id) {
      if (this.loading) return
      this.loading = true
      return queryExpertDetailbyId(id).then(res => {
        this.expertInfo = res
        this.expertInfo.lotteryCategoryList.sort(objSort('lotteryCategoryId'))
        let lotteryCategoryNames = []
        this.expertInfo.lotteryCategoryList.forEach(item => {
          lotteryCategoryNames.push(item.lotteryCategoryName)
        })
        this.expertInfo['lotteryCategoryNames'] = lotteryCategoryNames.join('、')
        this.loading = false
        return Promise.resolve(res)
      }).catch(err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getStat (id) {
      this.$service(ExpertDetail.stat, {
        method: 'get',
        urlParams: {
          userId: id
        }
      }).then(res => {
        if (res.code === 200) {
          this.expertStat = res.data
        }
      })
    },
    handleClickTabs () {
      if (this.activeTab === '0' && this.threadList.length < 1) {
        this.getThreadList()
      }
      if (this.activeTab === '1' && this.numLotteryThreadList.length < 1) {
        this.getNumLotteryList()
      }
    },
    getThreadList (page) {
      if (this.threadLoading) return
      this.threadLoading = true
      this.pageIndex = page || 1
      this.$service(ExpertDetail.threadList, {
        urlParams: {
          userId: this.expertInfo.userId,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.threadLoading = false
        if (res.code === 200) {
          this.threadList = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.threadLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getNumLotteryList (page) {
      if (this.numLotteryThreadLoading) return
      this.numLotteryThreadLoading = true
      this.numLotteryPageIndex = page || 1
      this.$service(ExpertDetail.numLotteryThreadList, {
        urlParams: {
          pageIndex: this.numLotteryPageIndex,
          pageSize: this.numLotteryPageSize
        },
        params: {
          userId: this.expertInfo.userId
        }
      }).then(res => {
        this.numLotteryThreadLoading = false
        if (res.code === 200) {
          this.numLotteryThreadList = res.data.records || []
          this.numLotteryPageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.numLotteryThreadLoading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    getProtocolList (id) {
      return this.$service(ExpertDetail.protocolList, {
        urlParams: {
          userId: id
        }
      }).then(res => {
        if (res.code === 200) {
          this.protocolList = res.data || []
          this.protocolList.forEach(item => {
            this.$set(item, 'divideRateNumber', (item.divideRate * 100).toFixed(0))
          })
          return Promise.resolve(res.data)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    editorExpert () {
      this.getProtocolList(this.$route.params.id).then(() => {
        this.dialogExpert = true
      })
    },
    onOffLine (val) {
      this.$confirm('确定' + (val ? '下线' : '上线') + '专家？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(val ? ExpertDetail.offline : ExpertDetail.online, {
          urlParams: {
            userId: this.expertInfo.userId
          }
        }).then(res => {
          if (res.code === 200) {
            this.expertInfo.eStatus = val
            this.$message.success((val ? '下线' : '上线') + '成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.initRouter(to.params.id)
    next()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.fromRouter = from && from.name ? from : null
      vm.currentRouter = to
    })
  }
}
</script>

<style lang="scss">
.expert-table {
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
    &.avatar {
      width: 100px;
      text-align: center;
      img {
        max-width: 100%;
        max-height: 100%;
        display: block;
      }
    }
  }
  &.stat {
    th,
    td {
      padding: 8px 10px;
    }
  }
}
</style>
