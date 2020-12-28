<template>
  <div class="red-rank">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" size="mini">
      <el-form-item label="">
        <el-button type="primary" :loading="loading" size="mini" @click="getStatistics()">生成今日红人榜统计</el-button>
      </el-form-item>
      <el-form-item label="时间范围" v-if="info.startTimeF">
        足球：<span>{{info.startTimeF.replace(/:[0-9]{3}$/, '')}} ~ {{info.endTimeF.replace(/:[0-9]{3}$/, '')}}</span>；
        篮球：<span>{{info.startTimeB.replace(/:[0-9]{3}$/, '')}} ~ {{info.endTimeB.replace(/:[0-9]{3}$/, '')}}</span>
      </el-form-item>
    </el-form>
    <el-table
      v-if="footballList.length > 0"
      :data="footballList"
      stripe>
      <el-table-column label="足球专家">
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          label="专家昵称"
          width="100">
          <template slot-scope="scope">
            {{info.userInfoMap[scope.row.userId].nickname}}
          </template>
        </el-table-column>
        <el-table-column
          prop="userId"
          label="专家ID"
          width="80">
        </el-table-column>
        <el-table-column
          label="成绩">
          <template slot-scope="scope">
            <div
              class="red-rank-statistics"
              @click="chooseBox(scope.row, index)"
              :class="{'current': index === scope.row.checkIndex}"
              v-for="(item, index) in scope.row.hitRateDtoList"
              :key="index">
              <p>{{`近${item.total}中${item.hit}`}}</p>
              <p>{{item.hitRate | toPercent}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="双击复制"
          width="160">
          <template slot-scope="scope">
            <div class="red-rank-statistics copy" @dblclick="copyData($event)" v-if="scope.row.checkIndex || scope.row.checkIndex === 0">
              {{`${scope.row.hitRateDtoList[scope.row.checkIndex].userId},近${scope.row.hitRateDtoList[scope.row.checkIndex].total}中${scope.row.hitRateDtoList[scope.row.checkIndex].hit}`}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <el-table
      style="margin-top: 25px;"
      v-if="basketballList.length > 0"
      :data="basketballList"
      stripe>
      <el-table-column label="篮球专家">
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          label="专家昵称"
          width="100">
          <template slot-scope="scope">
            {{info.userInfoMap[scope.row.userId].nickname}}
          </template>
        </el-table-column>
        <el-table-column
          prop="userId"
          label="专家ID"
          width="80">
        </el-table-column>
        <el-table-column
          label="成绩">
          <template slot-scope="scope">
            <div
              class="red-rank-statistics"
              @click="chooseBox(scope.row, index)"
              :class="{'current': index === scope.row.checkIndex}"
              v-for="(item, index) in scope.row.hitRateDtoList"
              :key="index">
              <p>{{`近${item.total}中${item.hit}`}}</p>
              <p>{{item.hitRate | toPercent}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="快捷复制"
          width="160">
          <template slot-scope="scope">
            <el-tooltip effect="dark" v-if="scope.row.checkIndex || scope.row.checkIndex === 0" content="双击复制" placement="top">
              <div class="red-rank-statistics copy" @dblclick="copyData($event)">
                {{`${scope.row.hitRateDtoList[scope.row.checkIndex].userId},近${scope.row.hitRateDtoList[scope.row.checkIndex].total}中${scope.row.hitRateDtoList[scope.row.checkIndex].hit}`}}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { HeadRedRank } from '../../../util/api'
import { dblClickCopy } from '../../../util/tool'
export default {
  name: 'HeadRedRankStatistics',
  data () {
    return {
      loading: false,
      info: {}
    }
  },
  computed: {
    footballList () {
      return this.info.footballExpertHitRateMap || []
    },
    basketballList () {
      return this.info.basketballExpertHitRateMap || []
    }
  },
  methods: {
    chooseBox (data, index) {
      this.$set(data, 'checkIndex', index)
    },
    copyData (event) {
      dblClickCopy(event.target).then(res => {
        this.$message.success('复制成功')
      }).catch(err => {
        err && this.$message.error(err.message)
      })
    },
    getStatistics () {
      if (this.loading) return
      this.loading = true
      this.$service(HeadRedRank.statistics).then(res => {
        if (res.code === 200) {
          this.info = res.data
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.loading = false
      }).catch(err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    }
  }
}
</script>

<style lang="scss">
.red-rank-statistics {
  width: 80px;
  padding: 6px 0;
  line-height: 1.4;
  display: inline-block;
  margin: 5px 10px 5px 0;
  border: 1px solid #cccc;
  text-align: center;
  border-radius: 2px;
  cursor: pointer;
  &.copy {
    margin: 5px 0;
    width: 135px;
    &:hover {
      border-color: rgba(255, 34, 34, .5);;
      background: rgba(255, 34, 34, .3);
      color: #fff;
    }
  }
  &.current {
    border-color: #ff2222;
    background: rgba(255, 34, 34, .7);
    color: #fff;
  }
}
</style>
