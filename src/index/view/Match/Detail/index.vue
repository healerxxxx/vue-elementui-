<template>
  <div class="match-detail" v-loading="loading">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <!-- <el-breadcrumb-item :to="{ path: '/match' }">赛事列表</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item> -->
          <el-breadcrumb-item :to="{ path: fromRouter.fullPath }" v-if="fromRouter">{{fromRouter.meta.title}}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentRouter">{{currentRouter.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <table class="match-table" v-if="matchInfo">
      <tr>
        <td><el-tag>{{lottery2CH[matchInfo.lotteryCategoryId]}}</el-tag></td>
        <td class="bg-fa">联赛类型：</td>
        <td>{{matchInfo.leagueMatchName}}</td>
        <td class="bg-fa">赛事ID：</td>
        <td>{{matchInfo.matchInfoId || matchInfo.matchCode}}</td>
        <td class="bg-fa">比赛时间：</td>
        <td>{{matchInfo.matchTime}}</td>
        <td class="bg-fa">赛事状态：</td>
        <td>{{matchInfo.matchStatus | matchStatus2CH}}</td>
      </tr>
      <tr>
        <td><span class="text-red" v-if="matchInfo.refund"><b>不中退</b></span></td>
        <td colspan="4" align="center">
          <div class="info-vs-team" v-if="matchInfo.lotteryCategoryId!==2&&matchInfo.lotteryCategoryId!==6">
            <div class="team">
              <p>{{matchInfo.homeMatchTeam.teamName}}</p>
              <p>{{matchInfo.homeMatchTeam.teamCode}}</p>
            </div>
            <img v-if="matchInfo.homeMatchTeam.teamIcon" :src="matchInfo.homeMatchTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85'">
            {{matchInfo.matchStatus === 2 || matchInfo.matchStatus === 3 ? matchInfo.homeScore + ' - ' + matchInfo.guestScore : ' VS '}}
            <img v-if="matchInfo.guestMatchTeam.teamIcon" :src="matchInfo.guestMatchTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85'">
            <div class="team">
              <p>{{matchInfo.guestMatchTeam.teamName}}</p>
              <p>{{matchInfo.guestMatchTeam.teamCode}}</p>
            </div>
          </div>
          <div class="info-vs-team" v-else>
            <div class="team">
              <p>{{matchInfo.guestMatchTeam.teamName}}</p>
              <p>{{matchInfo.guestMatchTeam.teamCode}}</p>
            </div>
            <img v-if="matchInfo.guestMatchTeam.teamIcon" :src="matchInfo.guestMatchTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85'">
            {{matchInfo.matchStatus === 2 || matchInfo.matchStatus === 3 ? matchInfo.guestScore + ' - ' + matchInfo.homeScore : ' VS '}}
            <img v-if="matchInfo.homeMatchTeam.teamIcon" :src="matchInfo.homeMatchTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85'">
            <div class="team">
              <p>{{matchInfo.homeMatchTeam.teamName}}</p>
              <p>{{matchInfo.homeMatchTeam.teamCode}}</p>
            </div>
          </div>
        </td>
        <td class="bg-fa">文章数：</td>
        <td>{{matchInfo.threadCount}}</td>
        <td class="bg-fa">关注数：</td>
        <td>{{matchInfo.focusCount}}</td>
      </tr>
    </table>
    <div class="match-odds" v-if="matchInfo">
      <div class="play-list" v-for="(item, index) in matchInfo.playList" :key="index" :class="{'two':item.playItemList.length==2}">
        <div class="odds-name">{{item.playName}}({{item.concede}})</div>
        <div class="odds-list" :class="{'hit':item.resultItemId===_item.playItemId}" v-for="(_item, _index) in item.playItemList" :key="_index">
          <span>{{_item.playItemName}}({{_item.odds}})</span>
          <el-popover
            v-if="_item.postExpertCount>0"
            placement="left"
            width="300"
            trigger="hover"
            :content="_item.postExperts.join('、')">
            <el-button slot="reference" type="primary" size="mini" style="position:absolute;z-index:2;bottom:0;right:0;">{{_item.postExpertCount+'人'}}</el-button>
          </el-popover>
        </div>
      </div>
    </div>
    <el-table
      :data="threadList"
      v-loading="threadLoading"
      stripe>
      <el-table-column
        label="连红"
        width="60">
        <template slot-scope="scope">
          <span class="text-red" v-if="scope.row.isWin === 1 && scope.row.plock === 3 && scope.row.threadTypeId < 3">√</span>
          <span v-if="scope.row.isWin === 0 && scope.row.plock === 3 && scope.row.threadTypeId < 3">×</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="文章标题"
        min-width="200">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.refund" size="mini">不中退</el-tag> <el-tag v-if="scope.row.businessTypeId" size="mini">临场</el-tag><router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}"><span v-if="scope.row.categoryId==3||scope.row.categoryId==4" style="color:#e62121;">【{{scope.row.threadTypeId | threadType2CH}}】</span>{{scope.row.title}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="专家"
        min-width="140">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.userId}}">{{scope.row.name}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="threadId"
        label="文章ID"
        width="150">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.threadId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="发布时间"
        width="160">
        <template slot-scope="scope">
          {{scope.row.createTime}}
        </template>
      </el-table-column>
      <el-table-column
        prop="price"
        label="价格"
        width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.price > 0">{{scope.row.price}}</span>
          <span v-else class="text-red">免费</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="buyCount"
        label="购买数"
        width="120">
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeightColumn(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="plock"
        label="状态"
        width="100">
        <template slot-scope="scope">
          {{scope.row.plock | articleStatus2CH}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getThreadList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { CommonApi, MatchDetail } from '../../../util/api'
import { queryMatchDetailbyId } from '../../../util/commonQuery'
export default {
  name: 'MatchDetail',
  data () {
    return {
      fromRouter: null,
      currentRouter: null,
      lottery2CH: {},
      loading: false,
      matchInfo: '',
      expertStat: '',
      threadList: [],
      pageIndex: 1,
      pageSize: 10,
      pageCount: 1,
      threadLoading: false
    }
  },
  created () {
    this.getLottery()
    this.initRouter(this.$route.params.id)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.fromRouter = from && from.name ? from : null
      vm.currentRouter = to
    })
  },
  methods: {
    initRouter (id) {
      this.getDetail(id).then(res => {
        if (res) {
          this.getThreadList()
        }
      })
    },
    /**
     * @description: 获取彩种信息
     */
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.lottery2CH[item.cId] = item.cName
          })
        }
      })
    },
    getDetail (id) {
      if (this.loading) return
      this.loading = true
      return queryMatchDetailbyId(id).then(res => {
        this.matchInfo = res
        this.loading = false
        return Promise.resolve(res)
      }).catch(err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getThreadList (page) {
      if (this.threadLoading) return
      this.threadLoading = true
      this.pageIndex = page || 1
      this.$service(MatchDetail.threadList, {
        urlParams: {
          matchInfoId: this.matchInfo.matchInfoId,
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
    changeWeightColumn (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{1,3}$/,
        inputErrorMessage: '0-999之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        this.$service(MatchDetail.weight, {
          urlParams: {
            threadId: data.threadId,
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            data.weight = value
            this.$message.success('修改成功！')
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
  }
}
</script>

<style lang="scss">
.match-table {
  width: 100%;
  margin: 0 0 20px;
  font-size: 16px;
  th {
    background-color: #fafafa;
    color: #666;
    text-align: left;
  }
  td,th {
    padding: 10px;
    border: 1px solid #ebeef5;
    word-break: break-all;
    vertical-align: middle;
    &.bg-fa {
      background-color: #fafafa;
    }
    &.avatar{
      width: 100px;
      text-align: center;
      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
    .info-vs-team {
      display: inline-block;
      line-height: 60px;
      .team, img {
        display: inline-block;
        vertical-align: middle;
        p{
          line-height: 30px;
        }
      }
    }
  }
}
.match-odds {
  max-width: 600px;
  margin: 20px auto;
  .play-list {
    margin-bottom: 15px;
    font-size: 0;
    .odds-name, .odds-list {
      display: inline-block;
      width: 22%;
      line-height: 74px;
      text-align: center;
      font-size: 16px;
    }
    .odds-list {
      width: 24%;
      margin-left: 2%;
      position: relative;
      box-sizing: border-box;
      border: 1px solid #ddd;
      &.hit {
        background: rgba(233, 33, 33, .4);
        color: #fff;
        &:before {
          position: absolute;
          top: -5px;
          right: 0;
          margin-right: -5px;
          content: '\221a';
          width: 24px;
          height: 24px;
          background: rgb(233, 33, 33);
          border-radius: 100%;
          -webkit-border-radius: 100%;
          text-align: center;
          line-height: 24px;
          font-size: 14px;
          color: #fff;
          font-family: verdana,arial, sans-serif;
          z-index: 1;
        }
      }
    }
    &.two {
      .odds-name {
        width: 30%;
      }
      .odds-list {
        width: 33%;
      }
    }
  }
}
</style>
