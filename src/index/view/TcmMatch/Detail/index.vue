<template>
  <div class="tcm-match-detail" v-loading="loading">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/tcmmatch' }">竞猜赛事列表</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <table class="match-table" v-if="matchInfo && matchInfo.tcmEventId">
      <tr>
        <td class="bg-fa">联赛：</td>
        <td>{{matchInfo.competitionName}}</td>
        <td class="bg-fa">赛事ID：</td>
        <td>{{matchInfo.tcmEventId}}</td>
        <td class="bg-fa">比赛时间：</td>
        <td>{{matchInfo.eventDay + ' ' + matchInfo.eventTime}}</td>
        <td class="bg-fa">比赛对阵：</td>
        <td>{{matchInfo.status===2||matchInfo.status===3?matchInfo.homeName+' '+matchInfo.homeTeamScore+'-'+matchInfo.awayTeamScore+' '+matchInfo.awayName:matchInfo.homeName+' VS '+matchInfo.awayName}}</td>
        <td class="bg-fa">赛事状态：</td>
        <td>{{matchInfo.status | tcmMatchStatus2CH}}</td>
      </tr>
      <tr>
        <td class="bg-fa">总投注用户数：</td>
        <td class="text-red" colspan="2"><b>{{matchInfo.totalUserNum}}</b></td>
        <td class="bg-fa">总投注下单数：</td>
        <td class="text-red" colspan="2"><b>{{matchInfo.totalNum}}</b></td>
        <td class="bg-fa">总投注金额：</td>
        <td class="text-red"><b>{{matchInfo.totalFlowAmount}}</b></td>
        <td class="bg-fa">总盈亏金额：</td>
        <td class="text-red"><b>{{matchInfo.totalNetprofitorloss}}</b></td>
      </tr>
    </table>
    <el-form :inline="true" :model="filters" size="mini" :disabled="loading" v-show="matchInfo && matchInfo.tcmEventId">
      <el-form-item label="各玩法投注情况">
        <el-select v-model="filters.playType" @change="getDetail($route.params.id)">
          <el-option label="全部" value="">全部</el-option>
          <el-option :label="item.playName" :value="item.playType" v-for="item in tcmTypeList" :key="item.playType"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="总投注用户数">
        <span class="text-red"><b>{{matchInfo.playTypeUserNum}}</b></span>
      </el-form-item>
      <el-form-item label="总投注下单数">
        <span class="text-red"><b>{{matchInfo.playTypeNum}}</b></span>
      </el-form-item>
      <el-form-item label="总投注金额">
        <span class="text-red"><b>{{matchInfo.playTypeFlowAmount}}</b></span>
      </el-form-item>
      <el-form-item label="总盈亏金额">
        <span class="text-red"><b>{{matchInfo.playTypeNetprofitorloss}}</b></span>
      </el-form-item>
    </el-form>
    <div v-loading="loadingType" class="playType">
      <table class="playType-table">
        <colgroup>
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
          <col width="10%">
        </colgroup>
        <thead>
          <tr>
            <th>玩法</th>
            <th>选项</th>
            <th>赔率</th>
            <th>总投注用户数</th>
            <th>总投注下单量</th>
            <th>总投注金额(积分+N币)</th>
            <th>总投注积分</th>
            <th>总投注N币</th>
            <th>红彩盈亏风险</th>
            <th>红彩盈亏金额</th>
          </tr>
        </thead>
        <tbody v-for="(item, i) in matchInfo.marketListVo" :key="i">
          <tr v-for="(_item, index) in item.selectionList" :key="index">
            <td v-if="index===0" :rowspan="item.selectionList.length">{{item.playName}}</td>
            <td>{{_item.selectionName}}</td>
            <td>{{_item.backOdds}}</td>
            <td>{{_item.userNum}}</td>
            <td>{{_item.totalNum}}</td>
            <td>{{_item.totalFlowAmount}}</td>
            <td>{{_item.totalCredit}}</td>
            <td>{{_item.totalNCoin}}</td>
            <td>{{_item.risk || '-'}}</td>
            <td>{{_item.netprofitorloss}}</td>
          </tr>
        </tbody>
        <tbody v-if="(!matchInfo.marketListVo || matchInfo.marketListVo.length === 0) && !loading && !loadingType"><tr><td colspan="10" style="text-align: center;">暂无数据</td></tr></tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { TcmMatchDetail } from '../../../util/api'
export default {
  name: 'TcmMatchDetail',
  data () {
    return {
      loading: false,
      loadingType: false,
      matchInfo: {},
      filters: {
        playType: ''
      },
      tcmTypeList: []
    }
  },
  created () {
    this.getDetail(this.$route.params.id)
  },
  methods: {
    getDetail (id) {
      if (this.loading || this.loadingType) return
      let _data = {tcmEventId: id}
      if (this.filters.playType) {
        this.loadingType = true
        _data['playType'] = this.filters.playType
      } else {
        this.loading = true
      }
      this.$service(TcmMatchDetail.info, {
        method: 'get',
        params: _data
      }).then(res => {
        this.loadingType = false
        this.loading = false
        if (res.code === 200) {
          this.matchInfo = res.data
          if (!_data['playType'] && res.data.marketListVo && res.data.marketListVo.length > 0) {
            res.data.marketListVo.forEach(item => {
              this.tcmTypeList.push({
                playType: item.playType,
                playName: item.playName
              })
            })
          }
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loadingType = false
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.getDetail(to.params.id)
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
.playType-table {
  width: 100%;
  td,th {
    padding: 12px;
    border: 1px solid #ebeef5;
    word-break: break-all;
    vertical-align: middle;
    color: #606266;
  }
  th {
    background-color: #f0f0f0;
    text-align: left;
  }
  tbody tr:nth-child(even) {
    background-color: #fafafa;
  }
}
</style>
