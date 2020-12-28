<template>
  <div class="expert-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" @click="dialogExpert=true">添加专家</el-button>
        <el-input
          placeholder="专家名/专家ID/专家通行证"
          prefix-icon="el-icon-search"
          clearable
          v-model="searchQuery"
          @change="searchExpertList()"
          size="mini"
          style="width:auto;">
        </el-input>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item v-if="lotteryList.length > 0">
        <el-radio-group v-model="filterQuery.categoryId" @change="getExpertList('category')">
          <el-radio-button :label="item.cId" v-for="item in lotteryList" :key="item.cId">{{item.cName}}</el-radio-button>
          <el-radio-button label="eType">预选专家</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="afficheAddPop()">添加公告</el-button>
        <el-button type="text" @click="afficheListPop()">公告列表</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      @sort-change="sortList"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        label="专家名称"
        min-width="100">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.userId}}">{{scope.row.nickname}}</router-link> <el-tag size="mini" v-if="scope.row.postLimit>-1" :color="'#e62121'" style="color:#fff">{{scope.row.postLimit}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="userId"
        label="专家ID"
        width="80">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.userId}}">{{scope.row.userId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="account"
        label="账号"
        min-width="160">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.userId}}">{{scope.row.account}}</router-link>
        </template>
      </el-table-column>
       <el-table-column
        prop="eType"
        label="类型"
        min-width="160">
        <template slot-scope="scope">
          {{scope.row.eType | eType2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="threadCount"
        label="文章数"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="90">
      </el-table-column>
      <el-table-column
        prop="follower"
        label="粉丝数"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="90">
      </el-table-column>
      <el-table-column
        prop="totalEarningRate"
        label="总盈利率"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="100">
        <template slot-scope="scope">
          {{scope.row.totalEarningRate | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="发布时间"
        show-overflow-tooltip>
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="lastLogintime"
        label="最后登录时间"
        show-overflow-tooltip>
        <template slot-scope="scope">
          {{[scope.row.lastLogintime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="eStatus"
        label="专家状态"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="100">
        <template slot-scope="scope">
          {{scope.row.eStatus | expertStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="serviceStatus"
        label="协议状态"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="100">
        <template slot-scope="scope">
          {{scope.row.serviceStatus | serviceStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="filterQuery.categoryId===1||listType==='search'"
        prop="weight"
        :label="listType==='search'?'足球权重':'权重'"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="80">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeightColumn(scope.row, 1)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="filterQuery.categoryId===2||listType==='search'"
        prop="basketballWeight"
        :label="listType==='search'?'篮球权重':'权重'"
        :sortable="listType==='filter'?'custom':false"
        :sort-orders="sortRrders"
        width="80">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeightColumn(scope.row, 2)">{{scope.row.basketballWeight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="filterQuery.categoryId>2"
        prop="weight"
        label="权重"
        width="80">
        <template slot-scope="scope">
          <el-button type="text">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="pageChange"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog title="添加公告" :close-on-click-modal="false" :visible.sync="dialogAffiche" width="500px" center>
      <el-form :model="formAffiche" :rules="formAfficheRules" :disabled="afficheLoading" label-width="80px" ref="formAffiche">
        <el-form-item label="公告内容" prop="content">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="此公告会即时显示到专家后台，请谨慎填写"
            v-model="formAffiche.content">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogAffiche = false">取消</el-button>
        <el-button size="small" type="primary" :loading="afficheLoading" @click="submitAffiche('formAffiche')">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="公告列表" :close-on-click-modal="false" :visible.sync="dialogAfficheList" width="700px" center>
      <el-table
        ref="elAfficheTable"
        :data="afficheList"
        v-loading="afficheListLoading"
        stripe
        :max-height="400">
        <el-table-column
          prop="afficheId"
          label="公告ID"
          width="70">
        </el-table-column>
        <el-table-column
          prop="afficheContent"
          label="公告内容">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="发布时间"
          width="150">
          <template slot-scope="scope">
            {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column
          prop="adminName"
          label="发布人"
          width="80">
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        @current-change="getAfficheList"
        :current-page.sync="Math.floor(afficheOffset/afficheLimit) + 1"
        :total="afficheTotal"
        :page-size="afficheLimit"
        class="page-bar-reset">
      </el-pagination>
    </el-dialog>
    <v-expert-dialog
      :visible="dialogExpert"
      @closeExpertDialog="dialogExpert=false"
      @success="getExpertList()" />
  </div>
</template>

<script>
import { ExpertList, CommonApi } from '../../../util/api'
import { objSort, isNumber } from '../../../util/tool'
import VExpertDialog from '../component/ExpertDialog'
import { mapState } from 'vuex'
export default {
  name: 'ExpertList',
  data () {
    return {
      listType: 'filter', // filter || search
      sortRrders: ['descending', 'ascending', null],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      loading: false,
      filterQuery: {
        categoryId: 1
      },
      searchQuery: '',
      lotteryList: [],
      tableHeight: null,
      dialogAffiche: false,
      formAffiche: {
        content: ''
      },
      formAfficheRules: {
        content: [
          {required: true, message: '公告内容必填', trigger: 'blur'},
          {max: 500, message: '公告字数不超过500字', trigger: 'blur'}
        ]
      },
      dialogAfficheList: false,
      afficheLoading: false,
      afficheListLoading: false,
      afficheList: [],
      afficheOffset: 0,
      afficheLimit: 20,
      afficheTotal: 1,
      dialogExpert: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getLottery()
    this.getExpertList()
    this.setHeight()
  },
  filters: {
    expertStatus2CH (val) {
      let dict = {
        '0': '正常',
        '1': '下线'
      }
      return dict[val] || '-'
    },
    eType2CH (val) {
      let dict = {
        '0': '正式专家',
        '1': '预选专家'
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
    }
  },
  components: {
    VExpertDialog
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
          this.lotteryList = res.data.sort(objSort('cId'))
          this.setHeight()
        }
      })
    },
    getExpertList (arg, e) {
      if (this.loading) return
      this.loading = true
      this.listType = 'filter'
      this.searchQuery = ''
      this.pageIndex = isNumber(arg) ? arg : 1
      if (!arg || arg === 'category') this.filterQuery.sortField = null
      let _data = {}
      if (this.filterQuery.categoryId === 'eType') {
        _data = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          lotteryCategoryId: 1,
          eType: 1
        }
      } else {
        _data = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          lotteryCategoryId: this.filterQuery.categoryId || 1,
          eType: 0
        }
      }
      if (this.filterQuery.sortField) {
        _data = Object.assign(_data, {sortField: this.filterQuery.sortField, sortDesc: this.filterQuery.sortDesc})
      }
      this.$service(ExpertList.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.$refs.elTable.bodyWrapper.scrollTop = 0
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
    /**
     * @description: 根据服务器数据排序
     * @param {String} column 列状态
     */
    sortList (column, prop, order) {
      this.filterQuery.sortField = column.prop
      if (column.prop === 'eStatus') {
        this.filterQuery.sortDesc = column.order === 'ascending' ? true : column.order === 'descending' ? false : null
      } else {
        this.filterQuery.sortDesc = column.order === 'ascending' ? false : column.order === 'descending' ? true : null
      }
      this.getExpertList('sort')
    },
    searchExpertList (page) {
      if (this.loading) return
      if (this.searchQuery) {
        if (this.searchQuery.length > 50) return this.$message.warning('搜索条件不超过50字')
        this.loading = true
        this.listType = 'search'
        this.pageIndex = page || 1
        this.filterQuery.categoryId = ''
        this.$service(ExpertList.search, {
          method: 'post',
          data: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            q: this.searchQuery
          }
        }).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.list = res.data.records || []
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
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
        this.filterQuery.categoryId = 1
        this.getExpertList()
      }
    },
    /**
     * @description: 翻页，根据不同的条件，进行不同的列表查询
     * @param {Number} page 页码回调
     */
    pageChange (page) {
      switch (this.listType) {
        case 'filter':
          this.getExpertList(page)
          break
        case 'search':
          this.searchExpertList(page)
          break
      }
    },
    changeWeightColumn (data, type) {
      this.$prompt('', type === 2 ? '修改篮球权重' : '修改足球权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^-?\d{1,3}$/,
        inputErrorMessage: '-999-999之间',
        closeOnClickModal: false,
        inputValue: type === 2 ? data.basketballWeight : data.weight
      }).then(({ value }) => {
        this.$service(ExpertList.weight, {
          method: 'post',
          urlParams: {
            userId: data.userId
          },
          data: {
            lotteryCategoryId: type,
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            if (type === 2) {
              data.basketballWeight = value
            } else {
              data.weight = value
            }
            this.$message.success('修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    afficheAddPop () {
      this.formAffiche = {content: ''}
      this.dialogAffiche = true
      this.$nextTick(() => {
        this.$refs.formAffiche.clearValidate()
      })
    },
    submitAffiche (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.$service(ExpertList.afficheAdd, {
            method: 'post',
            data: {
              content: this.formAffiche.content
            }
          }).then(res => {
            if (res.code === 200) {
              this.dialogAffiche = false
              this.$message.success('公告发布成功！')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    afficheListPop () {
      this.dialogAfficheList = true
      this.afficheList = []
      this.getAfficheList()
    },
    getAfficheList (page) {
      if (this.afficheLoading) return
      this.afficheListLoading = true
      this.afficheOffset = page ? (page - 1) * this.afficheLimit : 0
      this.$service(ExpertList.afficheList, {
        urlParams: {
          offset: this.afficheOffset,
          limit: this.afficheLimit
        }
      }).then(res => {
        this.afficheListLoading = false
        if (res.code === 200) {
          this.afficheList = res.data.data || []
          this.$refs.elAfficheTable.bodyWrapper.scrollTop = 0
          this.afficheTotal = res.data.total ? res.data.total : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.afficheListLoading = false
          this.$message.error(JSON.stringify(err))
        }
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
