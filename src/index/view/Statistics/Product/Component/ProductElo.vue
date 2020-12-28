<template>
  <div class="product-elo">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.startTime"
          type="date"
          editable="false"
          min-width="100"
          placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          @change="getFilterList"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="filter.endTime"
          type="date"
          editable="false"
          placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59"
          @change="getFilterList"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getList(),getCount()">查询</el-button>
      </el-form-item>
      <el-form-item label="" v-if="count">
        总命中率：<b>{{count.totalHitRate?count.totalHitRate:'-'}}</b>；
        总盈利率：<b>{{count.totalEarningRate ? count.totalEarningRate : '-'}}</b>；
        近3天：<b>{{count.threeDaysStats || '-'}}</b>；
        近5天：<b>{{count.fiveDaysStats || '-'}}</b>；
        近7天：<b>{{count.sevenDaysStats || '-'}}</b>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="matchInfoId"
        label="比赛ID"
        min-width="140">
      </el-table-column>
      <el-table-column
        prop="competition"
        label="联赛"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="match"
        label="对阵"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="homeRatingScore"
        label="主队积分"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.homeRatingScore !== 0 ? scope.row.homeRatingScore : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="awayRatingScore"
        label="客队积分"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.awayRatingScore !== 0 ? scope.row.awayRatingScore : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="matchTime"
        label="比赛时间"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="matchStatus"
        label="状态"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.matchStatus | matchStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="finalScore"
        label="比分"
        min-width="70">
      </el-table-column>
      <el-table-column
        label="推荐"
        min-width="80">
        <template slot-scope="scope">
          <el-popover
            placement="left-end"
            width="400"
            trigger="click">
            <div class="eloInfo" v-loading="eloLoading">
              <p v-if="eloInfo && !eloInfo.isBetGoodTime"><b>{{eloInfo.notBetGoodTimeText}}</b></p>
              <elo-table-info v-if="eloInfo&&eloInfo.nowInfo" :eloInfo="eloInfo.nowInfo" title="即时"></elo-table-info>
              <elo-table-info v-if="eloInfo&&eloInfo.initInfo" :eloInfo="eloInfo.initInfo" title="初盘"></elo-table-info>
              <div v-if="!eloLoading&&!eloInfo" style="line-height:2;text-align:center;">没有数据</div>
            </div>
            <el-button slot="reference" type="text" @click.native="getEloById(scope.row.matchInfoId)">详情>></el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="红黑"
        min-width="70">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.matchStatus===3" :color="scope.row.isWin===1?'#e62121':'#333'" style="color:#fff">&nbsp;&nbsp;&nbsp;</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.showPop">
            <p>确定{{scope.row.isShow?'隐藏':'显示'}}？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.showPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="updateStatus(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" :type="scope.row.isShow?'primary':''" size="small">{{scope.row.isShow?'隐藏':'显示'}}</el-button>
          </el-popover>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="eloDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="currentPage"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      title="新建红彩指数赛事"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="110px" size="small" ref="form">
        <el-form-item
          label="赛事ID"
          prop="matchInfoId"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,30}$/, message: '整数且小于30位', trigger: ['blur', 'change']}]">
          <el-input v-model="form.matchInfoId" autocomplete="off" @change="previewMatchID" :suffix-icon="matchIdLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="matchIdPreview">
          <span>{{matchIdPreview}}</span>
        </el-form-item>
        <el-form-item
          label="理论胜赔率"
          prop="theoryWin"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+(.\d{1,2})?$/, message: '数字，最多两位小数', trigger: ['blur', 'change']}]">
          <el-input v-model="form.theoryWin" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="理论平赔率"
          prop="theoryDraw"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+(.\d{1,2})?$/, message: '数字，最多两位小数', trigger: ['blur', 'change']}]">
          <el-input v-model="form.theoryDraw" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="理论负赔率"
          prop="theoryLoss"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+(.\d{1,2})?$/, message: '数字，最多两位小数', trigger: ['blur', 'change']}]">
          <el-input v-model="form.theoryLoss" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" :loading="previewLoading" @click="previewElo()">预览</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
      <elo-table-info v-if="previewEloInfo" :eloInfo="previewEloInfo" title="方案"></elo-table-info>
    </el-dialog>
  </div>
