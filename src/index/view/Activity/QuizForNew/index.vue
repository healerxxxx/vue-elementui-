<template>
  <div class="activity-quiz">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" @click="quizPop()">新建场次</el-button>
      </div>
    </div>
    <table class="quiz-table">
      <tr>
        <td class="bg-fa">拉新总数：</td>
        <td>{{quizTopCount.totalNewUser || 0}}</td>
        <td class="bg-fa">拉新总成本：</td>
        <td>{{quizTopCount.totalCost || 0}}</td>
        <td class="bg-fa">上周拉新总数：</td>
        <td>{{quizTopCount.lastWeekNewUser || 0}}</td>
      </tr>
      <tr>
        <td class="bg-fa">上周拉新总成本：</td>
        <td>{{quizTopCount.lastWeekCount || 0}}</td>
        <td class="bg-fa">上月拉新总数：</td>
        <td>{{quizTopCount.lastMonthNewUser || 0}}</td>
        <td class="bg-fa">上月拉新总成本：</td>
        <td>{{quizTopCount.lastMonthCost || 0}}</td>
      </tr>
    </table>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :row-key="getRowKeys"
      :expand-row-keys="expands"
      :max-height="tableHeight<400?400:tableHeight"
      @row-click="countExpand"
      @expand-change="countExpand">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table
            :data="props.row.count"
            :show-header="false"
            v-loading="props.row.countLoading">
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">当前投注总用户数(含机器人)：{{scope.row.currentUser}}</span>
                <span v-else>{{props.row.count.length===3?scope.$index===1?'主胜 | ':'客胜 | ':''}}当前机器人数：{{scope.row.robot}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">当前总机器人数：{{scope.row.robot}}</span>
                <span v-else>当前投注老用户数：{{scope.row.oldUser}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">当前总投注老用户数：{{scope.row.oldUser}}</span>
                <span v-else>当前投注新用户数：{{scope.row.newUser}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">当前总投注新用户数：{{scope.row.newUser}}</span>
                <span v-else>当前奖励倍数：{{scope.row.currentOdds}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="props.row.count.length === 1"
              prop="">
              <template slot-scope="scope">
                <span>当前奖励倍数：{{scope.row.currentOdds}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="props.row.count.length === 1"
              prop="">
              <template slot-scope="scope">
                <span>最终奖励倍数： {{scope.row.maxOdds}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">最终结果：{{scope.row.settlementStr}}</span>
                <span v-else>最终奖励倍数：{{scope.row.maxOdds}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">投注总额：{{scope.row.totalFlowAmount}}</span>
                <span v-else>最终结果：{{scope.row.settlementStr}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="">
              <template slot-scope="scope">
                <span v-if="scope.$index===0">返奖总额： {{scope.row.totalNetReturn}}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        prop="subjectQuizId"
        label="拉新竞猜ID"
        width="100">
      </el-table-column>
      <el-table-column
        prop="quizType"
        label="类型"
        width="120">
        <template slot-scope="scope">
          <span>{{quizType[scope.row.quizType] || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="quizName"
        label="题目名/赛事对阵"
        min-width="130">
      </el-table-column>
      <el-table-column
        label="选项名"
        width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.selectionVoList" :key="index"><b v-if="index!==0"> | </b>{{item.selectionName}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="初始倍数"
        width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.selectionVoList" :key="index"><b v-if="index!==0"> | </b>{{item.initialOdds}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="最高倍数"
        width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.selectionVoList" :key="index"><b v-if="index!==0"> | </b>{{item.maxOdds}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="新用户占比"
        width="100">
        <template slot-scope="scope">
          {{scope.row.newUserRatio | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        label="最高投注人数"
        width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.selectionVoList" :key="index"><b v-if="index!==0"> | </b>{{item.maxUser}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="maxCredit"
        label="最高投注限额"
        width="120">
      </el-table-column>
      <el-table-column
        prop="validTime"
        label="投注截止时间"
        width="140">
      </el-table-column>
      <el-table-column
        prop="lotteryTime"
        label="开奖时间"
        width="140">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template slot-scope="scope">
          <span>{{quizStatus[scope.row.status] || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="settlement"
        label="开奖结果"
        width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.selectionVoList" :key="index"><b v-if="index!==0"> | </b>{{item.status===1?'未开奖':quizSettlementCH[item.settlement]}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="60">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="+人"
        min-width="170">
        <template slot-scope="scope">
          <div v-if="scope.row.status===1">
            <div v-for="(item, index) in scope.row.selectionVoList" :key="index" >
              <el-button type="text" size="mini" @click.stop="robot(item, 1)">{{scope.row.selectionVoList.length>1?item.selectionName:''}}+新</el-button><i></i>
              <el-button type="text" size="mini" @click.stop="robot(item, 1)">{{scope.row.selectionVoList.length>1?item.selectionName:''}}+老</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="230">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.status===2"
            placement="left"
            v-model="scope.row.settlementPop">
            <p>确定结算？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.settlementPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="settlement(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" size="mini" @click.stop>结算</el-button>
          </el-popover>
          <el-popover
            v-if="scope.row.status<3"
            placement="left"
            v-model="scope.row.refundPop">
            <p>确定退单？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.refundPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="refund(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" v-if="scope.row.status<3" type="primary" size="mini" @click.stop>退单</el-button>
          </el-popover>
          <el-button v-if="scope.row.status === 1" type="danger" icon="el-icon-edit" circle size="small" @click.stop="quizPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="quizDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"  @click.stop></el-button>
          </el-popover>
          <el-switch
            v-model="scope.row.showStatus"
            :disabled="scope.row.statusLoading"
            :active-value= "0"
            :inactive-value= "1"
            @click.native.stop="switchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(offset/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.subjectQuizId?'修改活动':'新建活动'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="120px" size="small" ref="form">
        <el-form-item label="活动类型" prop="quizType">
          <el-select v-model="form.quizType" :disabled="form.subjectQuizId">
            <el-option :label="value" :value="key" v-for="(value, key) in quizType" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目名" prop="quizName" v-show="parseInt(form.quizType)===1"
          :rules="[{required: parseInt(form.quizType)===1, message: '不为空', trigger: ['blur', 'change']},
          {max:30, message: '最多30个字符,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.quizName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赛事ID" prop="matchInfoId" v-show="parseInt(form.quizType)!==1"
          :rules="[{required: parseInt(form.quizType)!==1, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: 'ID必须为数字,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.matchInfoId" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''" :disabled="form.subjectQuizId"></el-input>
        </el-form-item>
        <el-form-item v-if="matchPreview">
          <span>{{matchPreview}}</span>
        </el-form-item>
        <el-form-item label="选择项" v-show="parseInt(form.quizType)===2 && matchPreview" prop="selectionTeamId" :rules="{required: parseInt(form.quizType)===2, message: '不为空', trigger: ['blur', 'change']}">
          <el-radio v-model="form.selectionTeamId" :label="quizMatch.homeMatchTeam.teamId" :disabled="form.subjectQuizId">主胜</el-radio>
          <el-radio v-model="form.selectionTeamId" :label="quizMatch.guestMatchTeam.teamId" :disabled="form.subjectQuizId">客胜</el-radio>
        </el-form-item>
        <el-form-item
          :label="(parseInt(form.quizType)===3?'主胜':'')+'选项名'"
          prop="selectionName"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max:10, message: '最多10个字符,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.selectionName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="客胜选项名"
          prop="away_selectionName"
          v-show="parseInt(form.quizType)===3"
          :rules="[{required: parseInt(form.quizType)===3, message: '不为空', trigger: ['blur', 'change']},
          {max:10, message: '最多10个字符,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.away_selectionName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          :label="(parseInt(form.quizType)===3?'主胜':'')+'初始倍数'"
          prop="initialOdds"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^(\d|10|\d\.\d{1,2})$/, message: '0-10数字，最多2位小数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.initialOdds" autocomplete="off" :disabled="form.subjectQuizId"></el-input>
        </el-form-item>
        <el-form-item
          label="客胜初始倍数"
          prop="away_initialOdds"
          v-show="parseInt(form.quizType)===3"
          :rules="[{required: parseInt(form.quizType)===3, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^(\d|10|\d\.\d{1,2})$/, message: '0-10数字，最多2位小数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.away_initialOdds" autocomplete="off" :disabled="form.subjectQuizId"></el-input>
        </el-form-item>
        <el-form-item
          :label="(parseInt(form.quizType)===3?'主胜':'')+'最高倍数'"
          prop="maxOdds"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^(\d|10)$/, message: '0-10内整数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.maxOdds" autocomplete="off" :disabled="form.subjectQuizId"></el-input>
        </el-form-item>
        <el-form-item
          label="客胜最高倍数"
          prop="away_maxOdds"
          v-show="parseInt(form.quizType)===3"
          :rules="[{required: parseInt(form.quizType)===3, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^(\d|10)$/, message: '0-10内整数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.away_maxOdds" autocomplete="off" :disabled="form.subjectQuizId"></el-input>
        </el-form-item>
        <el-form-item
          :label="(parseInt(form.quizType)===3?'主胜':'')+'最高投注数'"
          prop="maxUser"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,9}$/, message: '0-999999999内整数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.maxUser" autocomplete="off" style="width:150px;"></el-input> 人
        </el-form-item>
        <el-form-item
          label="客胜最高投注数"
          prop="away_maxUser"
          v-show="parseInt(form.quizType)===3"
          :rules="[{required: parseInt(form.quizType)===3, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,9}$/, message: '0-999999999内整数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.away_maxUser" autocomplete="off" style="width:150px;"></el-input> 人
        </el-form-item>
        <el-form-item
          label="新用户占比"
          prop="newUserRatio"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^(\d{1,2}|100)$/, message: '0-100内整数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.newUserRatio" autocomplete="off" style="width:150px;"></el-input> %
        </el-form-item>
        <el-form-item
          label="最高投注限额"
          prop="maxCredit"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^(\d{1,4}|10000)$/, message: '0-10000内整数,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.maxCredit" autocomplete="off" style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item label="投注截止" prop="validTime" :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-date-picker
            v-model="form.validTime"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now()
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="开奖时间" prop="lotteryTime" :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-date-picker
            v-model="form.lotteryTime"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now()
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="开奖结果" v-show="parseInt(form.quizType)===1" prop="settlement" :rules="{required: parseInt(form.quizType)===1, message: '不为空', trigger: ['blur', 'change']}">
          <el-radio v-model="form.settlement" label="1">中</el-radio>
          <el-radio v-model="form.settlement" label="2">不中</el-radio>
        </el-form-item>
        <el-form-item label="状态" prop="showStatus">
          <el-select v-model="form.showStatus">
            <el-option label="上线" value="0"></el-option>
            <el-option label="下线" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ActivityQuizForNew } from '../../../util/api'
import { queryMatchDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'activityQuizForNew',
  data () {
    return {
      loading: false,
      offset: 0,
      limit: 20,
      total: 1,
      quizTopCount: {},
      list: [],
      quizType: {
        '1': '题目式竞猜',
        '2': '单选项赛事竞猜',
        '3': '双选项赛事竞猜'
      },
      quizStatus: {
        '1': '售卖中',
        '2': '截止',
        '3': '结算',
        '4': '退豆'
      },
      quizSettlementCH: {
        '0': '未开奖',
        '1': '中',
        '2': '未中'
      },
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      updateLoading: false,
      matchPreview: '',
      quizMatch: {
        homeMatchTeam: {
          teamId: ''
        },
        guestMatchTeam: {
          teamId: ''
        }
      },
      previewLoading: false,
      expands: []
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getQuizCount()
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getRowKeys (row) {
      return row.subjectQuizId
    },
    getQuizCount () {
      this.$service(ActivityQuizForNew.count).then(res => {
        if (res.code === 200) this.quizTopCount = res.data
      })
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      this.$service(ActivityQuizForNew.list, {
        params: {
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.expands = []
          this.list = res.data.data || []
          this.total = res.data.total || 1
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    countExpand (row, column) {
      if (column.length === 0) {
        this.expands = []
        return
      }
      if (this.expands.indexOf(row.subjectQuizId) > -1) return
      this.expands = [row.subjectQuizId]
      this.$set(row, 'countLoading', true)
      this.$set(row, 'count', [])
      this.$service(ActivityQuizForNew.countById, {
        params: {
          subjectQuizId: row.subjectQuizId
        }
      }).then(res => {
        row.countLoading = false
        if (res.code === 200) {
          let _data = []
          if (res.data.length === 2) {
            _data = [res.data[0]]
            _data[0]['currentOdds'] = res.data[1].currentOdds
            _data[0]['maxOdds'] = res.data[1].currentOdds
            _data[0]['settlementStr'] = res.data[1].settlementStr
          } else {
            _data = res.data
          }
          this.$set(row, 'count', _data)
        }
      })
    },
    previewID () {
      this.matchPreview = ''
      this.quizMatch = {
        homeMatchTeam: {
          teamId: ''
        },
        guestMatchTeam: {
          teamId: ''
        }
      }
      if (parseInt(this.form.quizType) === 1 || !/^\d+$/.test(this.form.matchInfoId) || this.previewLoading) return Promise.resolve()
      this.previewLoading = true
      return queryMatchDetailbyId(this.form.matchInfoId).then(res => {
        this.previewLoading = false
        this.matchPreview = res.homeMatchTeam.teamName + 'VS' + res.guestMatchTeam.teamName
        this.quizMatch = res
        return Promise.resolve()
      }).catch(err => {
        if (err) {
          this.previewLoading = false
          this.$message.error(err)
        }
      })
    },
    quizPop (data) {
      this.matchPreview = ''
      this.form = Object.assign({
        lotteryTime: '',
        matchInfoId: '',
        maxCredit: '',
        newUserRatio: '',
        quizName: '',
        settlement: '',
        validTime: '',
        quizType: '2',
        showStatus: '0',
        selectionName: '',
        selectionTeamId: '',
        initialOdds: '',
        maxOdds: '',
        maxUser: '',
        quizSelectionId: '',
        away_selectionName: '',
        away_initialOdds: '',
        away_maxOdds: '',
        away_maxUser: '',
        away_quizSelectionId: ''
      }, data || {})
      if (data) {
        this.previewID().then(() => {
          this.form.quizType = data.quizType + ''
          this.form.showStatus = data.showStatus + ''
          this.form['newUserRatio'] = Math.round(data.newUserRatio * 100)
          let _selectionData = data.selectionVoList
          if (_selectionData.length <= 1) {
            this.form['selectionName'] = _selectionData[0].selectionName
            this.form['selectionTeamId'] = _selectionData[0].teamId
            this.form['initialOdds'] = _selectionData[0].initialOdds
            this.form['maxOdds'] = _selectionData[0].maxOdds
            this.form['maxUser'] = _selectionData[0].maxUser
            this.form['quizSelectionId'] = _selectionData[0].quizSelectionId
            if (_selectionData[0].settlement) {
              this.form['settlement'] = _selectionData[0].settlement + ''
            }
          } else {
            if (this.quizMatch.homeMatchTeam.teamId === _selectionData[0].teamId) {
              this.form['selectionName'] = _selectionData[0].selectionName
              this.form['initialOdds'] = _selectionData[0].initialOdds
              this.form['maxOdds'] = _selectionData[0].maxOdds
              this.form['maxUser'] = _selectionData[0].maxUser
              this.form['quizSelectionId'] = _selectionData[0].quizSelectionId
              this.form['away_selectionName'] = _selectionData[1].selectionName
              this.form['away_initialOdds'] = _selectionData[1].initialOdds
              this.form['away_maxOdds'] = _selectionData[1].maxOdds
              this.form['away_maxUser'] = _selectionData[1].maxUser
              this.form['away_quizSelectionId'] = _selectionData[1].quizSelectionId
            } else {
              this.form['selectionName'] = _selectionData[1].selectionName
              this.form['initialOdds'] = _selectionData[1].initialOdds
              this.form['maxOdds'] = _selectionData[1].maxOdds
              this.form['maxUser'] = _selectionData[1].maxUser
              this.form['quizSelectionId'] = _selectionData[1].quizSelectionId
              this.form['away_selectionName'] = _selectionData[0].selectionName
              this.form['away_initialOdds'] = _selectionData[0].initialOdds
              this.form['away_maxOdds'] = _selectionData[0].maxOdds
              this.form['away_maxUser'] = _selectionData[0].maxUser
              this.form['away_quizSelectionId'] = _selectionData[0].quizSelectionId
            }
          }
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs.form.clearValidate()
          })
        })
      } else {
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {
            lotteryTime: this.form.lotteryTime + ':00',
            matchInfoId: this.form.matchInfoId || '',
            maxCredit: this.form.maxCredit,
            newUserRatio: this.form.newUserRatio,
            quizName: this.form.quizName || '',
            quizType: this.form.quizType,
            settlement: this.form.settlement || '',
            showStatus: this.form.showStatus,
            validTime: this.form.validTime + ':00'
          }
          if (this.form.subjectQuizId) _data['subjectQuizId'] = this.form.subjectQuizId
          if (this.form.quizType === '3') {
            _data['selectionList'] = JSON.stringify([{
              selectionName: this.form.selectionName,
              initialOdds: this.form.initialOdds,
              maxOdds: this.form.maxOdds,
              maxUser: this.form.maxUser,
              teamId: this.quizMatch.homeMatchTeam.teamId,
              quizSelectionId: this.form.quizSelectionId || ''
            },
            {
              selectionName: this.form.away_selectionName,
              initialOdds: this.form.away_initialOdds,
              maxOdds: this.form.away_maxOdds,
              maxUser: this.form.away_maxUser,
              teamId: this.quizMatch.guestMatchTeam.teamId,
              quizSelectionId: this.form.away_quizSelectionId || ''
            }])
          } else {
            _data['selectionList'] = JSON.stringify([{
              selectionName: this.form.selectionName,
              initialOdds: this.form.initialOdds,
              maxOdds: this.form.maxOdds,
              maxUser: this.form.maxUser,
              teamId: this.form.selectionTeamId,
              quizSelectionId: this.form.quizSelectionId || ''
            }])
          }
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(this.form.subjectQuizId ? ActivityQuizForNew.update : ActivityQuizForNew.add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              if (this.form.subjectQuizId) this.offset = 0
              this.getList(Math.floor(this.offset / this.limit) + 1, !!this.form.subjectQuizId)
              this.$message.success((this.form.subjectQuizId ? '更新' : '添加') + '成功')
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
    settlement (data) {
      this.$set(data, 'loading', true)
      this.$service(ActivityQuizForNew.settlement, {
        method: 'post',
        data: {
          subjectQuizId: data.subjectQuizId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.settlementPop = false
          this.$message.success('结算成功')
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    refund (data) {
      this.$set(data, 'loading', true)
      this.$service(ActivityQuizForNew.refund, {
        method: 'post',
        data: {
          subjectQuizId: data.subjectQuizId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.refundPop = false
          this.$message.success('退单成功')
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    quizDel (data) {
      this.$set(data, 'loading', true)
      this.$service(ActivityQuizForNew.del, {
        method: 'post',
        data: {
          subjectQuizId: data.subjectQuizId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        subjectQuizId: data.subjectQuizId,
        showStatus: data.showStatus
      }
      this.$service(ActivityQuizForNew.status, {
        method: 'post',
        data: _data
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.statusLoading = false
          this.$message.success('状态更新成功')
        } else {
          data.statusLoading = false
          this.$set(data, 'showStatus', data.showStatus ? 0 : 1)
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'showStatus', data.showStatus ? 0 : 1)
        this.$message.error(JSON.stringify(err))
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
        this.$service(ActivityQuizForNew.weight, {
          method: 'post',
          data: {
            subjectQuizId: data.subjectQuizId,
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList(Math.floor(this.offset / this.limit) + 1, true)
            this.$message.success('权重修改成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    robot (data, isNew) {
      this.$prompt('', data.selectionName + '添加(' + (isNew ? '新用户' : '老用户') + ')机器人', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[1-9]\d{0,7}$/,
        inputErrorMessage: '1-99999999之间',
        closeOnClickModal: false,
        inputValue: ''
      }).then(({ value }) => {
        this.$service(ActivityQuizForNew.robot, {
          method: 'post',
          data: {
            isNewUser: isNew,
            quizSelectionId: data.quizSelectionId,
            robot: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('机器人添加成功')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
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

<style lang="scss">
.quiz-table {
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
  }
}
</style>
