<template>
  <div class="tcm-match-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input
          placeholder="球队名/球队ID/赛事ID/竞猜赛事ID"
          prefix-icon="el-icon-search"
          clearable
          v-model="activeObj[activeTab].filters.keyWord"
          size="mini"
          style="width:auto;">
        </el-input>
        <el-button type="primary" size="mini" @click="getList('search')">搜索</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="竞猜池比赛" name="1" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="非竞猜池比赛" name="0" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-form :inline="true" :model="activeObj[activeTab].filters" size="mini" :disabled="loading">
      <el-form-item label="联赛">
        <el-input
          placeholder="联赛名"
          clearable
          v-model="activeObj[activeTab].filters.competitionName"
          style="width:auto;">
        </el-input>
      </el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="activeObj[activeTab].filters.startTime"
          type="date"
          editable="false"
          width="100"
          placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return new Date(activeObj[activeTab].filters.endTime).getTime() !== 0 && time.getTime() > new Date(activeObj[activeTab].filters.endTime).getTime()
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="activeObj[activeTab].filters.endTime"
          type="date"
          editable="false"
          placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return new Date(activeObj[activeTab].filters.startTime).getTime() !== 0 && time.getTime() < new Date(activeObj[activeTab].filters.startTime).getTime()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="activeObj[activeTab].filters.status" style="width:105px">
          <el-option label="全部" value="">全部</el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in matchStatus" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="权重" v-show="activeTab==='1'">
        <el-input v-model="activeObj[activeTab].filters.weight"
        placeholder="0~999"
        max="999"
        min="0"
        @keyup.native="handlerWeightSearch"
        clearable
        style="width:102px">
        </el-input>
      </el-form-item>
      <el-button type="primary" size="mini" @click="getList()">搜索</el-button>
      <el-button type="primary" size="mini" @click="matchUpdate()">{{activeTab==='1'?'移出竞猜池':'移入竞猜池'}}</el-button>
      <el-button type="primary" :plain="matchClosing" size="mini" @click="setSwitch()" v-show="activeTab==='1'">一键{{matchClosing ? '开' : '封'}}盘</el-button>
      <el-button type="primary" size="mini" @click="setExtraOdd()" v-show="activeTab==='1'">设置竞猜加奖</el-button>
    </el-form>
    <!-- 竞猜池比赛 列表 -->
    <el-table
      ref="elTable1"
      v-show="activeTab==='1'"
      @sort-change="sortList"
      :data="list1"
      v-loading="loading"
      stripe
      @selection-change="handleSelectionChange"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        type="selection"
        width="40">
      </el-table-column>
      <el-table-column
        prop="tcmEventId"
        label="竞猜赛事ID"
        width="110">
        <template slot-scope="scope">
          <router-link :to="{ name: 'TcmMatchDetail', params: { id: scope.row.tcmEventId }}">{{scope.row.tcmEventId}}</router-link> <el-tag size="mini" color="#e62121" style="color:#fff" v-if="scope.row.choiceness">精</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="matchInfoId"
        label="赛事ID(老)"
        width="120">
      </el-table-column>
      <el-table-column
        prop="competitionName"
        label="联赛"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="channelIds"
        label="赛事对阵"
        min-width="150">
        <template slot-scope="scope">
          <router-link :to="{ name: 'TcmMatchDetail', params: { id: scope.row.tcmEventId }}">{{scope.row.homeName + ' VS ' + scope.row.awayName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        label="比分"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status===2||scope.row.status===3?scope.row.homeTeamScore + ' - ' + scope.row.awayTeamScore:'-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="比赛时间"
        width="100">
        <template slot-scope="scope">
          {{scope.row.eventDay + ' ' + scope.row.eventTime}}
        </template>
      </el-table-column>
      <el-table-column
        label="赔率"
        width="100">
        <template slot-scope="scope">
          {{scope.row.selectionList && scope.row.selectionList[0] ? scope.row.selectionList[0].selectionName + scope.row.selectionList[0].backOdds : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="赔率"
        width="100">
        <template slot-scope="scope">
          {{scope.row.selectionList && scope.row.selectionList[1] ? scope.row.selectionList[1].selectionName + scope.row.selectionList[1].backOdds : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="赔率"
        width="100">
        <template slot-scope="scope">
          {{scope.row.selectionList && scope.row.selectionList[2] ? scope.row.selectionList[2].selectionName + scope.row.selectionList[2].backOdds : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        :sortable="activeObj[activeTab].listType === 'filter'?'custom':false"
        :sort-orders="sortRrders"
        prop="totalNum"
        label="总下单量"
        width="100">
      </el-table-column>
      <el-table-column
        :sortable="activeObj[activeTab].listType === 'filter'?'custom':false"
        :sort-orders="sortRrders"
        prop="userNum"
        label="总下单用户数"
        width="130">
      </el-table-column>
      <el-table-column
        :sortable="activeObj[activeTab].listType === 'filter'?'custom':false"
        :sort-orders="sortRrders"
        prop="totalFlowAmount"
        label="总流水(积分+N币)"
        width="160">
      </el-table-column>
      <el-table-column
        prop="netprofitorloss"
        label="红彩盈亏(积分+N币)"
        width="150">
      </el-table-column>
      <el-table-column
        prop="risk"
        label="红彩盈亏风险"
        width="110">
      </el-table-column>
      <el-table-column
        prop="extraOdds"
        label="加奖百分比"
        width="100">
        <template slot-scope="scope">
          {{scope.row.extraOdds | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status | tcmMatchStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="80">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="150">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.choicenessPop">
            <p>确定{{scope.row.choiceness?'取消精选':'设置精选'}}？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.choicenessPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="setChoiceness(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" :plain="scope.row.choiceness" size="mini">{{scope.row.choiceness?'取消精选':'设置精选'}}</el-button>
          </el-popover>
          <el-popover
            placement="left"
            width="150"
            v-model="scope.row.betPop">
            <p>确定{{scope.row.allowBetting ? '开' : '封'}}盘？{{scope.row.allowBetting ? '开' : '封'}}盘后，该比赛{{scope.row.allowBetting ? '可' : '不可'}}在客户端提交投注订单！</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.betPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="setBet(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" :plain="scope.row.allowBetting" size="mini">{{scope.row.allowBetting ? '开' : '封'}}</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!-- 非竞猜池比赛 列表 -->
    <el-table
      ref="elTable0"
      v-show="activeTab==='0'"
      :data="list0"
      v-loading="loading"
      stripe
      @selection-change="handleSelectionChange"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        type="selection"
        width="40">
      </el-table-column>
      <el-table-column
        prop="tcmEventId"
        label="竞猜赛事ID"
        width="90">
        <template slot-scope="scope">
          <router-link :to="{ name: 'TcmMatchDetail', params: { id: scope.row.tcmEventId }}">{{scope.row.tcmEventId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="matchInfoId"
        label="赛事ID(老)"
        width="120">
      </el-table-column>
      <el-table-column
        prop="competitionName"
        label="联赛"
        min-width="80">
      </el-table-column>
      <el-table-column
        label="赛事对阵"
        min-width="150">
        <template slot-scope="scope">
          <router-link :to="{ name: 'TcmMatchDetail', params: { id: scope.row.tcmEventId }}">{{scope.row.homeName + ' VS ' + scope.row.awayName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        label="比分"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status===2||scope.row.status===3?scope.row.homeTeamScore + ' - ' + scope.row.awayTeamScore:'-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="赔率"
        width="100">
        <template slot-scope="scope">
          {{scope.row.selectionList && scope.row.selectionList[0] ? scope.row.selectionList[0].selectionName + scope.row.selectionList[0].backOdds : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="赔率"
        width="100">
        <template slot-scope="scope">
          {{scope.row.selectionList && scope.row.selectionList[1] ? scope.row.selectionList[1].selectionName + scope.row.selectionList[1].backOdds : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="赔率"
        width="100">
        <template slot-scope="scope">
          {{scope.row.selectionList && scope.row.selectionList[2] ? scope.row.selectionList[2].selectionName + scope.row.selectionList[2].backOdds : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="比赛时间"
        width="100">
        <template slot-scope="scope">
          {{scope.row.eventDay + ' ' + scope.row.eventTime}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.status | tcmMatchStatus2CH}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="activeObj[activeTab].page"
      :total="activeObj[activeTab].total"
      :page-size="activeObj[activeTab].limit"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { TcmMatchList } from '../../../util/api'
import base from '../../../util/base'
import {isNumber} from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'TcmMatch',
  data () {
    return {
      activeTab: '1',
      loading: false,
      matchStatus: base.tcmMatchStatus,
      sortRrders: ['descending', 'ascending', null],
      list1: [],
      list0: [],
      matchClosing: false,
      activeObj: {
        1: {
          listType: 'filter',
          offset: 0,
          limit: 10,
          page: 1,
          total: 1,
          filters: {
            status: ''
          },
          selection: []
        },
        0: {
          offset: 0,
          limit: 10,
          page: 1,
          total: 1,
          filters: {
            status: ''
          },
          selection: []
        }
      },
      tableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getSwitch()
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs['elTable' + this.activeTab].$el.offsetTop - 63
      })
    },
    handleClickTabs () {
      this.getList()
      this.setHeight()
    },
    handlerWeightSearch () {
      this.activeObj['1'].filters.weight = this.activeObj['1'].filters.weight.replace(/[^0-9]/g, '')
    },
    getList (arg) {
      if (this.loading) return
      this.activeObj[this.activeTab].page = isNumber(arg) ? arg : 1
      this.activeObj[this.activeTab].offset = (this.activeObj[this.activeTab].page - 1) * this.activeObj[this.activeTab].limit
      let _data = {
        offset: this.activeObj[this.activeTab].offset,
        limit: this.activeObj[this.activeTab].limit,
        bettingStatus: this.activeTab
      }
      if (arg === 'search') {
        if (this.activeObj[this.activeTab].filters.keyWord) {
          if (this.activeObj[this.activeTab].listType) this.activeObj[this.activeTab].listType = 'search'
          _data['keyWord'] = this.activeObj[this.activeTab].filters.keyWord
        } else {
          return this.$message.warning('搜索条件不能为空')
        }
      } else {
        if (this.activeObj[this.activeTab].listType) this.activeObj[this.activeTab].listType = 'filter'
        if (this.activeObj[this.activeTab].filters.competitionName) _data['competitionName'] = this.activeObj[this.activeTab].filters.competitionName
        if (this.activeObj[this.activeTab].filters.startTime) _data['startTime'] = this.activeObj[this.activeTab].filters.startTime
        if (this.activeObj[this.activeTab].filters.endTime) _data['endTime'] = this.activeObj[this.activeTab].filters.endTime
        if (this.activeObj[this.activeTab].filters.status) _data['status'] = this.activeObj[this.activeTab].filters.status
        if (this.activeObj[this.activeTab].filters.weight) _data['weight'] = this.activeObj[this.activeTab].filters.weight
        if (this.activeObj[this.activeTab].filters.countOrder) _data['countOrder'] = this.activeObj[this.activeTab].filters.countOrder
      }
      this.loading = true
      this.$service(TcmMatchList.list, {
        method: 'post',
        data: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this['list' + this.activeTab] = res.data.data || []
          this.activeObj[this.activeTab].total = res.data.total || 1
          this.$refs['elTable' + this.activeTab].bodyWrapper.scrollTop = 0
          this.$refs['elTable' + this.activeTab].bodyWrapper.scrollLeft = 0
          if (this.activeTab === '1' && arg === 'search') this.$refs.elTable1.clearSort()
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
    sortList (column, prop, order) {
      this.activeObj[this.activeTab].filters.countOrder = 0
      if (column.order !== null) {
        let _val = column.order === 'ascending' ? 1 : column.order === 'descending' ? 2 : 0
        let _type = 0
        // if (column.prop === 'totalNum') _type = 0
        if (column.prop === 'userNum') _type = 2
        if (column.prop === 'totalFlowAmount') _type = 4
        this.activeObj[this.activeTab].filters.countOrder = _val + _type
      }
      this.getList('sort')
    },
    handleSelectionChange (selection) {
      this.activeObj[this.activeTab].selection = selection
    },
    getSwitch () {
      this.$service(TcmMatchList.getSwitch).then(res => {
        if (res.code === 200) {
          this.matchClosing = res.data
        }
      })
    },
    setSwitch () {
      this.$service(TcmMatchList.setSwitch, {
        params: {
          switchStatus: !this.matchClosing
        }
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('一键' + (this.matchClosing ? '开' : '封') + '盘成功')
          this.matchClosing = !this.matchClosing
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
    changeWeight (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{1,3}$/,
        inputErrorMessage: '0-999之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        this.$service(TcmMatchList.weight, {
          params: {
            tcmEventId: data.tcmEventId,
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            data.weight = value
            this.$message.success('权重修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    setChoiceness (data) {
      this.$set(data, 'loading', true)
      this.$service(TcmMatchList.choiceness, {
        method: 'post',
        data: {
          choiceness: data.choiceness ? 0 : 1,
          tcmEventId: data.tcmEventId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.choicenessPop = false
          data.choiceness = data.choiceness ? 0 : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    setBet (data) {
      this.$set(data, 'loading', true)
      this.$service(TcmMatchList.bet, {
        method: 'post',
        data: {
          allowBetting: data.allowBetting ? 0 : 1,
          tcmEventId: data.tcmEventId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.betPop = false
          data.allowBetting = data.allowBetting ? 0 : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    matchUpdate () {
      if (this.activeObj[this.activeTab].selection.length === 0) return this.$message.warning('您还未选中比赛，请先选择比赛！')
      this.$confirm('确定将选中的比赛，' + (this.activeTab === '1' ? '移出' : '移入') + '竞猜赛事列表？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        let _arr = []
        this.activeObj[this.activeTab].selection.forEach(item => {
          _arr.push(item.tcmEventId)
        })
        this.$service(TcmMatchList.betUpdate, {
          params: {
            tcmEventId: _arr.join(','),
            betting: this.activeTab === '1' ? 0 : 1
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList(this.activeObj[this.activeTab].page)
            this.$message.success((this.activeTab === '1' ? '移出' : '移入') + '成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    setExtraOdd () {
      if (this.activeObj[this.activeTab].selection.length === 0) return this.$message.warning('您还未选中比赛，请先选择比赛！')
      this.$prompt('设置加奖百分比', '加奖', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^([1-9]|1[0-9]|20)$/,
        inputErrorMessage: '1-20之间',
        closeOnClickModal: false,
        inputValue: 5
      }).then(({ value }) => {
        this.$confirm('确认为勾选的赛事进行加奖' + value + '%？', '', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          let _arr = []
          this.activeObj[this.activeTab].selection.forEach(item => {
            _arr.push(item.tcmEventId)
          })
          this.$service(TcmMatchList.extraOdd, {
            method: 'post',
            data: {
              tcmEventId: _arr.join(','),
              extraOdds: value
            }
          }).then(res => {
            if (res.code === 200) {
              this.getList(this.activeObj[this.activeTab].page)
              this.$message.success('加奖成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.$message.error(JSON.stringify(err))
          })
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
