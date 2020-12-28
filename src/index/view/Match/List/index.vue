<template>
  <div class="match-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input v-if="filterQuery.lotteryCategoryId !== 3" placeholder="球队名/球队ID/赛事ID" prefix-icon="el-icon-search"
          clearable v-model="searchQuery" @change="getSearchList('search')" size="small" style="width:auto;">
        </el-input>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item>
        <el-radio-group v-model="filterQuery.lotteryCategoryId">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button :label="item.cId" v-for="item in lotteryList" :key="item.cId" v-show="item.cId!==4">
            {{item.cName}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="联赛筛选" v-show="filterQuery.lotteryCategoryId!==3">
        <el-autocomplete v-model="filterQuery.leagueName" :fetch-suggestions="querySearchLeagueAsync"
          placeholder="请输入联赛名称" @select="handleLeagueSelect" :trigger-on-focus="false" :debounce="30"
          value-key="leagueName" clearable />
      </el-form-item>
      <el-form-item label="时间" v-show="filterQuery.lotteryCategoryId!==3">
        <el-date-picker v-model="filterQuery.startTime" type="date" editable="false" width="100" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00" style="width:135px" :picker-options="{disabledDate(time) {
            return new Date(filterQuery.endTime).getTime() !== 0 && time.getTime() > new Date(filterQuery.endTime).getTime()
          }}" />
        ~
        <el-date-picker v-model="filterQuery.endTime" type="date" editable="false" width="100" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" style="width:135px" :picker-options="{disabledDate(time) {
            return new Date(filterQuery.startTime).getTime() !== 0 && time.getTime() < new Date(filterQuery.startTime).getTime()
          }}" />
      </el-form-item>
      <el-form-item label="状态" v-show="filterQuery.lotteryCategoryId!==3">
        <el-select v-model="filterQuery.matchStatus" style="width:105px">
          <el-option label="全部" value="">全部</el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in matchStatus" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="权重" v-show="filterQuery.lotteryCategoryId!==3">
        <el-input v-model.number="filterQuery.weight" placeholder="0~999" max="999" min="0"
          @keyup.native="handlerWeightSearch" clearable style="width:102px" />
      </el-form-item>
      <el-form-item label="状态" v-show="filterQuery.lotteryCategoryId===3">
        <el-select v-model="sfcDegree" style="width:105px">
          <el-option label="全部" value="">全部</el-option>
          <el-option :label="item + '期'" :value="item" v-for="(item, index) in sfcDegreeList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getFilterList()">查询</el-button>
      </el-form-item>
      <el-form-item v-show="filterQuery.lotteryCategoryId===3">
        <el-button type="primary" @click="SFCDegreePop()">添加胜负彩期数</el-button>
      </el-form-item>
      <el-form-item v-show="filterQuery.lotteryCategoryId===3">
        <el-button type="primary" @click="fixSFCExpertStat()">修复胜负彩专家数据</el-button>
      </el-form-item>
    </el-form>
    <el-table v-if="filterQuery.lotteryCategoryId!==3" ref="elTable" @sort-change="sortList" :data="list"
      v-loading="loading" stripe :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="matchInfoId" label="赛事ID" width="150">
        <template slot-scope="scope">
          <router-link :to="{ name: 'MatchDetail', params: { id: scope.row.matchInfoId }}">
            {{scope.row.matchInfoId || scope.row.matchCode}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="lotteryCategoryId" label="彩种" width="90">
        <template slot-scope="scope">
          {{lottery2CH[scope.row.lotteryCategoryId] || ''}}
        </template>
      </el-table-column>
      <el-table-column prop="leagueMatchName" label="联赛类型" width="120">
      </el-table-column>
      <el-table-column label="赛事对阵" min-width="160">
        <template slot-scope="scope">
          <router-link :to="{ name: 'MatchDetail', params: { id: scope.row.matchInfoId }}"
            v-if="scope.row.lotteryCategoryId !== 2 && scope.row.lotteryCategoryId !== 6">
            {{scope.row.matchStatus===2||scope.row.matchStatus===3?scope.row.homeMatchTeam.teamName+' '+scope.row.homeScore+'-'+scope.row.guestScore+' '+scope.row.guestMatchTeam.teamName:scope.row.homeMatchTeam.teamName+' VS '+scope.row.guestMatchTeam.teamName}}
          </router-link>
          <router-link :to="{ name: 'MatchDetail', params: { id: scope.row.matchInfoId }}" v-else>
            {{scope.row.matchStatus==2||scope.row.matchStatus==3?scope.row.guestMatchTeam.teamName+' '+scope.row.guestScore+'-'+scope.row.homeScore+' '+scope.row.homeMatchTeam.teamName:scope.row.guestMatchTeam.teamName+' VS '+scope.row.homeMatchTeam.teamName}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="初始化赔率" width="100">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status !== 0" type="primary" size="mini" @click="initPlay(scope.row)">初始化
          </el-button>
        </template>
      </el-table-column>
      <el-table-column :sortable="listType==='filter'?'custom':false" :sort-orders="sortRrders" prop="threadCount"
        label="文章数" width="100">
      </el-table-column>
      <el-table-column :sortable="listType==='filter'?'custom':false" :sort-orders="sortRrders" prop="targetThreadCount"
        label="命中文章数" width="120">
      </el-table-column>
      <el-table-column :sortable="listType==='filter'?'custom':false" :sort-orders="sortRrders" prop="focusCount"
        label="被关注数" width="100">
      </el-table-column>
      <el-table-column :sortable="listType==='filter'?'custom':false" :sort-orders="sortRrders" prop="analyzeCount"
        label="解锁数" width="100">
      </el-table-column>
      <el-table-column prop="matchTime" label="比赛时间" width="150">
      </el-table-column>
      <el-table-column prop="matchStatus" label="状态" width="100">
        <template slot-scope="scope">{{scope.row.matchStatus | matchStatus2CH}}</template>
      </el-table-column>
      <el-table-column :sortable="listType==='filter'?'custom':false" :sort-orders="sortRrders" prop="weight" label="权重"
        width="80">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeightColumn(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.refund">不中退款</el-button>
          <el-popover placement="left" v-model="scope.row.refundPop"
            v-if="!scope.row.refund&&scope.row.matchStatus===1">
            <p>确定设置？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.refundPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="setRefund(scope.row)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" size="small">设置不中退</el-button>
          </el-popover>
          <el-popover placement="left" v-model="scope.row.refundPop"
            v-if="scope.row.refund&&scope.row.cancelRefund&&scope.row.matchStatus===1">
            <p>取消不中退款？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.refundPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="cancelRefund(scope.row)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" size="small">取消</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="tcmEventId" label="竞猜赛事ID" width="110">
      </el-table-column>
    </el-table>
    <el-pagination v-if="filterQuery.lotteryCategoryId!==3" background layout="prev, pager, next"
      @current-change="pageChange" :current-page="pageIndex" :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
    <el-table v-show="filterQuery.lotteryCategoryId===3" ref="elTableSfc" :data="sfcList" v-loading="loading" stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="winningColoursInfoId" label="胜负彩ID" width="100">
      </el-table-column>
      <el-table-column prop="sportteryDegree" label="竞彩网期数" width="110">
      </el-table-column>
      <el-table-column label="开奖时间" width="160">
        <template slot-scope="scope">
          {{[scope.row.prizeTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="开售时间" width="160">
        <template slot-scope="scope">
          {{[scope.row.startTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="停售时间" width="160">
        <template slot-scope="scope">
          {{[scope.row.endTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="wcFirstPrize" label="胜负彩一等奖" min-width="120">
      </el-table-column>
      <el-table-column prop="wcSecondPrice" label="胜负彩二等奖" min-width="120">
      </el-table-column>
      <el-table-column prop="optionalNicePrice" label="任九奖金" min-width="120">
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="SFCDegreePop(scope.row, 1)">修改时间</el-button>
          <el-button type="primary" size="mini" @click="SFCDegreePop(scope.row, 2)">手动开奖</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="filterQuery.lotteryCategoryId===3" background layout="prev, pager, next"
      @current-change="getFilterList" :current-page="sfcPageIndex" :page-count="sfcPageCount" class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.winningColoursInfoId?'修改开奖时间':'添加胜负彩期数'" :visible.sync="dialogFormVisible" width="500px"
      :close-on-click-modal="false" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="100px" size="small"
        ref="sfcDegreeForm">
        <el-form-item :label="(form.winningColoursInfoId?'':'竞彩网')+'期数'" prop="sportteryDegree" :rules="[{required: !form.winningColoursInfoId, message: '竞彩网期数不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '竞彩网期数必须为数字', trigger: ['blur', 'change']}]">
          <el-input v-show="!form.winningColoursInfoId" v-model="form.sportteryDegree" autocomplete="off"></el-input>
          <span v-show="form.winningColoursInfoId">{{form.sportteryDegree}}</span>
        </el-form-item>
        <el-form-item label="开奖时间" prop="prizeTime" v-show="!form.winningColoursInfoId||form.type===1"
          :rules="[{required: !form.winningColoursInfoId||form.type===1, message: '开奖时间不为空', trigger: ['blur', 'change']}]">
          <el-date-picker v-model="form.prizeTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="开售时间" prop="startTime" v-show="!form.winningColoursInfoId||form.type===1"
          :rules="[{required: !form.winningColoursInfoId||form.type===1, message: '开售时间不为空', trigger: ['blur', 'change']}]">
          <el-date-picker v-model="form.startTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="停售时间" prop="endTime" v-show="!form.winningColoursInfoId||form.type===1"
          :rules="[{required: !form.winningColoursInfoId||form.type===1, message: '停售时间不为空', trigger: ['blur', 'change']}]">
          <el-date-picker v-model="form.endTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="一等奖奖金" prop="wcFirstPrize" v-show="form.type===2" :rules="[{required: form.type===2, message: '一等奖奖金不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/, message: '奖金格式不正确', trigger: ['blur', 'change']}]">
          <el-input v-model="form.wcFirstPrize" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="二等奖奖金" prop="wcSecondPrice" v-show="form.type===2" :rules="[{required: form.type===2, message: '二等奖奖金不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/, message: '奖金格式不正确', trigger: ['blur', 'change']}]">
          <el-input v-model="form.wcSecondPrice" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="任九奖金" prop="optionalNicePrice" v-show="form.type===2" :rules="[{required: form.type===2, message: '任九奖金不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/, message: '奖金格式不正确', trigger: ['blur', 'change']}]">
          <el-input v-model="form.optionalNicePrice" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="sportDT编号" prop="matchSFCDegree" v-show="!form.winningColoursInfoId" :rules="[{required: true, message: 'sportDT编号不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: 'sportDT编号必须为数字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.matchSFCDegree" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="年份" prop="year" v-show="!form.winningColoursInfoId"
          :rules="[{required: !form.winningColoursInfoId, message: '年份不为空', trigger: ['blur', 'change']}]">
          <el-date-picker v-model="form.year" value-format="yyyy" type="year" placeholder="选择年">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否当期" v-show="!form.winningColoursInfoId">
          <el-radio v-model="form.isNowDegree" label="1">是</el-radio>
          <el-radio v-model="form.isNowDegree" label="0">否</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('sfcDegreeForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { CommonApi, MatchList } from '../../../util/api'
import baseType from '../../../util/base'
import { isNumber, objSort, formatDate } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'MatchList',
  data () {
    return {
      listType: 'filter', // filter || search
      sortRrders: ['descending', 'ascending', null],
      lotteryList: [],
      lottery2CH: {},
      filterQuery: {
        lotteryCategoryId: '',
        matchStatus: ''
      },
      matchStatus: baseType.matchStatus,
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      sfcList: [],
      sfcPageIndex: 1,
      sfcPageSize: 25,
      sfcPageCount: 1,
      sfcDegreeList: [],
      sfcDegree: '',
      tableHeight: null,
      searchQuery: '',
      dialogFormVisible: false,
      updateLoading: false,
      form: {
        sportteryDegree: '',
        prizeTime: '',
        startTime: '',
        endTime: '',
        matchSFCDegree: '',
        year: '',
        isNowDegree: '0'
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getFilterList()
    this.getLottery()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - (this.filterQuery.lotteryCategoryId !== 3 ? this.$refs.elTable.$el.offsetTop : this.$refs.elTableSfc.$el.offsetTop) - 63
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
            if (item.cId !== 100) {
              this.lotteryList.push(item)
            }
          })
          this.lotteryList.sort(objSort('cId'))
          this.setHeight()
        }
      })
    },
    getFilterList (arg) {
      if (typeof arg === 'undefined') {
        this.filterQuery.sortField = null
      }
      if (this.filterQuery.lotteryCategoryId !== 3) {
        if (this.loading) return
        this.pageIndex = isNumber(arg) ? arg : 1
        var _filter = {}
        if (parseInt(this.filterQuery.lotteryCategoryId)) _filter['lotteryCategoryId'] = this.filterQuery.lotteryCategoryId
        if (this.filterQuery.leagueMatchId) _filter['leagueMatchId'] = this.filterQuery.leagueMatchId
        if (this.filterQuery.startTime) {
          _filter['startTime'] = this.filterQuery.startTime
        }
        if (this.filterQuery.endTime) {
          _filter['endTime'] = this.filterQuery.endTime
        }
        if (this.filterQuery.matchStatus) _filter['matchStatus'] = this.filterQuery.matchStatus
        if (this.filterQuery.weight >= 0 && this.filterQuery.weight <= 999 && this.filterQuery.weight !== '') _filter['weight'] = this.filterQuery.weight
        if (this.filterQuery.sortField) {
          _filter = Object.assign(_filter, { sortField: this.filterQuery.sortField, sortDesc: this.filterQuery.sortDesc })
        }
        this.loading = true
        this.listType = 'filter'
        this.searchQuery = ''
        this.$service(MatchList.list, {
          urlParams: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize
          },
          params: _filter
        }).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.list = res.data.records || []
            this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
            if (!arg || arg === 'category') this.$refs.elTable.clearSort()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      } else {
        this.getSfcDegreeList()
        this.getSfcList(arg)
      }
    },
    getSearchList (arg) {
      if (this.loading) return
      if (this.searchQuery) {
        this.loading = true
        this.listType = 'search'
        this.pageIndex = isNumber(arg) ? arg : 1
        this.filterQuery.lotteryCategoryId = null
        this.$service(MatchList.search, {
          method: 'post',
          urlParams: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize
          },
          data: {
            queryParam: this.searchQuery
          }
        }).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.list = res.data.records || []
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.pageCount = res.data.page ? res.data.page.pageCount : 1
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      } else {
        this.getFilterList()
      }
    },
    /**
     * @description: 翻页，根据不同的条件，进行不同的列表查询
     * @param {Number} page 页码回调
     */
    pageChange (page) {
      switch (this.listType) {
        case 'filter':
          this.getFilterList(page)
          break
        case 'search':
          this.getSearchList(page)
          break
      }
    },
    sortList (column, prop, order) {
      this.filterQuery.sortField = column.prop
      this.filterQuery.sortDesc = column.order === 'ascending' ? false : column.order === 'descending' ? true : null
      this.getFilterList('sort')
    },
    /**
     * @description: 从服务器获取联赛搜索条件列表
     * @param {String} queryString element-ui 默认参数
     * @param {Function} callback element-ui 默认回调
     */
    querySearchLeagueAsync (queryString, callback) {
      if (!queryString) return
      this.$service(CommonApi.leagueSearch, {
        params: {
          queryParam: queryString
        }
      }).then(res => {
        if (res.code === 200) {
          callback(res.data)
        }
      })
    },
    /**
     * @description: 根据联赛查询列表
     * @param {Object} item 联赛对象
     */
    handleLeagueSelect (item) {
      this.filterQuery.leagueMatchId = item.leagueId
    },
    /**
     * @description: 通过keyup事件，正则替换非数字
     */
    handlerWeightSearch () {
      this.filterQuery.weight = this.filterQuery.weight.replace(/[^\d]/g, '')
    },
    getSfcDegreeList () {
      if (this.sfcDegreeList.length > 0) return
      this.$service(MatchList.sfcDegreeList).then(res => {
        if (res.code === 200) {
          this.sfcDegreeList = res.data
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) this.$message.error(JSON.stringify(err))
      })
    },
    getSfcList (arg) {
      if (this.loading) return
      this.sfcPageIndex = isNumber(arg) ? arg : 1
      this.loading = true
      this.$service(MatchList.sfcList, {
        params: {
          pageIndex: this.sfcPageIndex,
          pageSize: this.sfcPageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTableSfc.bodyWrapper.scrollTop = 0
          this.sfcList = res.data.records || []
          this.sfcPageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
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
    getSfcListByDegree () {
      if (this.sfcDegree) {
        if (this.loading) return
        this.loading = true
        this.sfcPageIndex = 1
        this.$service(MatchList.sfcListByDegree, {
          params: {
            sportdtDegree: this.sfcDegree
          }
        }).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.sfcList = []
            this.sfcList.push(res.data)
            this.sfcPageCount = 1
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      } else {
        this.getSfcList(1)
      }
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
        this.$service(MatchList.weight, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: JSON.stringify({
            matchInfoId: data.matchInfoId,
            weight: value
          })
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
    },
    setRefund (data) {
      this.$set(data, 'loading', true)
      this.$service(MatchList.setRefund, {
        method: 'post',
        data: {
          matchInfoId: data.matchInfoId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.refundPop = false
          this.$message.success('设置不中退成功')
          this.pageChange(this.pageIndex)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    cancelRefund (data) {
      this.$set(data, 'loading', true)
      this.$service(MatchList.cancelRefund, {
        method: 'post',
        data: {
          matchInfoId: data.matchInfoId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.refundPop = false
          this.$message.success('取消不中退成功')
          this.pageChange(this.pageIndex)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    /**
     * @description: 胜负彩弹框，统一用一个弹框解决，胜负彩增加期数、修改开奖时间、手动开奖
     * @param {Object} 修改的数据
     * @param {Number} type 类型，1 修改开奖时间；2 手动开奖
     */
    SFCDegreePop (data, type) {
      this.form = Object.assign({}, data || {
        sportteryDegree: '',
        prizeTime: '',
        startTime: '',
        endTime: '',
        matchSFCDegree: '',
        year: '',
        isNowDegree: '0'
      })
      if (type) {
        this.form['type'] = type
        if (type === 1) {
          this.form.prizeTime = formatDate(this.form.prizeTime, 'yyyy-MM-dd hh:mm:ss')
          this.form.startTime = formatDate(this.form.startTime, 'yyyy-MM-dd hh:mm:ss')
          this.form.endTime = formatDate(this.form.endTime, 'yyyy-MM-dd hh:mm:ss')
          this.form.year = formatDate(new Date(this.form.year, '0', '1'), 'yyyy-MM-dd hh:mm:ss')
        }
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.sfcDegreeForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          if (this.form.type === 2) {
            this.$service(MatchList.sfcPrize, {
              method: 'post',
              data: this.form
            }).then(res => {
              this.updateLoading = false
              if (res.code === 200) {
                this.dialogFormVisible = false
                this.$message.success('手动开奖成功！')
                if (this.sfcDegree) {
                  this.getSfcListByDegree()
                } else {
                  this.getSfcList(this.sfcPageIndex)
                }
              } else {
                this.$message.error(res.code + ':' + res.message)
              }
            }, err => {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            })
          } else {
            if (this.form.winningColoursInfoId) {
              this.form.year = formatDate(this.form.year, 'yyyy')
            }
            this.$service(this.form.winningColoursInfoId ? MatchList.sfcUpdateByDegree : MatchList.sfcAddNew, {
              method: 'post',
              data: this.form
            }).then(res => {
              this.updateLoading = false
              if (res.code === 200) {
                this.dialogFormVisible = false
                this.$message.success(this.form.winningColoursInfoId ? '修改时间成功！' : '添加成功！')
                if (this.sfcDegree && this.form.winningColoursInfoId) {
                  this.getSfcListByDegree()
                } else {
                  this.getSfcList(this.form.winningColoursInfoId ? this.sfcPageIndex : 1)
                }
              } else {
                this.$message.error(res.code + ':' + res.message)
              }
            }, err => {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            })
          }
        }
      })
    },
    fixSFCExpertStat () {
      this.$prompt('期数', '修复胜负彩专家数据', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '胜负彩期数必须为数字',
        closeOnClickModal: false,
        inputPlaceholder: '我方数据商编号，如2018008',
        inputValue: ''
      }).then(({ value }) => {
        this.$service(MatchList.repairSfcDegree, {
          params: {
            matchSFCDegree: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('修复成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    initPlay (data) {
      const { lotteryCategoryId, homeMatchTeam, guestMatchTeam } = data
      const _name = lotteryCategoryId !== 2 && lotteryCategoryId !== 6 ? homeMatchTeam.teamName + 'VS' + guestMatchTeam.teamName : guestMatchTeam.teamName + 'VS' + homeMatchTeam.teamName
      this.$confirm(`确定初始化【${_name}】的赔率?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$service('/api/admin/matchInfo/initPlay', {
          params: {
            matchInfoId: data.matchInfoId
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('赛事赔率初始化成功')
            data.status = 0
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
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