</template>

<script>
import { StatisticsProduct } from '../../../../util/api'
import { queryMatchDetailbyId } from '../../../../util/commonQuery'
import EloTableInfo from './EloTableInfo'
export default {
  name: 'productElo',
  props: {
    visible: {
      type: 'Boolean',
      default: false
    },
    screenHeight: {
      type: 'Number'
    },
    pop: {
      type: 'Boolean',
      default: false
    }
  },
  data () {
    return {
      filter: {
        startTime: '',
        endTime: ''
      },
      list: [],
      offset: 1,
      limit: 25,
      total: 1,
      loading: false,
      tableHeight: null,
      count: null,
      eloInfo: null,
      eloLoading: false,
      form: {},
      dialogFormVisible: false,
      updateLoading: false,
      previewLoading: false,
      previewEloInfo: null,
      matchIdPreview: false,
      matchIdLoading: false
    }
  },
  computed: {
    currentPage () {
      return Math.floor(this.offset / this.limit) + 1
    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
      this.setHeight()
      this.getCount()
    }
  },
  components: {
    EloTableInfo
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      let _data = {}
      if (this.filter.startTime) {
        _data['startTime'] = this.filter.startTime
      }
      if (this.filter.endTime) {
        _data['endTime'] = this.filter.endTime
      }
      this.$service(StatisticsProduct.eloList, {
        urlParams: {
          offset: this.offset,
          limit: this.limit
        },
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.total = res.data.total || 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.setHeight()
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
    getCount () {
      let _data = {}
      if (this.filter.startTime) {
        _data['startTime'] = this.filter.startTime
      }
      if (this.filter.endTime) {
        _data['endTime'] = this.filter.endTime
      }
      this.$service(StatisticsProduct.eloCount, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.count = res.data
        }
      })
    },
    getEloById (id) {
      this.eloInfo = null
      this.eloLoading = true
      this.$service(StatisticsProduct.eloById, {
        urlParams: {
          matchInfoId: id
        }
      }).then(res => {
        this.eloLoading = false
        if (res.code === 200) {
          this.eloInfo = res.data
        }
      }, err => {
        if (err) {
          this.eloLoading = false
        }
      })
    },
    eloDel (data) {
      this.$set(data, 'loading', true)
      this.$service(StatisticsProduct.eloDel, {
        method: 'post',
        data: {
          matchInfoId: data.matchInfoId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    updateStatus (data) {
      this.$set(data, 'loading', true)
      this.$service(StatisticsProduct.eloShow, {
        method: 'post',
        data: {
          matchInfoId: data.matchInfoId,
          show: data.isShow ? 0 : 1
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.showPop = false
          this.$message.success((data.isShow ? '隐藏' : '显示') + '成功')
          data.isShow = data.isShow ? 0 : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    previewMatchID () {
      if (this.matchIdLoading || !/\d+/.test(this.form.matchInfoId)) return
      this.matchIdLoading = true
      queryMatchDetailbyId(this.form.matchInfoId).then(res => {
        this.matchIdPreview = res.homeMatchTeam.teamName + 'VS' + res.guestMatchTeam.teamName
        this.matchIdLoading = false
      }).catch(err => {
        if (err) {
          this.matchIdLoading = false
          this.matchIdPreview = '提示：无对应跳转赛事'
        }
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(StatisticsProduct.eloAdd, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.$message.success('添加成功')
              this.getList()
              this.dialogFormVisible = false
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    previewElo () {
      if (this.previewLoading) return
      this.previewLoading = true
      this.$service(StatisticsProduct.eloPreview, {
        method: 'post',
        data: this.form
      }).then(res => {
        this.previewLoading = false
        if (res.code === 200) {
          this.previewEloInfo = res.data
        } else {
          this.previewEloInfo = null
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.previewEloInfo = null
        this.previewLoading = false
        this.$message.error(JSON.stringify(err))
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.setHeight()
        this.getCount()
      }
    },
    screenHeight (val) {
      if (val) this.setHeight()
    },
    pop (val) {
      if (val) {
        this.form = {}
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    dialogFormVisible (val) {
      if (!val) {
        this.$emit('closePop')
      }
    }
  }
}
</script>
