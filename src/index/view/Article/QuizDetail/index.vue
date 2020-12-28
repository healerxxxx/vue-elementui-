<template>
  <div class="quize-detail" v-loading="loading">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: fromRouter.fullPath }" v-if="fromRouter">{{fromRouter.meta.title}}
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentRouter">{{currentRouter.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <div class="thread-header" v-if="articleInfo">
      <el-row :gutter="10">
        <el-col :span="22">
          <el-tag size="small">{{articleInfo.plock | articleStatus2CH}}</el-tag>
          <span v-if="articleInfo.refund" class="text-red"><b>[不中退]</b></span>
          <span class="text-red" v-if="articleInfo.businessTypeId">【临场】</span>
          <h2 class="text-red">{{threadTypeId2CH[articleInfo.threadTypeId] || ''}}</h2>
          <h2 v-if="!titleEditor">{{articleInfo.title}}</h2>
          <el-input v-show="titleEditor" v-model="titleTemp" placeholder="请输入标题" style="min-width:480px;width:auto;">
          </el-input>
          <el-button type="primary" size="mini" v-if="!titleEditor&&buttonAuth"
            @click="titleTemp=articleInfo.title,titleEditor=true">编辑</el-button>
          <el-button type="primary" size="mini" v-if="titleEditor" :loading="updateLoading"
            @click="updateThread('title')">保存</el-button>
          <el-button size="mini" v-if="titleEditor" @click="titleEditor=false">取消</el-button>
        </el-col>
        <el-col :span="2" style="text-align:right;">
          <el-button type="danger" size="mini" v-if="articleInfo.plock !== 6 && !articleInfo.numLottery"
            :loading="offlineLoading" @click="selectOffLineReason">文章下线</el-button>
        </el-col>
      </el-row>
      <table class="article">
        <colgroup>
          <col width="110">
          <col width="">
          <col width="85">
          <col width="">
          <col width="70">
          <col width="">
          <col width="130">
          <col width="">
          <col width="105">
          <col width="">
        </colgroup>
        <tbody>
          <tr>
            <td class="bg-fa">发布时间：</td>
            <td class="text-red">{{articleInfo.createTime}}</td>
            <td class="bg-fa">文章ID：</td>
            <td class="text-red">{{articleInfo.threadId}}</td>
            <td class="bg-fa">价格：</td>
            <td>{{articleInfo.price}}</td>
            <td class="bg-fa">购买数(红彩)：</td>
            <td>{{articleInfo.buyCount}}</td>
            <td class="bg-fa">被收藏数：</td>
            <td>{{articleInfo.favCount}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="thread-expert" v-if="expertStatistic">
      <table class="article">
        <colgroup>
          <col width="100">
          <col>
          <col width="12%">
          <col width="12%">
          <col width="14%">
          <col width="14%">
          <col width="14%">
        </colgroup>
        <tbody>
          <tr>
            <td rowspan="2">
              <router-link :to="{name: 'ExpertDetail', params: {id: expertStatistic.userId}}">
                <img :src="expertStatistic.avatar + '?imageView&thumbnail=100y100&quality=85'" />
              </router-link>
            </td>
            <td rowspan="2">
              <router-link :to="{name: 'ExpertDetail', params: {id: expertStatistic.userId}}">
                <span
                  class="text-red">{{expertStatistic.nickname || expertStatistic.realName}}</span><span>({{expertStatistic.slogan}})</span>
              </router-link>
            </td>
            <td>文章数</td>
            <td>粉丝数</td>
            <td>命中率</td>
            <td>盈利率</td>
            <td>最近连红</td>
          </tr>
          <tr>
            <td>{{expertStatistic.threadCount}}</td>
            <td>{{expertStatistic.follower}}</td>
            <td>{{expertStatistic.totalHitRate | toPercent}}</td>
            <td>{{expertStatistic.totalEarningRate | toPercent}}</td>
            <td>{{expertStatistic.continuityWin}}</td>
          </tr>
        </tbody>
      </table>
      <el-table v-if="categoryId !== 100" :data="expertStatistic.playTacticStatList">
        <el-table-column label="玩法" width="140">
          <template slot-scope="scope">
            {{scope.row.playMetaName}}
          </template>
        </el-table-column>
        <el-table-column label="玩法命中率">
          <el-table-column label="3天">
            <template slot-scope="scope">
              <p>{{scope.row.threeDaysHitRate | toPercent}}</p>
              <p>{{scope.row.threeDaysPOARate}}</p>
            </template>
          </el-table-column>
          <el-table-column label="7天">
            <template slot-scope="scope">
              <p>{{scope.row.sevenDaysHitRate | toPercent}}</p>
              <p>{{scope.row.sevenDaysPOARate}}</p>
            </template>
          </el-table-column>
          <el-table-column label="30天">
            <template slot-scope="scope">
              <p>{{scope.row.thirtyDaysHitRate | toPercent}}</p>
              <p>{{scope.row.thirtyDaysPOARate}}</p>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="玩法盈利率">
          <el-table-column label="3天">
            <template slot-scope="scope">
              {{scope.row.threeDaysEarningRate | toPercent}}
            </template>
          </el-table-column>
          <el-table-column label="7天">
            <template slot-scope="scope">
              {{scope.row.sevenDaysEarningRate | toPercent}}
            </template>
          </el-table-column>
          <el-table-column label="30天">
            <template slot-scope="scope">
              {{scope.row.thirtyDaysEarningRate | toPercent}}
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
    <div class="article-match" v-if="articleInfo && categoryId !== 100">
      <el-row :gutter="10">
        <el-col :span="16">
          <h2>推荐结果：{{lotteryObj[categoryId] || '-'}}</h2>
        </el-col>
        <el-col :span="8" style="text-align:right;">
          <span v-if="articleInfo.hitRateValue">{{articleInfo.hitRateValue}}</span>
          <el-tag size="mini" v-if="articleInfo.plock===3 && articleInfo.isRed && categoryId!==3 && categoryId!==4"
            color="#e62121" style="color:#fff">红</el-tag>
        </el-col>
      </el-row>
      <div class="match-detail" v-for="(item, index) in articleInfo.matchVoList" :key="index">
        <el-row :gutter="10">
          <el-col :span="2">
            比赛{{index+1}}
          </el-col>
          <el-col :span="6">
            <span>联赛名称：</span>{{item.leagueName}}
          </el-col>
          <el-col :span="4">
            <span>联赛ID：</span>{{item.leagueId}}
          </el-col>
          <el-col :span="9">
            <span>开赛时间：</span>{{item.matchTime}}
          </el-col>
          <el-col :span="3">
            {{item.matchStatus | matchStatus2CH}}
          </el-col>
        </el-row>
        <el-row :gutter="10" style="margin-top:10px;text-align:center;" v-if="categoryId!==2&&categoryId!==6">
          <el-col :span="7">
            <p class="text-ellipsis" :title="item.homeTeam.teamName">{{item.homeTeam.teamName}}</p>
            <p>{{item.homeTeam.teamCode}}</p>
          </el-col>
          <el-col :span="3">
            <img style="max-width:100%"
              :src="item.homeTeam.teamIcon?item.homeTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85':'https://cms-bucket.ws.126.net/2019/03/20/08b4e64d94a9422dab8e65d949863e94.png?imageView&thumbnail=60y60&quality=85'">
          </el-col>
          <el-col :span="4" style="font-size:18px;">
            {{item.matchStatus===2||item.matchStatus===3 ? item.homeScore + ' - ' + item.guestScore : 'VS'}}
          </el-col>
          <el-col :span="3">
            <img style="max-width:100%"
              :src="item.guestTeam.teamIcon?item.guestTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85':'https://cms-bucket.ws.126.net/2019/03/20/08b4e64d94a9422dab8e65d949863e94.png?imageView&thumbnail=60y60&quality=85'">
          </el-col>
          <el-col :span="7">
            <p class="text-ellipsis" :title="item.guestTeam.teamName">{{item.guestTeam.teamName}}</p>
            <p>{{item.guestTeam.teamCode}}</p>
          </el-col>
        </el-row>
        <el-row :gutter="10" style="margin-top:10px;text-align:center;" v-else>
          <el-col :span="7">
            <p class="text-ellipsis" :title="item.guestTeam.teamName">{{item.guestTeam.teamName}}</p>
            <p>{{item.guestTeam.teamCode}}</p>
          </el-col>
          <el-col :span="3">
            <img style="max-width:100%"
              :src="item.guestTeam.teamIcon?item.guestTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85':'https://cms-bucket.ws.126.net/2019/03/20/08b4e64d94a9422dab8e65d949863e94.png?imageView&thumbnail=60y60&quality=85'">
          </el-col>
          <el-col :span="4" style="font-size:18px;">
            {{item.matchStatus===2||item.matchStatus===3 ? item.guestScore + ' - ' + item.homeScore : 'VS'}}
          </el-col>
          <el-col :span="3">
            <img style="max-width:100%"
              :src="item.homeTeam.teamIcon?item.homeTeam.teamIcon+'?imageView&thumbnail=60y60&quality=85':'https://cms-bucket.ws.126.net/2019/03/20/08b4e64d94a9422dab8e65d949863e94.png?imageView&thumbnail=60y60&quality=85'">
          </el-col>
          <el-col :span="7">
            <p class="text-ellipsis" :title="item.homeTeam.teamName">{{item.homeTeam.teamName}}</p>
            <p>{{item.homeTeam.teamCode}}</p>
          </el-col>
        </el-row>
        <div class="play-list" v-for="(_item, _index) in item.playVoList" :key="_index"
          :class="{'two':_item.itemVoList.length==2}">
          <div class="odds-name">{{_item.playName}}({{_item.concede}})</div>
          <div class="odds-list" :class="{'recommend':__item.isRecommend,'result':__item.isMatchResult}"
            v-for="(__item, __index) in _item.itemVoList" :key="__index">
            {{__item.playItemName}}({{__item.odds && __item.odds !== 0 ? __item.odds : '-'}})<span
              v-if="__item.isMRecommend === 1">(主推)</span>
          </div>
          <el-tag size="mini" style="position: absolute;right: 0;top: 0;color:#fff;" v-for="resItem in _item.itemVoList"
            v-show="resItem.isMatchResult==1" :key="resItem.playItemId"
            :color="resItem.isMatchResult===resItem.isRecommend?'#e62121':'#000'">
            {{resItem.isMatchResult===resItem.isRecommend?'中':'未中'}}
          </el-tag>
          <el-checkbox v-if="categoryId === 3 && item.isOptionalNine === 1" :value="true" :disabled="true">同时选择为任九方案
          </el-checkbox>
        </div>
      </div>
    </div>
    <div class="article-num-lottery" v-if="categoryId === 100">
      <img :src="`${numLottery.icon}?imageView&thumbnail=134y144&quality=85`">
      <div class="info">
        <div class="middle">
          <p class="name">[{{numLottery.numLotteryName}}]{{numLottery.degree}}</p>
          <p v-if="numLottery.drawLottery === 0">开奖时间：{{numLottery.prizeTime}}</p>
          <p v-if="numLottery.poolMoney !==  '0'">奖池：¥{{numLottery.poolMoney}}</p>
          <p v-if="numLottery.drawLottery !== 0">开奖结果：
            <span class="num-lottery-red-ball" v-show="numLottery.red" v-for="(item,index) in numLottery.red.split(',')"
              :key="index">{{item}}</span>
            <span class="num-lottery-blue-ball" v-show="numLottery.blue"
              v-for="(item,index) in numLottery.blue.split(',')" :key="index">{{item}}</span></p>
          <p v-if="numLottery.drawLottery !== 0">已开奖</p>
        </div>
      </div>
    </div>
    <div class="article-content" v-if="articleInfo">
      <h2>推荐理由：</h2>
      <div class="content-html" v-show="!contentEditor" v-html="articleInfo.content"></div>
      <Editor ref="editorContent" :wordLimitString="'发文字数不少于'+ contentWordCount +'字；'" v-show="contentEditor"
        v-model="contentTemp" :height="400">
      </Editor>
      <div class="article-button">
        <el-button type="primary" size="small" v-if="!contentEditor&&buttonAuth"
          @click="contentTemp=articleInfo.content,contentEditor=true">编辑</el-button>
        <el-button type="primary" size="small" v-if="contentEditor" :loading="updateLoading"
          @click="updateThread('content')">保存</el-button>
        <el-button size="small" v-if="contentEditor" @click="contentEditor=false">取消</el-button>
      </div>
    </div>
    <div class="article-content" v-if="articleInfo && articleInfo.buyReason">
      <h2>购买理由：</h2>
      <div class="content-html" v-show="!reasonEditor" v-html="articleInfo.buyReason"></div>
      <Editor ref="editorReason" wordLimitString="为空或不少于100字；" v-show="reasonEditor" v-model="reasonTemp">
      </Editor>
      <div class="article-button">
        <el-button type="primary" size="small" v-if="!reasonEditor&&buttonAuth"
          @click="reasonTemp=articleInfo.buyReason,reasonEditor=true">编辑</el-button>
        <el-button type="danger" size="small" v-if="!reasonEditor&&buttonAuth" @click="contentDel('reason')">删除
        </el-button>
        <el-button type="primary" size="small" v-if="reasonEditor" :loading="updateLoading"
          @click="updateThread('reason')">保存</el-button>
        <el-button size="small" v-if="reasonEditor" @click="reasonEditor=false">取消</el-button>
      </div>
    </div>
    <div class="article-content"
      v-if="articleInfo&&articleInfo.reviewStatus===1&&articleInfo.planReview && categoryId !== 100">
      <h2>复盘内容：</h2>
      <div class="content-html" v-show="!reviewEditor" v-html="articleInfo.planReview"></div>
      <Editor ref="editorReview" wordLimitString="复盘内容不少于163字；" v-show="reviewEditor" v-model="reviewTemp"
        :height="250">
      </Editor>
      <div class="article-button">
        <el-button type="primary" size="small" v-if="!reviewEditor&&buttonAuth"
          @click="reviewTemp=articleInfo.planReview,reviewEditor=true">编辑</el-button>
        <el-button type="danger" size="small" v-if="!reviewEditor&&buttonAuth" @click="contentDel('review')">删除
        </el-button>
        <el-button type="primary" size="small" v-if="reviewEditor" :loading="updateLoading"
          @click="updateThread('review')">保存</el-button>
        <el-button size="small" v-if="reviewEditor" @click="reviewEditor=false">取消</el-button>
      </div>
    </div>
    <el-dialog :close-on-click-modal="false" title="请选择下线该文章的理由" :visible.sync="offLineDialogVisible" width="400px">
      <el-select @change="selectReasonChange" style="width: 100%" v-model="offLineReasonType" placeholder="请选择文章下线理由">
        <el-option v-for="item in offLineReasonList" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="offLineDialogVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" size="mini" @click="offlineThread">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Editor from '../../../component/Editor'
import { QuizDetail, CommonApi } from '../../../util/api'
import { queryQuizDetailbyId } from '../../../util/commonQuery'
import { removeScriptAndEvent, arraySome } from '../../../util/tool'
export default {
  name: 'ArticleQuizDetail',
  data () {
    return {
      loading: false,
      fromRouter: null,
      currentRouter: null,
      updateLoading: false,
      offlineLoading: false,
      lotteryObj: {},
      threadTypeId2CH: {
        3: '【胜负彩】',
        4: '【任九】',
        5: '【胜负彩&任九】'
      },
      articleInfo: null,
      titleTemp: '',
      titleEditor: false,
      contentTemp: '',
      contentEditor: false,
      reasonTemp: '',
      reasonEditor: false,
      reviewTemp: '',
      reviewEditor: false,
      offLineDialogVisible: false,
      offLineReasonList: [
        {
          value: 1,
          label: '方案质量不合格'
        },
        {
          value: 2,
          label: '比赛延期'
        },
        {
          value: 3,
          label: '比赛取消'
        },
        {
          value: 4,
          label: '竞彩官方停售'
        }
      ],
      offLineReasonType: null,
      offLineReason: null
    }
  },
  computed: {
    categoryId () {
      return (this.articleInfo && this.articleInfo.categoryId) || null
    },
    numLottery () {
      return (this.articleInfo && this.articleInfo.numLottery) || null
    },
    expertStatistic () {
      return (this.articleInfo && this.articleInfo.expertStatistic) || null
    },
    contentWordCount () {
      return this.categoryId !== 3 && this.categoryId !== 4 ? ((this.articleInfo.matchVoList && this.articleInfo.matchVoList.length) || 1) * 300 : 800
    },
    buttonAuth () {
      return arraySome([33, 34, 35, 36], this.$store.state.userInfo.roleList)
    }
  },
  created () {
    this.getLottery()
    this.getDetail(this.$route.params.id)
  },
  components: {
    Editor
  },
  methods: {
    selectOffLineReason () {
      this.offLineReason = null
      this.offLineReasonType = null
      this.offLineDialogVisible = true
    },
    selectReasonChange (value) {
      this.offLineReason = this.offLineReasonList[value - 1].label
    },
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.lotteryObj[item.cId] = item.cName
          })
        }
      })
    },
    getDetail (id) {
      if (this.loading) return
      this.loading = true
      queryQuizDetailbyId(id).then(res => {
        this.articleInfo = res
        this.articleInfo.content = removeScriptAndEvent(this.articleInfo.content)
        if (this.articleInfo.buyReason) {
          this.articleInfo.buyReason = removeScriptAndEvent(this.articleInfo.buyReason)
        }
        if (this.articleInfo.planReview) {
          this.articleInfo.planReview = removeScriptAndEvent(this.articleInfo.planReview)
        }
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    updateThread (type) {
      let _data = null
      if (type === 'title') {
        if (!this.titleTemp) return this.$message.error('方案标题不允许为空')
        _data = { title: this.titleTemp }
      }
      if (type === 'content') {
        let wordCount = this.$refs.editorContent.wordCount
        if (wordCount === 0) return this.$message.error('推荐理由不允许为空')
        if (wordCount < this.contentWordCount) {
          return this.$message.error('推荐理由不少于' + this.contentWordCount + '字')
        }
        _data = { content: this.contentTemp }
      }
      if (type === 'reason') {
        let wordCount = this.$refs.editorReason.wordCount
        if (wordCount > 0 && wordCount < 100) {
          return this.$message.error('购买理由非空时，不少于100字')
        }
        _data = { buyReason: this.reasonTemp }
      }
      if (type === 'review') {
        let wordCount = this.$refs.editorReview.wordCount
        if (wordCount < 163) {
          return this.$message.error('复盘内容不少于163字')
        }
        _data = { planReview: this.reviewTemp }
      }
      if (this.updateLoading || !_data) return
      this.updateLoading = true
      let url = type === 'review' ? QuizDetail.reviewUpdate : QuizDetail.update
      if (this.categoryId === 100) {
        url = QuizDetail.numLotteryUpdate
      }
      this.$service(url, {
        method: 'post',
        urlParams: {
          threadId: this.articleInfo.threadId
        },
        data: _data
      }).then(res => {
        this.updateLoading = false
        if (res.code === 200) {
          if (type === 'title') {
            this.articleInfo.title = this.titleTemp
            this.titleEditor = false
          }
          if (type === 'content') {
            this.articleInfo.content = this.contentTemp
            this.contentEditor = false
          }
          if (type === 'reason') {
            this.articleInfo.buyReason = this.reasonTemp
            this.reasonEditor = false
          }
          if (type === 'review') {
            this.articleInfo.planReview = this.reviewTemp
            this.reviewEditor = false
          }
          this.$message.success('更新成功')
        } else {
          this.$message.error(res.message)
        }
      }, err => {
        this.updateLoading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    offlineThread () {
      if (this.offlineLoading) return
      if (!this.offLineReasonType) return this.$message.error('请选择下线该文章的理由！')
      this.offLineDialogVisible = false
      this.$confirm(`此文章属于${this.offLineReason}原因下线，请确认是否操作？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.offlineLoading = true
        this.$service(QuizDetail.offline, {
          urlParams: {
            threadId: this.articleInfo.threadId
          },
          params: {
            deletedType: this.offLineReasonType
          }
        }).then(res => {
          this.offlineLoading = false
          if (res.code === 200) {
            this.articleInfo.plock = 6
            this.$message.success('下线成功')
          } else {
            this.$message.error(res.message)
          }
        }, err => {
          this.offlineLoading = false
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    contentDel (type) {
      if (this.updateLoading) return
      this.$confirm('确认删除' + (type === 'reason' ? '购买理由' : '复盘内容') + '？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.updateLoading = true
        let url = type === 'reason' ? QuizDetail.reasonDel : QuizDetail.reviewDel
        if (this.categoryId === 100) {
          url = QuizDetail.delBuyReason
        }
        this.$service(url, {
          method: 'post',
          urlParams: {
            threadId: this.articleInfo.threadId
          }
        }).then(res => {
          this.updateLoading = false
          if (res.code === 200) {
            if (type === 'reason') this.articleInfo.buyReason = ''
            if (type === 'review') this.articleInfo.planReview = ''
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.message)
          }
        }, err => {
          this.updateLoading = false
          this.$message.error(JSON.stringify(err))
        })
      })
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.getDetail(to.params.id)
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
.quize-detail {
  .thread-header {
    h2 {
      font-size: 20px;
      display: inline-block;
    }
  }
  table.article {
    width: 100%;
    margin: 20px 0;
    font-size: 16px;
    td {
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
  }
  .article-match {
    margin: 20px auto 0;
    max-width: 680px;
    font-size: 16px;
    h2 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .match-detail {
      margin-bottom: 20px;
      span {
        color: #666;
      }
      .play-list {
        margin-top: 15px;
        font-size: 0;
        position: relative;
        .odds-name,
        .odds-list {
          display: inline-block;
          width: 25%;
          line-height: 48px;
          text-align: center;
          font-size: 16px;
        }
        .odds-list {
          position: relative;
          box-sizing: border-box;
          border: 1px solid #ddd;
          &.recommend {
            background: #d5d5d5;
          }
          &.result {
            border-color: #e62121;
            color: #e62121;
          }
        }
        &.two {
          .odds-name,
          .odds-list {
            width: 33.3333%;
          }
        }
      }
    }
  }
  .article-num-lottery {
    margin: 20px auto 0;
    max-width: 680px;
    font-size: 16px;
    img {
      display: inline-block;
      vertical-align: middle;
      width: 154px;
      height: 164px;
      border-radius: 100%;
      margin-right: 40px;
    }
    .info {
      display: inline-block;
      vertical-align: middle;
      &:before {
        display: inline-block;
        vertical-align: middle;
        content: "";
        width: 0;
        height: 100%;
      }
      .middle {
        display: inline-block;
        vertical-align: middle;
      }
      p {
        line-height: 40px;
        font-size: 18px;
        color: #333;
        &.name {
          line-height: 44px;
          font-size: 22px;
          color: #333;
          padding-bottom: 14px;
          font-weight: bold;
        }
      }
    }
  }
  .article-content {
    margin: 20px auto 0;
    max-width: 980px;
    h2 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .content-html {
      margin-top: 10px;
      font-size: 16px;
      div,
      p {
        margin: 15px 0;
        word-wrap: break-word;
        word-break: break-word;
      }
      img {
        max-width: 100%;
      }
    }
    .article-button {
      text-align: center;
      margin: 20px 0 0;
    }
  }
}
</style>
