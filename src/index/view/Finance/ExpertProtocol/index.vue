<template>
  <div class="finance-exportProtocol">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form ref="form" size="mini" :inline="true" :disabled="loading">
      <el-form-item label="专家姓名">
        <el-input v-model="filter.expertName" clearable style="width:140px;"></el-input>
      </el-form-item>
      <el-form-item label="协议状态">
        <el-select v-model="filter.protocolStatus" style="width: 90px">
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="1"></el-option>
          <el-option label="终止" value="0"></el-option>
          <el-option label="待确认" value="-1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filter.protocolUserType" style="width: 120px">
          <el-option label="红彩专家" :value="0"></el-option>
          <el-option label="彩票站地推" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="filterList">筛选</el-button>
        <el-button type="danger" @click="exportList">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" stripe v-loading="loading" :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="expertName" label="专家姓名" min-width="120">
      </el-table-column>
      <el-table-column prop="expertNickName" label="专家昵称" min-width="130">
      </el-table-column>
      <el-table-column prop="idCard" label="身份证号" min-width="100">
      </el-table-column>
      <el-table-column prop="neteaseAccount" label="网易宝账号" min-width="180">
      </el-table-column>
      <el-table-column prop="divideRate" label="分成比例" width="100">
        <template slot-scope="scope">
          <el-input v-show="scope.row.protocolStatus==-1" v-model="scope.row.FormatterDivideRate" size="mini"
            style="width: 60px;" maxlength="3"></el-input>
          <span v-show="scope.row.protocolStatus==-1">%</span>
          <span v-if="scope.row.protocolStatus!==-1">{{scope.row.divideRate | toPercent}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="协议起始日" width="155">
        <template slot-scope="scope">
          <el-date-picker class="date-input" v-model="scope.row.startTime" type="date" placeholder="选择日期"
            value-format="yyyy.MM.dd" size="small" style="width:135px;" v-show="scope.row.protocolStatus==-1">
          </el-date-picker>
          <span v-if="scope.row.protocolStatus!==-1">{{scope.row.startTime}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="协议终止日" width="155">
        <template slot-scope="scope">
          <el-date-picker class="date-input" v-model="scope.row.endTime" type="date" value-format="yyyy.MM.dd"
            placeholder="选择日期" size="mini" style="width:135px;"
            v-show="scope.row.protocolStatus==-1 || scope.row.isEdit">
          </el-date-picker>
          <span v-if="scope.row.protocolStatus!==-1 && !scope.row.isEdit">{{scope.row.endTime}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="protocolStatus" label="协议状态" width="100">
        <template slot-scope="scope">
          <el-select v-model="scope.row.FormatterProtocolStatus"
            v-show="scope.row.protocolStatus==-1 || scope.row.isEdit" size="mini" style="width:90px;" placeholder="请选择">
            <el-option label="正常" value="1"></el-option>
            <el-option label="终止" value="0"> </el-option>
            <!-- <el-option label="待确认" value="-1"></el-option> -->
          </el-select>
          <span
            v-if="scope.row.protocolStatus!==-1 && !scope.row.isEdit">{{scope.row.protocolStatus===1?'正常':scope.row.protocolStatus===0?'终止':'待确认'}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="protocolStatus" label="财务确认" min-width="100">
        <template slot-scope="scope">
          <el-button v-if="scope.row.protocolStatus===-1" type="primary" size="mini"
            @click="confirmProtocolList(scope.row)">确认</el-button>
          <span v-if="scope.row.protocolStatus!==-1">{{scope.row.financeName}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="financeTime" label="确认时间" min-width="100">
        <template slot-scope="scope">
          {{scope.row.protocolStatus!==-1 ? scope.row.financeTime : ''}}
        </template>
      </el-table-column>
      <el-table-column label="财务修改" width="180">
        <template slot-scope="scope">
          <el-button v-if="scope.row.protocolStatus!==-1" type="primary" size="mini" @click="editProtocol(scope.row)">
            {{scope.row.isEdit?'保存':'修改'}}</el-button>
          <el-button v-if="scope.row.isEdit" type="primary" size="mini" @click="cancelEdit(scope.row)">取消</el-button>
          <el-popover placement="left" width="500" v-if="scope.row.protocolStatus!==-1" v-model="scope.row.bindPop">
            <el-table :data="updateLog" v-loading="logLoading" size="mini">
              <el-table-column prop="operationTime" width="90px;" label="操作时间">
              </el-table-column>
              <el-table-column prop="divideRate" width="80px;" label="分成比例">
                <template slot-scope="scope">
                  {{scope.row.divideRate | toPercent}}
                </template>
              </el-table-column>
              <el-table-column prop="endTime" width="110px;" label="协议终止时间">
              </el-table-column>
              <el-table-column prop="protocolStatus" width="80px;" label="协议状态">
                <template slot-scope="scope">
                  {{scope.row.protocolStatus===-1?'待确认':scope.row.protocolStatus===1?'正常':"终止"}}
                </template>
              </el-table-column>
              <el-table-column prop="userName" label="操作人">
              </el-table-column>
            </el-table>
            <i class="el-icon-info" slot="reference" @click="getUpdateLog(scope.row)"
              style="font-size: 20px;vertical-align:middle"></i>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" page-size="pageSize"
      :current-page.sync="pageIndex" :page-count="pageCount" class="page-bar-reset"></el-pagination>
  </div>
</template>
<script>
import { financeExpertProtocol } from '../../../util/api'
import { arraySome } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'FinanceExpertProtocol',
  data () {
    return {
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      list: [],
      updateLog: [],
      logLoading: false,
      filter: {
        protocolStatus: '',
        expertName: '',
        protocolUserType: 0
      },
      filterQuery: null
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    protocolConfirmAuth: function () {
      return arraySome([33, 39], this.$store.state.userInfo.roleList)
    }
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    filterList () {
      let _data = {
        protocolUserType: this.filter.protocolUserType
      }
      if (this.filter.protocolStatus !== '') _data['protocolStatus'] = this.filter.protocolStatus
      if (this.filter.expertName) _data['expertName'] = this.filter.expertName
      this.filterQuery = _data
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(financeExpertProtocol.list, {
        method: 'get',
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        params: this.filterQuery
      }).then(
        res => {
          this.loading = false
          if (res.code === 200) {
            this.$refs.elTable.bodyWrapper.scrollTop = 0
            this.pageCount = res.data.page.pageCount || 1
            res.data.records.forEach(item => {
              item.isEdit = false
              item.FormatterDivideRate = (item.divideRate * 100).toFixed(0)
              item.FormatterProtocolStatus = item.protocolStatus === -1 ? '1' : item.protocolStatus.toString()
            })
            this.list = res.data.records || []
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    confirmProtocolList (row) {
      if (row.FormatterDivideRate > 100) {
        return this.$message.error('分成比例只能是0-100的整数')
      }
      this.$service(financeExpertProtocol.confirm, {
        method: 'post',
        urlParams: {
          protocolId: row.protocolId
        },
        params: {
          divideRate: row.FormatterDivideRate / 100,
          endTime: row.endTime,
          protocolStatus: row.FormatterProtocolStatus,
          startTime: row.startTime
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.$message('确认成功')
            this.getList()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    editProtocol (row) {
      if (row.isEdit) {
        this.saveEdit(row)
      } else {
        row.isEdit = !row.isEdit
      }
    },
    cancelEdit (row) {
      row.isEdit = false
    },
    saveEdit (row) {
      this.$service(financeExpertProtocol.edit, {
        method: 'post',
        urlParams: {
          protocolId: row.protocolId
        },
        params: {
          endTime: row.endTime,
          protocolStatus: row.FormatterProtocolStatus
        }
      }).then(
        res => {
          if (res.code === 200) {
            this.getList()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    getUpdateLog (row) {
      if (this.logLoading) return
      this.logLoading = true
      this.$service(financeExpertProtocol.updateLog, {
        method: 'get',
        urlParams: {
          protocolId: row.protocolId
        }
      }).then(
        res => {
          this.logLoading = false
          if (res.code === 200) {
            this.updateLog = res.data
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        },
        err => {
          this.logLoading = false
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        }
      )
    },
    exportList () {
      if (this.list.length === 0) {
        return this.$message('暂无相关数据')
      }
      let query = ''
      for (const key in this.filterQuery) {
        if (this.filterQuery[key] !== '') {
          query = `${query}&${key}=${this.filterQuery[key]}`
        }
      }
      if (query.length) query = '?' + query.slice(1)
      let downloadUrl = location.origin + financeExpertProtocol.export + query
      window.open(downloadUrl)
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
