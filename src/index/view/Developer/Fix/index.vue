<template>
  <div class="developer-fix">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" size="mini">
      <el-form-item label="修复类型">
        <el-select v-model="modeIndex">
          <el-option label="请选择" value="" />
          <el-option
            v-for="(value, key) in modeList"
            :key="key"
            :label="value"
            :value="key" />
        </el-select>
      </el-form-item>
    </el-form>
    <el-row :gutter="10">
      <el-col :span="5"></el-col>
      <el-col :span="10"></el-col>
    </el-row>
    <!-- 赛事修复 -->
    <table class="developer-fix--table" v-if="modeIndex === '1'">
      <tr>
        <td>新数据商文章直播:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchLive">修复</el-button></td>
      </tr>
      <tr>
        <td>赛事方案结算修复:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchThread">修复</el-button></td>
      </tr>
      <tr>
        <td>赛事状态和比分修复:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchStatusScore">修复</el-button></td>
      </tr>
      <tr>
        <td>赛事缓存清理:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchCache">修复</el-button></td>
      </tr>
      <tr>
        <td>修改球队竞彩名称:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchTeam">修复</el-button></td>
      </tr>
      <tr>
        <td>修改联赛竞彩名称:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchLeague">修复</el-button></td>
      </tr>
      <tr>
        <td>雷速实时比分修复接口:</td>
        <td><el-button type="primary" size="mini" @click="fixMatchNano">修复</el-button></td>
      </tr>
    </table>
    <!-- 专家修复 -->
    <table class="developer-fix--table" v-if="modeIndex === '2'">
      <tr>
        <td>专家可投注方案数清除缓存:</td>
        <td><el-button type="primary" size="mini" @click="fixExpertCacheById">修复</el-button></td>
      </tr>
      <tr>
        <td>自动修复所有专家可投注方案数</td>
        <td><el-button type="primary" size="mini" @click="fixExpertAutoFixAll">修复</el-button></td>
      </tr>
      <tr>
        <td>自动修复所有专家连红数</td>
        <td><el-button type="primary" size="mini" @click="fixExpertWinFixAll">修复</el-button></td>
      </tr>
      <tr>
        <td>修复指定专家连红数</td>
        <td><el-button type="primary" size="mini" @click="fixExpertWinById">修复</el-button></td>
      </tr>
      <tr>
        <td>获取专家连红计算结果</td>
        <td><el-button type="primary" size="mini" @click="fixExpertWinGetValueById">修复</el-button></td>
      </tr>
      <tr>
        <td>手动修复专家连红</td>
        <td><el-button type="primary" size="mini" @click="fixExpertWinManualFix">修复</el-button></td>
      </tr>
      <tr>
        <td>清除周人气榜缓存</td>
        <td><el-button type="primary" size="mini" @click="fixExpertPopularityRank">修复</el-button></td>
      </tr>
    </table>
    <!-- 用户修复 -->
    <table class="developer-fix--table" v-if="modeIndex === '3'">
      <tr>
        <td>清除用户缓存:</td>
        <td><el-button type="primary" size="mini" @click="fixUserCacheById">修复</el-button></td>
      </tr>
      <tr>
        <td>停用用户VIP服务:</td>
        <td><el-button type="primary" size="mini" @click="userVipStop">修复</el-button></td>
      </tr>
    </table>
    <!-- 数据服务修复 -->
    <table class="developer-fix--table" v-if="modeIndex === '4'">
      <tr>
        <td>初始化盘路榜:</td>
        <td><el-button type="primary" size="mini" @click="fixServiceDishRoadInit">修复</el-button></td>
      </tr>
      <tr>
        <td>预测单个赛事红彩指数:</td>
        <td><el-button type="primary" size="mini" @click="fixEloPredictOneMatch">修复</el-button></td>
      </tr>
      <tr>
        <td>红彩指数删除赛事:</td>
        <td><el-button type="primary" size="mini" @click="fixEloDelMatch">修复</el-button></td>
      </tr>
      <tr>
        <td>红彩指数修复结算:</td>
        <td><el-button type="primary" size="mini" @click="fixEloSettlement">修复</el-button></td>
      </tr>
      <tr>
        <td>红彩指数清除列表缓存:</td>
        <td><el-button type="primary" size="mini" @click="fixEloListCache">修复</el-button></td>
      </tr>
      <tr>
        <td>红彩指数清除赛事缓存:</td>
        <td><el-button type="primary" size="mini" @click="fixEloCacheById">修复</el-button></td>
      </tr>
      <tr>
        <td>清空联赛等级分排行:</td>
        <td><el-button type="primary" size="mini" @click="fixServiceDelLeagueRating">修复</el-button></td>
      </tr>
      <tr>
        <td>清空球队等级分历史:</td>
        <td><el-button type="primary" size="mini" @click="fixServiceDelTeamScore">修复</el-button></td>
      </tr>
      <tr>
        <td>清除所有联赛球队等级分缓存:</td>
        <td><el-button type="primary" size="mini" @click="fixServiceAllTeamCache">修复</el-button></td>
      </tr>
      <tr>
        <td>红彩指数更新赛程等级分:</td>
        <td><el-button type="primary" size="mini" @click="fixEloFetchSchedule">修复</el-button></td>
      </tr>
      <tr>
        <td>发送更新系数的mq消息:</td>
        <td><el-button type="primary" size="mini" @click="fixEloSendDrawMessage">修复</el-button></td>
      </tr>
      <tr>
        <td>红彩指数清空联赛统计和头部信息:</td>
        <td><el-button type="primary" size="mini" @click="fixEloDelStatistic">修复</el-button></td>
      </tr>
    </table>
    <!-- 公共服务修复 -->
    <table class="developer-fix--table" v-if="modeIndex === '5'">
      <tr>
        <td>通过KEY清除缓存:</td>
        <td><el-button type="primary" size="mini" @click="fixCommonByKey">修复</el-button></td>
      </tr>
      <tr>
        <td>通过URL查看数据商接口:</td>
        <td><el-button type="primary" size="mini" @click="getNanoData">查看</el-button></td>
      </tr>
    </table>
    <!-- 赛事投票修复 -->
    <table class="developer-fix--table" v-if="modeIndex === '6'">
      <tr>
        <td>初始化赛事投票:</td>
        <td><el-button type="primary" size="mini" @click="voteMatchIdButton('init')">修复</el-button></td>
      </tr>
      <tr>
        <td>重新结算赛事投票:</td>
        <td><el-button type="primary" size="mini" @click="voteMatchInfoButton('re')">修复</el-button></td>
      </tr>
      <tr>
        <td>取消赛事投票:</td>
        <td><el-button type="primary" size="mini" @click="voteMatchIdButton('cancle')">修复</el-button></td>
      </tr>
      <tr>
        <td>清除赛事投票缓存:</td>
        <td><el-button type="primary" size="mini" @click="voteClearCacheButton">修复</el-button></td>
      </tr>
      <tr>
        <td>开启赛事投票指定时机:</td>
        <td><el-button type="primary" size="mini" @click="voteMatchInfoButton('half')">修复</el-button></td>
      </tr>
      <tr>
        <td>回滚赛事投票结算:</td>
        <td><el-button type="primary" size="mini" @click="voteMatchInfoButton('rollback')">修复</el-button></td>
      </tr>
    </table>
    <!-- 修复 赛事的状态和比分 begin -->
    <el-dialog
      title="赛事状态和比分修复"
      :visible.sync="matchStatusScore.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="matchStatusScore.form" :disabled="matchStatusScore.loading" label-width="80px" size="small" ref="matchStatusScoreForm">
        <el-form-item
          label="赛事ID"
          prop="matchInfoId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '赛事ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="matchStatusScore.form.matchInfoId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="赛事状态"
          prop="matchStatus"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="matchStatusScore.form.matchStatus">
            <el-option v-for="item in matchStatusList" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="主队比分"
          prop="homeScore"
          :rules="{pattern: /^\d+$/, message: '比分必须为整数', trigger: ['blur', 'change']}">
          <el-input v-model="matchStatusScore.form.homeScore" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="客队比分"
          prop="guestScore"
          :rules="{pattern: /^\d+$/, message: '比分必须为整数', trigger: ['blur', 'change']}">
          <el-input v-model="matchStatusScore.form.guestScore" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <p>注：赛事为结束状态时候，主队比分和客队比分，如果不传值则默认走数据库比分</p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="matchStatusScore.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="matchStatusScore.loading" @click="fixMatchStatusScoreSubmit('matchStatusScoreForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 修复 赛事的状态和比分 end -->
    <!-- 修改球队竞彩名称 begin -->
    <el-dialog
      title="修改球队竞彩名称"
      :visible.sync="matchTeam.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="matchTeam.form" :disabled="matchTeam.loading" label-width="80px" size="small" ref="matchTeamForm">
        <el-form-item
          label="球队ID"
          prop="teamId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '球队ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="matchTeam.form.teamId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="球队竞彩名称"
          prop="jcName"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input v-model="matchTeam.form.jcName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="球队简称"
          prop="shortName">
          <el-input v-model="matchTeam.form.shortName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="球队全程"
          prop="teamName">
          <el-input v-model="matchTeam.form.teamName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="球队英文名称"
          prop="teamEnName">
          <el-input v-model="matchTeam.form.teamEnName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="matchTeam.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="matchTeam.loading" @click="fixMatchTeamSubmit('matchTeamForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 修改球队竞彩名称 end -->
    <!-- 修改联赛竞彩名称 begin -->
    <el-dialog
      title="修改联赛竞彩名称"
      :visible.sync="matchLeague.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="matchLeague.form" :disabled="matchLeague.loading" label-width="80px" size="small" ref="matchLeagueForm">
        <el-form-item
          label="联赛ID"
          prop="leagueMatchId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '联赛ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="matchLeague.form.leagueMatchId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="联赛竞彩名称"
          prop="jcName"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input v-model="matchLeague.form.jcName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="联赛简称"
          prop="shortName">
          <el-input v-model="matchLeague.form.shortName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="matchLeague.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="matchLeague.loading" @click="fixMatchLeagueSubmit('matchLeagueForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 修改联赛竞彩名称 end -->
    <!-- 手动修复专家连红 begin -->
    <el-dialog
      title="手动修复专家连红"
      :visible.sync="expertWinManual.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="expertWinManual.form" :disabled="expertWinManual.loading" label-width="100px" size="small" ref="expertWinManualFixForm">
        <el-form-item
          label="专家ID"
          prop="expertId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '专家ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="expertWinManual.form.expertId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="连红数"
          prop="continuityWin"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '连红数必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="expertWinManual.form.continuityWin" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="最大连红数"
          prop="maxContinuityWin"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '最大连红数必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="expertWinManual.form.maxContinuityWin" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="expertWinManual.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="expertWinManual.loading" @click="fixExpertWinManualFixSubmit('expertWinManualFixForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 手动修复专家连红 end -->
    <!-- 初始化盘路榜 begin -->
    <el-dialog
      title="初始化盘路榜"
      :visible.sync="serviceDishRoadInit.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="serviceDishRoadInit.form" :disabled="serviceDishRoadInit.loading" label-width="80px" size="small" ref="serviceDishRoadInitForm">
        <el-form-item
          label="日期"
          prop="startTime"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-date-picker
            v-model="serviceDishRoadInit.form.startTime"
            type="date"
            style="width:150px"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="serviceDishRoadInit.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="serviceDishRoadInit.loading" @click="fixServiceDishRoadInitSubmit('serviceDishRoadInitForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 初始化盘路榜 end -->
    <!-- 清空球队等级分历史 begin -->
    <el-dialog
      title="清空球队等级分历史"
      :visible.sync="serviceDelTeamScore.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="serviceDelTeamScore.form" :disabled="serviceDelTeamScore.loading" label-width="80px" size="small" ref="serviceDelTeamScoreForm">
        <el-form-item
          label="联赛ID"
          prop="leagueMatchId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: 'ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="serviceDelTeamScore.form.leagueMatchId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="球队"
          prop="teamId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: 'ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="serviceDelTeamScore.form.teamId" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="serviceDelTeamScore.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="serviceDelTeamScore.loading" @click="fixServiceDelTeamScoreSubmit('serviceDelTeamScoreForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 清空球队等级分历史 end -->
    <!-- 发送更新系数的mq消息 begin -->
    <el-dialog
      title="发送更新系数的mq消息"
      :visible.sync="eloSendDrawMessage.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="eloSendDrawMessage.form" :disabled="eloSendDrawMessage.loading" label-width="80px" size="small" ref="eloSendDrawMessageForm">
        <el-form-item
          label="competitionCode"
          prop="competitionCode"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input placeholder="competitionCode" v-model="eloSendDrawMessage.form.competitionCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="season"
          prop="season"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input v-model="eloSendDrawMessage.form.season" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="round"
          prop="round"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input v-model="eloSendDrawMessage.form.round" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="eloSendDrawMessage.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="eloSendDrawMessage.loading" @click="fixEloSendDrawMessageSubmit('eloSendDrawMessageForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 发送更新系数的mq消息 end -->
    <!-- 投票信息相关 begin -->
    <el-dialog
      :title="voteMatchInfo.type === 're' ? '重新结算赛事投票' : voteMatchInfo.type === 'half' ? '开启赛事投票指定时机' : voteMatchInfo.type === 'rollback' ? '回滚赛事投票结算' : ''"
      :visible.sync="voteMatchInfo.visible"
      width="520px"
      :close-on-click-modal="false"
      center>
      <el-form :model="voteMatchInfo.form" :disabled="voteMatchInfo.loading" label-width="80px" size="small" ref="voteMatchInfoForm">
        <el-form-item
          label="赛事ID"
          prop="matchId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '赛事ID必须为整数', trigger: ['blur', 'change']}]">
          <el-input v-model="voteMatchInfo.form.matchId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="投票时机"
          prop="appearTime"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="voteMatchInfo.form.appearTime">
            <el-option value="1" label="上半场" />
            <el-option value="2" label="下半场" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="voteMatchInfo.type === 're'"
          label="选项结果"
          prop="optionId"
          :rules="{required: voteMatchInfo.type === 're', message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="voteMatchInfo.form.optionId">
            <el-option value="A" label="A" />
            <el-option value="B" label="B" />
            <el-option value="B" label="C" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="voteMatchInfo.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="voteMatchInfo.loading" @click="voteMatchInfoSubmit('voteMatchInfoForm')">提交</el-button>
      </div>
    </el-dialog>
    <!-- 投票信息相关 end -->
  </div>
</template>

<script>
import { DeveloperFix } from '../../../util/api'
import baseType from '../../../util/base'
export default {
  name: 'DeveloperFix',
  data () {
    return {
      modeIndex: '1',
      modeList: {
        1: '赛事修复',
        2: '专家修复',
        3: '用户修复',
        4: '数据服务修复',
        5: '公共服务',
        6: '赛事投票'
      },
      matchStatusList: baseType.matchStatus,
      matchStatusScore: {
        visible: false,
        form: {},
        loading: false
      },
      matchTeam: {
        visible: false,
        form: {},
        loading: false
      },
      matchLeague: {
        visible: false,
        form: {},
        loading: false
      },
      expertWinManual: {
        visible: false,
        form: {},
        loading: false
      },
      serviceDishRoadInit: {
        visible: false,
        form: {},
        loading: false
      },
      serviceDelTeamScore: {
        visible: false,
        form: {},
        loading: false
      },
      eloSendDrawMessage: {
        visible: false,
        form: {},
        loading: false
      },
      voteMatchInfo: {
        visible: false,
        form: {},
        loading: false,
        type: null
      }
    }
  },
  methods: {
    // 新数据商文章直播修复
    fixMatchLive () {
      this.$prompt('输入赛事ID', '新数据商文章直播修复', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.matchLive, {
          params: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('新数据商文章直播修复成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 赛事方案结算修复
    fixMatchThread () {
      this.$prompt('输入赛事ID', '赛事方案结算修复', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.matchThread, {
          urlParams: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('赛事方案结算修复成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 赛事的状态和比分 pop
    fixMatchStatusScore () {
      this.matchStatusScore.visible = true
      this.matchStatusScore.form = {}
      this.$nextTick(() => {
        this.$refs.matchStatusScoreForm.clearValidate()
      })
    },
    // 赛事的状态和比分 submit
    fixMatchStatusScoreSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.matchStatusScore.form
          const _data = {
            matchInfoId: data.matchInfoId,
            matchStatus: data.matchStatus,
            homeScore: data.homeScore || 0,
            guestScore: data.guestScore || 0
          }
          if (this.matchStatusScore.loading) return
          this.matchStatusScore.loading = true
          this.$service(DeveloperFix.matchStatusScore, {
            method: 'post',
            urlParams: _data
          }).then(res => {
            if (res.code === 200) {
              this.matchStatusScore.visible = false
              this.$message.success('赛事的状态和比分修复成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.matchStatusScore.loading = false
          }, err => {
            this.matchStatusScore.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 赛事缓存清理
    fixMatchCache () {
      this.$prompt('输入赛事ID', '赛事缓存清理', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.matchCache, {
          params: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('缓存清理成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 修改球队竞彩名称 pop
    fixMatchTeam () {
      this.matchTeam.visible = true
      this.matchTeam.form = {}
      this.$nextTick(() => {
        this.$refs.matchTeamForm.clearValidate()
      })
    },
    // 修改球队竞彩名称 submit
    fixMatchTeamSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.matchTeam.form
          const _data = {
            jcName: data.jcName
          }
          data.shortName && (_data['shortName'] = data.shortName)
          data.teamName && (_data['teamName'] = data.teamName)
          data.teamEnName && (_data['teamEnName'] = data.teamEnName)
          if (this.matchTeam.loading) return
          this.matchTeam.loading = true
          this.$service(DeveloperFix.matchTeam, {
            method: 'post',
            urlParams: {
              teamId: data.teamId
            },
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.matchTeam.visible = false
              this.$message.success('修改球队竞彩名称成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.matchTeam.loading = false
          }, err => {
            this.matchTeam.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 修改联赛竞彩名称 pop
    fixMatchLeague () {
      this.matchLeague.visible = true
      this.matchLeague.form = {}
      this.$nextTick(() => {
        this.$refs.matchLeagueForm.clearValidate()
      })
    },
    // 修改联赛竞彩名称 submit
    fixMatchLeagueSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.matchLeague.form
          const _data = {
            jcName: data.jcName
          }
          data.shortName && (_data['shortName'] = data.shortName)
          if (this.matchLeague.loading) return
          this.matchLeague.loading = true
          this.$service(DeveloperFix.matchLeague, {
            method: 'post',
            urlParams: {
              leagueMatchId: data.leagueMatchId
            },
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.matchLeague.visible = false
              this.$message.success('修改联赛竞彩名称成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.matchLeague.loading = false
          }, err => {
            this.matchLeague.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 通过KEY清除缓存
    fixCommonByKey () {
      this.$prompt('输入Key', '清除缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\S+$/,
        inputErrorMessage: '不为空',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.commonCache, {
          params: {
            key: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('清除缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 查看数据商接口数据
    getNanoData () {
      this.$prompt('输入URL，请先打开浏览器DevTools', '查看数据商接口数据', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\S+$/,
        inputErrorMessage: '不为空',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.getNanoData, {
          method: 'post',
          data: {
            url: value
          }
        }).then(res => {
          if (res.code === 200) {
            console.log(res.data)
            this.$message.success('查看成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 雷速实时比分修复接口
    fixMatchNano () {
      this.$prompt('输入赛事ID', '雷速实时比分修复接口', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.matchNano, {
          params: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('雷速实时比分修复接口成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 专家可投注方案数清除缓存
    fixExpertCacheById () {
      this.$prompt('输入专家ID', '专家可投注方案数清除缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '专家ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.expertCacheById, {
          urlParams: {
            expertId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('专家可投注方案数清除缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    fixExpertAutoFixAll () {
      this.$confirm('确定自动修复所有专家可投注方案数?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(DeveloperFix.expertAutoFixAll).then(res => {
          if (res.code === 200) {
            this.$message.success('自动修复所有专家可投注方案数成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 自动修复所有专家连红数
    fixExpertWinFixAll () {
      this.$confirm('确定自动修复所有专家连红数?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(DeveloperFix.expertWinFixAll).then(res => {
          if (res.code === 200) {
            this.$message.success('自动修复所有专家连红数成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 修复指定专家连红数
    fixExpertWinById () {
      this.$prompt('输入专家ID', '修复指定专家连红数', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '专家ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.expertWinById, {
          params: {
            expertId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('专家连红数修复成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 获取专家连红计算结果
    fixExpertWinGetValueById () {
      this.$prompt('输入专家ID', '修复指定专家连红数', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '专家ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.expertWinGetValueById, {
          params: {
            expertId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message({
              showClose: true,
              message: `连红:${res.data.continuityWinCount}；最大连红:${res.data.maxContinuityWinCount}`,
              type: 'success'
            })
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 手动修复专家连红 pop
    fixExpertWinManualFix () {
      this.expertWinManual.visible = true
      this.expertWinManual.form = {}
      this.$nextTick(() => {
        this.$refs.expertWinManualFixForm.clearValidate()
      })
    },
    // 手动修复专家连红 submit
    fixExpertWinManualFixSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.expertWinManual.form
          const _data = {
            expertId: data.expertId,
            continuityWin: data.continuityWin,
            maxContinuityWin: data.maxContinuityWin
          }
          if (this.expertWinManual.loading) return
          this.expertWinManual.loading = true
          this.$service(DeveloperFix.expertWinManualFix, {
            method: 'post',
            urlParams: {
              expertId: data.expertId
            },
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.expertWinManual.visible = false
              this.$message.success('手动修复专家连红成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.expertWinManual.loading = false
          }, err => {
            this.expertWinManual.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 清除周人气榜缓存
    fixExpertPopularityRank () {
      this.$prompt('彩种ID', '清除周人气榜缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '彩种ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.expertPopularityRank, {
          urlParams: {
            categoryId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('清除周人气榜缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 清除用户缓存
    fixUserCacheById () {
      this.$prompt('用户ID', '清除用户缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '用户ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.userCacheById, {
          urlParams: {
            userId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('清除用户缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 初始化盘路榜 pop
    fixServiceDishRoadInit () {
      this.serviceDishRoadInit.visible = true
      this.serviceDishRoadInit.form = {}
      this.$nextTick(() => {
        this.$refs.serviceDishRoadInitForm.clearValidate()
      })
    },
    // 初始化盘路榜 submit
    fixServiceDishRoadInitSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.serviceDishRoadInit.form
          const _data = {
            startTime: data.startTime
          }
          if (this.serviceDishRoadInit.loading) return
          this.serviceDishRoadInit.loading = true
          this.$service(DeveloperFix.serviceDishRoadInit, {
            params: _data
          }).then(res => {
            if (res.code === 200) {
              this.serviceDishRoadInit.visible = false
              this.$message.success('初始化盘路榜成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.serviceDishRoadInit.loading = false
          }, err => {
            this.serviceDishRoadInit.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 预测单个赛事红彩指数
    fixEloPredictOneMatch () {
      this.$prompt('赛事ID', '预测单个赛事红彩指数', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.eloPredictOneMatch, {
          urlParams: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('预测单个赛事红彩指数成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 红彩指数删除赛事
    fixEloDelMatch () {
      this.$prompt('赛事ID', '红彩指数删除赛事', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.eloDelMatch, {
          urlParams: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('红彩指数删除赛事成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 红彩指数修复结算
    fixEloSettlement () {
      this.$prompt('赛事ID', '红彩指数修复结算', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.eloSettlement, {
          urlParams: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('红彩指数修复结算成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 红彩指数清除列表缓存
    fixEloListCache () {
      this.$confirm('确定清除红彩指数列表缓存?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(DeveloperFix.eloListCache).then(res => {
          if (res.code === 200) {
            this.$message.success('清除红彩指数列表缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 红彩指数清除赛事缓存
    fixEloCacheById () {
      this.$prompt('赛事ID', '红彩指数清除赛事缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.eloCacheById, {
          urlParams: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('红彩指数清除赛事缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 清空联赛等级分排行
    fixServiceDelLeagueRating () {
      this.$prompt('联赛ID', '清空联赛等级分排行', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '联赛ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.serviceDelLeagueRating, {
          urlParams: {
            leagueMatchId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('清空联赛等级分排行成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 清空球队等级分历史 pop
    fixServiceDelTeamScore () {
      this.serviceDelTeamScore.visible = true
      this.serviceDelTeamScore.form = {}
      this.$nextTick(() => {
        this.$refs.serviceDelTeamScoreForm.clearValidate()
      })
    },
    // 清空球队等级分历史 submit
    fixServiceDelTeamScoreSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.serviceDelTeamScore.form
          const _data = {
            leagueMatchId: data.leagueMatchId,
            teamId: data.teamId
          }
          if (this.serviceDelTeamScore.loading) return
          this.serviceDelTeamScore.loading = true
          this.$service(DeveloperFix.serviceDelTeamScore, {
            urlParams: _data
          }).then(res => {
            if (res.code === 200) {
              this.serviceDelTeamScore.visible = false
              this.$message.success('清空球队等级分历史成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.serviceDelTeamScore.loading = false
          }, err => {
            this.serviceDelTeamScore.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 清除所有联赛球队等级分缓存
    fixServiceAllTeamCache () {
      this.$confirm('清除所有联赛球队等级分缓存?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(DeveloperFix.serviceAllTeamCache).then(res => {
          if (res.code === 200) {
            this.$message.success('清除所有联赛球队等级分缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 红彩指数更新赛程等级分
    fixEloFetchSchedule () {
      this.$confirm('红彩指数更新赛程等级分?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(DeveloperFix.eloFetchSchedule).then(res => {
          if (res.code === 200) {
            this.$message.success('红彩指数更新赛程等级分成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    // 发送更新系数的mq消息 pop
    fixEloSendDrawMessage () {
      this.eloSendDrawMessage.visible = true
      this.eloSendDrawMessage.form = {}
      this.$nextTick(() => {
        this.$refs.eloSendDrawMessageForm.clearValidate()
      })
    },
    // 发送更新系数的mq消息 submit
    fixEloSendDrawMessageSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.eloSendDrawMessage.form
          const _data = {
            competitionCode: data.competitionCode,
            season: data.season,
            round: data.round
          }
          if (this.eloSendDrawMessage.loading) return
          this.eloSendDrawMessage.loading = true
          this.$service(DeveloperFix.eloSendDrawMessage, {
            urlParams: _data
          }).then(res => {
            if (res.code === 200) {
              this.eloSendDrawMessage.visible = false
              this.$message.success('发送更新系数的mq消息成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.eloSendDrawMessage.loading = false
          }, err => {
            this.eloSendDrawMessage.loading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    // 红彩指数清空联赛统计和头部信息
    fixEloDelStatistic () {
      this.$confirm('红彩指数清空联赛统计和头部信息?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service(DeveloperFix.eloDelStatistic).then(res => {
          if (res.code === 200) {
            this.$message.success('红彩指数清空联赛统计和头部信息成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    voteMatchIdButton (type) {
      const submit = (title, url) => {
        this.$prompt('赛事ID', title, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^\d+$/,
          inputErrorMessage: '赛事ID必须为数字',
          closeOnClickModal: false
        }).then(({ value }) => {
          this.$service(url, {
            params: {
              matchId: value
            }
          }).then(res => {
            if (res.code === 200) {
              this.$message.success(title + '成功')
            } else {
              this.$message.error(res.message)
            }
          }).catch(err => {
            if (err) {
              this.$message.error(JSON.stringify(err))
            }
          })
        })
      }
      switch (type) {
        case 'init':
          submit('初始化赛事投票', DeveloperFix.voteInit)
          break
        case 'cancle':
          submit('取消赛事投票', DeveloperFix.voteCancel)
          break
        default:
          break
      }
    },
    voteClearCacheButton (type) {
      this.$prompt('投票ID', '清除赛事投票缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '投票ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(DeveloperFix.voteClearCache, {
          params: {
            voteId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('清除赛事投票缓存成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    voteMatchInfoButton (type) {
      this.voteMatchInfo.visible = true
      this.voteMatchInfo.form = {}
      this.voteMatchInfo.type = type
      this.$nextTick(() => {
        this.$refs.voteMatchInfoForm.clearValidate()
      })
    },
    voteMatchInfoSubmit (form) {
      const submit = (url, data, title) => {
        if (this.voteMatchInfo.loading) return
        this.voteMatchInfo.loading = true
        this.$service(url, {
          params: data
        }).then(res => {
          if (res.code === 200) {
            this.voteMatchInfo.visible = false
            this.$message.success(title + '成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
          this.voteMatchInfo.loading = false
        }, err => {
          this.voteMatchInfo.loading = false
          this.$message.error(JSON.stringify(err))
        })
      }
      this.$refs[form].validate(valid => {
        if (valid) {
          const data = this.voteMatchInfo.form
          const _data = {
            matchId: data.matchId,
            appearTime: data.appearTime
          }
          switch (this.voteMatchInfo.type) {
            case 're':
              _data['optionId'] = data.optionId
              submit(DeveloperFix.voteReSettlement, _data, '重新结算赛事投票')
              break
            case 'half':
              submit(DeveloperFix.voteSetHalf, _data, '开启赛事投票指定时机')
              break
            case 'rollback':
              submit(DeveloperFix.voteRollback, _data, '回滚赛事投票结算')
              break
            default:
              break
          }
        }
      })
    },
    userVipStop () {
      this.$prompt(null, '请输入用户ID', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\d+/,
        inputErrorMessage: '用户ID格式不正确'
      }).then(({ value }) => {
        this.$service(DeveloperFix.userVipStop, {
          method: 'post',
          data: {
            userId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('停止VIP服务成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
.developer-fix {
  &--table {
    width: 100%;
    margin-top: 15px;
    border: 1px solid #ebeef5;
    th, td {
      padding: 18px 10px;
      border: 1px solid #ebeef5;
      color: #666;
    }
    tr:nth-child(2n){
      background-color: #f7f7f7;
    }
    tr:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
