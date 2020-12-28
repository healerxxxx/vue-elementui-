<template>
  <div class="quiz-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-input placeholder="标题/文章ID/专家名" prefix-icon="el-icon-search" clearable v-model="searchQuery"
          @clear="getFilterList()" @change="getSearchList('search')" size="mini" style="width:auto;">
        </el-input>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item>
        <el-radio-group v-model="filterQuery.categoryId" @change="filterQuery.eType =  0">
          <el-radio-button label="0">全部</el-radio-button>
          <el-radio-button :label="item.cId" v-for="item in lotteryList" :key="item.cId">{{item.cName}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
     <el-form-item>
           <el-button :class="{'el-button--primary' :filterQuery.eType === 1 }" @click="expertChange(1)">预选专家</el-button>
      </el-form-item>
      <el-form-item label="联赛筛选">
        <el-autocomplete v-model="filterQuery.leagueName" :fetch-suggestions="querySearchLeagueAsync"
          placeholder="请输入联赛名称" @select="handleLeagueSelect" :trigger-on-focus="false" :debounce="30"
          value-key="leagueName" clearable />
      </el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker v-model="filterQuery.startTime" type="date" editable="false" placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          @change="filterQuery.threadEndTimeStart='',filterQuery.threadEndTimeEnd='' " style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.endTime).getTime() !== 0 && time.getTime() > new Date(filterQuery.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filterQuery.endTime" type="date" editable="false" placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59" @change="filterQuery.threadEndTimeStart='',filterQuery.threadEndTimeEnd=''"
          style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.startTime).getTime() !== 0 && time.getTime() < new Date(filterQuery.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结算时间">
        <el-date-picker v-model="filterQuery.threadEndTimeStart" type="date" editable="false" width="100"
          placeholder="结算开始日期" value-format="yyyy-MM-dd 00:00:00"
          @change="filterQuery.startTime='',filterQuery.endTime=''" style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.threadEndTimeEnd).getTime() !== 0 && time.getTime() > new Date(filterQuery.threadEndTimeEnd).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker v-model="filterQuery.threadEndTimeEnd" type="date" editable="false" placeholder="结算结束日期"
          value-format="yyyy-MM-dd 23:59:59" @change="filterQuery.startTime='',filterQuery.endTime=''"
          style="width:135px" :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filterQuery.threadEndTimeStart).getTime() !== 0 && time.getTime() < new Date(filterQuery.threadEndTimeStart).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filterQuery.plock" style="width:105px">
          <el-option label="全部" value="0">全部</el-option>
          <el-option :label="item.name" :value="item.id" v-for="item in articleStatus" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="权重">
        <el-input v-model="filterQuery.weight" placeholder="-999~999" max="999" min="-999"
          @keyup.native="handlerWeightSearch" clearable style="width:102px">
        </el-input>
      </el-form-item>
      <el-form-item label="购买数" v-if="buyChannelList.length>0">
        <el-select v-model="filterQuery.buyTypeId" style="width:110px">
          <el-option :label="item.name" :value="item.typeId" v-for="item in buyChannelList" :key="item.typeId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="专家分类">
        <el-select v-model="filterQuery.foreign" style="width:110px">
          <el-option label="全部" value="false"></el-option>
          <el-option label="外籍专家" value="true"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否临场类型">
        <el-select v-model="filterQuery.businessTypeId" style="width:110px">
          <el-option label="全部" value="0">全部</el-option>
          <el-option label="临场方案" value="1">临场方案</el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getFilterList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" v-loading="loading" @sort-change="sortList" stripe style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column label="彩种" width="120">
        <template slot-scope="scope">
          {{scope.row.cName}} <el-tag size="mini" v-if="scope.row.plock===3"
            :color="scope.row.isWin===1?'#e62121':'#333'" style="color:#fff">{{scope.row.hitRateValue}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="155">
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tag v-if="scope.row.refund" size="mini">不中退</el-tag>
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}"><span
              style="color:#e62121" v-if="scope.row.businessTypeId">【临场】</span><span
              v-if="scope.row.categoryId==3||scope.row.categoryId==4"
              style="color:#e62121;">【{{scope.row.threadTypeId | threadType2CH}}】</span>{{scope.row.title}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="threadId" label="文章ID" width="80">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ArticleQuizDetail', params: { id: scope.row.threadId }}">{{scope.row.threadId}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="专家" width="110">
        <template slot-scope="scope">
          <router-link :to="{ name: 'ExpertDetail', params: { id: scope.row.userId }}">{{scope.row.name}}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="近X场" width="80">
        <template slot-scope="scope">
          {{scope.row.maxHitRate | toPercent}}<span
            class="text-red">{{scope.row.partOfAllRate?'('+scope.row.partOfAllRate.match(/\d+/g)[0]+')':''}}</span>
        </template>
      </el-table-column>
      <el-table-column label="5场" width="60">
        <template slot-scope="scope">
          {{scope.row.fiveMatchesEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column label="10场" width="60">
        <template slot-scope="scope">
          {{scope.row.tenMatchesEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column label="15场" width="60">
        <template slot-scope="scope">
          {{scope.row.fifteenMatchesEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column label="20场" width="60">
        <template slot-scope="scope">
          {{scope.row.twentyMatchesEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column label="总盈利率" width="80">
        <template slot-scope="scope">
          {{scope.row.totalEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column prop="buyCount" :sortable="listType==='filter'&&!filterQuery.leagueId?'custom':false"
        :sort-orders="sortRrders" width="115">
        <template slot="header" slot-scope="scope">
          <span>{{`${listType==='filter' ? (buyChannel2CH[filterQuery.buyTypeId] || '红彩') : ''}购买数`}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" :sortable="listType==='filter'&&!filterQuery.leagueId?'custom':false"
        :sort-orders="sortRrders" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.price > 0">{{scope.row.price}}</span>
          <span v-else class="text-red">免费</span>
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="权重" :sortable="listType==='filter'&&!filterQuery.leagueId?'custom':false"
        :sort-orders="sortRrders" width="85">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeightColumn(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          {{scope.row.plock | articleStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="points" label="点数" :sortable="listType==='filter'&&!filterQuery.leagueId?'custom':false"
        :sort-orders="sortRrders" width="80">
      </el-table-column>
      <el-table-column prop="voteSupport" label="方案支持量" :sortable="listType==='filter'&&!filterQuery.leagueId?'custom':false"
        :sort-orders="sortRrders" width="115">
         <template slot-scope="scope">
          <el-button type="text" @click="changeVoteSupport(scope.row)">{{scope.row.voteSupport}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="pageChange" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { QuizListApi, CommonApi } from '../../../util/api'
import { objSort, isNumber } from '../../../util/tool'
import baseType from '../../../util/base'
import { mapState } from 'vuex'
export default {
  name: 'ArticleQuizList',
  data () {
    return {
      listType: 'filter', // filter || search
      sortRrders: ['descending', 'ascending', null],
      pageIndex: 1,
      pageSize: 25,
      articleStatus: baseType.articleStatus,
      lotteryList: [],
      buyChannelList: [],
      buyChannel2CH: {},
      list: [],
      filterQuery: {
        foreign: 'false',
        eType: 0,
        categoryId: 0,
        leagueName: '',
        leagueId: '',
        startTime: null,
        endTime: null,
        threadEndTimeStart: null,
        threadEndTimeEnd: null,
        plock: '0',
        weight: '',
        buyTypeId: 0,
        sortField: null,
        sortDesc: null
      },
      searchQuery: '',
      loading: false,
      tableHeight: null
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getLottery()
    this.getChannelList()
    this.getFilterList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    /**
     * @description: 获取彩种信息
     */
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            if (item.cId !== 100) {
              this.lotteryList.push(item)
            }
          })
          this.lotteryList.sort(objSort('cId'))
          this.setHeight()
        }
      })
    },
    /**
     * @description: 获取购买渠道列表
     */
    getChannelList () {
      this.$service(QuizListApi.buyChannelList).then(res => {
        if (res.code === 200) {
          this.buyChannelList = res.data
          res.data.forEach(item => {
            this.buyChannel2CH[item.typeId] = item.name
          })
          this.setHeight()
        }
      })
    },
    /**
     * @description: 获取filter条件列表
     * @param {type} arg 这里通过arg判断是何类型的加载，如el-pagination的回调是Number类型，而其他是String类型
     */
    getFilterList (arg) {
      if (this.loading) return
      this.loading = true
      if (typeof arg === 'undefined') {
        this.filterQuery.sortField = null
      }
      this.pageIndex = isNumber(arg) ? arg : 1
      var _filter = {
        buyTypeId: this.filterQuery.buyTypeId,
        foreign: this.filterQuery.foreign === 'false' ? false : this.filterQuery.foreign === 'true' ? true : ''
      }
      if (parseInt(this.filterQuery.categoryId)) {
        _filter['categoryId'] = this.filterQuery.categoryId
      }
      if (this.filterQuery.leagueId) {
        _filter['leagueId'] = this.filterQuery.leagueId
      }
      if (parseInt(this.filterQuery.plock)) {
        _filter['plock'] = this.filterQuery.plock
      }
      if (this.filterQuery.startTime) {
        _filter['startTime'] = this.filterQuery.startTime
      }
      if (this.filterQuery.endTime) {
        _filter['endTime'] = this.filterQuery.endTime
      }
      if (this.filterQuery.threadEndTimeStart) {
        _filter['threadEndTimeStart'] = this.filterQuery.threadEndTimeStart
      }
      if (this.filterQuery.threadEndTimeEnd) {
        _filter['threadEndTimeEnd'] = this.filterQuery.threadEndTimeEnd
      }
      if (this.filterQuery.weight >= -999 && this.filterQuery.weight <= 999 && this.filterQuery.weight !== '') {
        _filter['weight'] = this.filterQuery.weight
      }
      if (this.filterQuery.sortField) {
        _filter['sortField'] = this.filterQuery.sortField
        _filter['sortDesc'] = this.filterQuery.sortDesc
      }
      if (this.filterQuery.businessTypeId && this.filterQuery.businessTypeId === '1') {
        _filter['businessTypeId'] = 1
      }
      if (this.filterQuery.eType || this.filterQuery.eType === 0) {
        _filter['eType'] = this.filterQuery.eType
      }
      this.searchQuery = ''
      this.$service(QuizListApi.filterList, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: _filter
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.listType = 'filter'
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
    },
    getSearchList (arg) {
      if (!this.searchQuery || this.loading) return
      this.loading = true
      this.pageIndex = arg === 'search' ? 1 : arg
      this.filterQuery.categoryId = null
      this.$service(QuizListApi.searchList, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: {
          queryParam: this.searchQuery
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.listType = 'search'
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.list = res.data.records || []
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
      this.filterQuery.leagueId = item.leagueId
    },
    /**
     * @description: 通过keyup事件，正则替换非数字
     */
    handlerWeightSearch () {
      this.filterQuery.weight = this.filterQuery.weight.replace(/[^0-9-]/g, '')
    },
    /**
     * @description: 修改权重弹窗
     * @param {Object} data 对应行数据
     */
    changeWeightColumn (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^-?\d{1,3}$/,
        inputErrorMessage: '-999-999之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        this.$service(QuizListApi.modifyWeight, {
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
    },
    changeVoteSupport (data) {
      this.$prompt('', '修改:支持量', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^-?\d{1,3}$/,
        inputErrorMessage: '-999-999之间',
        closeOnClickModal: false,
        inputValue: data.voteSupport
      }).then(({ value }) => {
        this.$service(QuizListApi.voteSupport, {
          method: 'post',
          urlParams: {
            threadId: data.threadId
          },
          params: {
            voteSupport: value
          }
        }).then(res => {
          if (res.code === 200) {
            data.voteSupport = value
            this.$message.success('修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    /**
     * @description: 根据服务器数据排序
     * @param {String} column 列状态
     */
    sortList (column, prop, order) {
      this.filterQuery.sortField = column.prop
      this.filterQuery.sortDesc = column.order === 'ascending' ? false : column.order === 'descending' ? true : null
      this.getFilterList('sort')
    },
    expertChange (i) {
      this.filterQuery.categoryId = null
      this.filterQuery.eType = i
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
