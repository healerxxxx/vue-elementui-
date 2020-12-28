<template>
  <div class="numbersGames-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" :model="filterQuery" size="mini" :disabled="loading">
      <el-form-item>
        <el-radio-group v-model="filterQuery.gameType" @change="getNumLottery('gameType')">
          <el-radio-button label="0">全部</el-radio-button>
          <el-radio-button :label="item.cId" v-for="item in lotteryList" :key="item.cId">{{item.cName}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-table ref="elTable" :data="list" v-loading="loading" @sort-change="sortList" stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column label="ID" width="80">
        <template slot-scope="scope">
          {{scope.row.gamesId }}
        </template>
      </el-table-column>
      <el-table-column label="彩种" width="80">
        <template slot-scope="scope">
          {{scope.row.gameType | numLotteryId2CH}}
        </template>
      </el-table-column>
      <el-table-column label="开奖结果" min-width="130">
        <template slot-scope="scope">
          <span class="num-lottery-red-ball" v-show="scope.row.red" v-for="(item,index) in filterBall(scope.row.red)"
            :key="index">{{item}}</span>
          <span class="num-lottery-blue-ball" v-show="scope.row.blue" v-for="(item,index) in filterBall(scope.row.blue)"
            :key="index">{{item}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="degree" label="期数" width="90">
      </el-table-column>
      <el-table-column prop="prizeTime" label="开奖时间" width="170" show-overflow-tooltip>
        <template slot-scope="scope">
          {{[scope.row.prizeTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="售卖截止时间" width="170" show-overflow-tooltip>
        <template slot-scope="scope">
          {{[scope.row.endTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="poolMoney" label="奖金池" min-width="130">
      </el-table-column>
      <el-table-column prop="sales" label="售卖金额" min-width="130">
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template slot-scope="scope">
          {{scope.row.status | status2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="drawLottery" label="是否开奖" width="90">
        <template slot-scope="scope">
          {{scope.row.drawLottery | drawLottery2CH}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="addNumLottery(scope.row)">
          </el-button>
          <el-button type="primary" size="small" @click="numLotteryInfo(scope.row)"
            :disabled="scope.row.drawLottery === 0">开奖信息</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getNumLottery"
      :current-page.sync="Math.floor(offset/limit) + 1" :total="total" :page-size="limit" class="page-bar-reset">
    </el-pagination>
    <el-dialog title="更新数字彩" :visible.sync="numLotteryShow" width="500px" v-show="numLotteryShow"
      :close-on-click-modal="false" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="100px" size="small" ref="form">
        <el-form-item label="期数">
          <el-input :value="`${form.gameType}第${form.degree}期`" autocomplete="off" :disabled="form.gamesId"></el-input>
        </el-form-item>
        <el-form-item label="开奖时间" prop="prizeTime"
          :rules="[{required: true, message: '开奖时间不为空', trigger: ['blur', 'change']}]">
          <el-date-picker v-model="form.prizeTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="停售时间" prop="endTime"
          :rules="[{required: true, message: '停售时间不为空', trigger: ['blur', 'change']}]">
          <el-date-picker v-model="form.endTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="红球结果" prop="red"
          :rules="[{pattern: /^[0-9,，]+$/, message: '红球结果必须为数字加逗号', trigger: ['blur', 'change']}]">
          <el-input v-model="form.red" autocomplete="off"></el-input>
        </el-form-item>
        <!-- <p :style="height:12px,">列表之间必须用逗号隔开</p> -->
        <el-form-item label="蓝球列表" prop="blue"
          :rules="[{pattern: /^[0-9,，]+$/, message: '蓝球结果必须为数字加逗号', trigger: ['blur', 'change']}]">
          <el-input v-model="form.blue" autocomplete="off"
            :disabled="gameType === 102 || gameType === 104 || gameType === 105">
          </el-input>
        </el-form-item>
        <el-form-item label="售卖金额" prop="sales" :rules="[{required:true, message: '售卖金额不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/, message: '金额格式不正确', trigger: ['blur', 'change']}]">
          <el-input v-model="form.sales" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="奖金池" prop="poolMoney" :rules="[{required: true, message: '奖金池不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/, message: '奖金池格式不正确', trigger: ['blur', 'change']}]">
          <el-input v-model="form.poolMoney" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否开奖" prop="drawLottery" :rules="[{required: true}]">
          <el-radio v-model="form.drawLottery" label="1">已开奖</el-radio>
          <el-radio v-model="form.drawLottery" label="0">未开奖</el-radio>
        </el-form-item>
        <el-form-item label="状态" prop="status" :rules="[{required: true}]">
          <el-radio v-model="form.status" label="1">停用</el-radio>
          <el-radio v-model="form.status" label="0">正常</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="numLotteryShow = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="开奖信息" :visible.sync="numLotteryInfoShow" width="600px" :close-on-click-modal="false" center>
      <el-form :disabled="updateLoading" :model="infoForm" label-width="100px" size="small" ref="infoForm">
        <el-form-item label="期数">
          <el-input :value="`${infoForm.gameType}第${infoForm.degree}期`" autocomplete="off" :disabled="infoForm.gamesId">
          </el-input>
        </el-form-item>
        <el-form-item label="奖池积累" prop="poolMoney">
          <el-input v-model="infoForm.awardInfo.poolMoney.num" class="input-with-select">
            <el-select v-model="infoForm.awardInfo.poolMoney.unit" slot="append" autocomplete="off" placeholder=''>
              <el-option label="万" value="万"></el-option>
              <el-option label="亿" value="亿"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item label="本期销量" prop="sales">
          <el-input v-model="infoForm.awardInfo.sales.num" class="input-with-select" autocomplete="off">
            <el-select v-model="infoForm.awardInfo.sales.unit" slot="append" placeholder=''>
              <el-option label="万" value="万"></el-option>
              <el-option label="亿" value="亿"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item label="试机号" prop="testNum">
          <el-input v-model="infoForm.awardInfo.testNum" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="具体信息" prop="items" :rules="[{validator: itemsRule, trigger: ['blur', 'change']}]">
          <table class="expert-form-table">
            <colgroup>
              <col width="25%">
              <col width="25%">
              <col width="25%">
              <col width="15%">
            </colgroup>
            <tr>
              <td>奖等</td>
              <td>中奖注数（注）</td>
              <td>单注奖金（元）</td>
              <td>操作</td>
            </tr>
            <tr v-for="(item,index) in infoForm.awardInfo.items " :key="index">
              <td>
                <el-input style="width:80px;" v-model="item.level" ref="level"></el-input>
              </td>
              <td>
                <el-input style="width:80px;" v-model="item.betNum" ref="betNum"></el-input>
              </td>
              <td>
                <el-input style="width:80px;" v-model="item.amount" ref="amonut"></el-input>
              </td>
              <td>
                <el-button style="width:60px;" size="mini" type="primary" @click="deleteItem(index)" v-if="index != 0">
                  删除
                </el-button>
              </td>
            </tr>
          </table>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="protocolButton()">增加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="numLotteryInfoShow = false">取 消</el-button>
        <el-button type="primary" @click="submitInfoForm('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { NumLottery } from '../../util/api'
import { formatDate } from '../../util/tool'
import { mapState } from 'vuex'
const lotteryList = [
  { cName: '双色球', cId: 101 },
  { cName: '3D', cId: 102 },
  { cName: '大乐透', cId: 103 },
  { cName: '排列3', cId: 104 },
  { cName: '排列5', cId: 105 }
]
const lotteryListObj = {}
const lotteryListName = {}
lotteryList.map(item => {
  lotteryListObj[item.cId] = item.cName
  lotteryListName[item.cName] = item.cId
})
export default {
  name: 'NumLottery',
  data () {
    return {
      sortRrders: ['descending', 'ascending', null],
      offset: 0,
      limit: 20,
      numLotteryShow: false,
      total: 1,
      list: [],
      loading: false,
      filterQuery: {
        gameType: '0'
      },
      form: {
        prizeTime: null,
        endTime: null,
        status: 0,
        drawLottery: 1
      },
      infoForm: {
        awardInfo: {
          testNum: 0,
          poolMoney: {
            num: '',
            unit: '万'
          },
          sales: {
            num: '',
            unit: '万'
          },
          items: [{ level: '', betNum: '', amount: '' }]
        }
      },
      gameType: '0',
      lotteryList: lotteryList,
      updateLoading: false,
      tableHeight: null,
      numLotteryInfoShow: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getNumLottery()
    this.setHeight()
  },
  filters: {
    numLotteryId2CH (val) {
      return lotteryListObj[val] || ''
    },
    status2CH (val) {
      let dict = {
        0: '正常',
        1: '停用'
      }
      return dict[val] || '-'
    },
    drawLottery2CH (val) {
      const dict = {
        0: '未开奖',
        1: '已开奖'
      }
      return dict[val] || '-'
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    itemsRule (rule, value, callback) {
      let _level = this.$refs.level[this.infoForm.awardInfo.items.length - 1].$refs.input.value
      let _betNum = this.$refs.betNum[this.infoForm.awardInfo.items.length - 1].$refs.input.value
      let _amonut = this.$refs.amonut[this.infoForm.awardInfo.items.length - 1].$refs.input.value
      if (_level) {
        if (_betNum) {
          if (_amonut) {
            callback()
          } else {
            callback(new Error('单注奖金不可为空'))
          }
        } else {
          callback(new Error('中奖注数不可为空'))
        }
      } else {
        callback(new Error('奖等信息不可为空'))
      }
    },
    getNumLottery (page) {
      if (this.loading) return
      this.loading = true
      this.searchQuery = ''
      if (typeof page === 'number') {
        this.offset = page ? (page - 1) * this.limit : 0
      } else {
        this.offset = 0
      }
      let _data = {
        offset: this.offset,
        limit: this.limit
      }
      if (this.filterQuery.gameType !== '0') {
        _data['gameType'] = this.filterQuery.gameType
      }
      this.$service(NumLottery.list, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          res.data.data.forEach(item => {
            if (item.awardInfo) {
              item.awardInfo = JSON.parse(item.awardInfo)
            }
          })
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.total = res.data.total || 0
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
    filterBall (str) {
      return str.split(',').filter(item => item !== '')
    },
    addNumLottery (form) {
      this.gameType = form.gameType
      this.form = {
        gamesId: form.gamesId,
        red: form.red,
        blue: form.blue,
        sales: form.sales,
        poolMoney: form.poolMoney,
        status: form.status,
        drawLottery: form.drawLottery,
        prizeTime: form.prizeTime,
        endTime: form.endTime
      }
      if (form) {
        this.form.status = form.status + ''
        this.form.drawLottery = form.drawLottery + ''
        if (form.prizeTime) this.form.prizeTime = this.dateFormat(form.prizeTime)
        if (form.endTime) this.form.endTime = this.dateFormat(form.endTime)
        this.form.gameType = lotteryListObj[form.gameType] || ''
        this.form.degree = form.degree
      }
      this.numLotteryShow = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    dateFormat (date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          const data = { ...this.form }
          delete data.gameType
          data.red = this.filterBall(data.red.replace(/，/g, ',')).join(',')
          data.blue = this.filterBall(data.blue.replace(/，/g, ',')).join(',')
          this.$service(NumLottery.add, {
            method: 'post',
            data: data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.numLotteryShow = false
              this.$message.success('数字彩更新成功')
              this.getNumLottery()
            } else {
              this.$message.error(res.message)
            }
          }, err => {
            if (err) {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            }
          })
        }
      })
    },
    protocolButton () {
      this.$set(this.infoForm.awardInfo.items, this.infoForm.awardInfo.items.length, { level: '', betNum: '', amount: '' })
      this.$refs.infoForm.clearValidate()
    },
    deleteItem (i) {
      this.infoForm.awardInfo.items.splice(i, 1)
    },
    numLotteryInfo (form) {
      this.gameType = form.gameType
      this.infoForm = {
        gamesId: form.gamesId,
        awardInfo: {
          poolMoney: {
            num: '',
            unit: '万'
          },
          sales: {
            num: '',
            unit: '万'
          },
          items: [{ level: '', betNum: '', amount: '' }]
        }
      }
      if (form) {
        this.infoForm.degree = form.degree
        this.infoForm.gameType = lotteryListObj[form.gameType] || ''
      }
      if (form.awardInfo.poolMoney) {
        this.infoForm.awardInfo.poolMoney.num = form.awardInfo.poolMoney.num
        this.infoForm.awardInfo.poolMoney.unit = form.awardInfo.poolMoney.unit
      }
      if (form.awardInfo.sales) {
        this.infoForm.awardInfo.sales.num = form.awardInfo.sales.num
        this.infoForm.awardInfo.sales.unit = form.awardInfo.sales.unit
      }
      if (form.awardInfo.items) {
        form.awardInfo.items.forEach((item, index) => {
          this.$set(this.infoForm.awardInfo.items, index, { level: '', betNum: '', amount: '' })
          this.infoForm.awardInfo.items[index].level = item.level
          this.infoForm.awardInfo.items[index].betNum = item.betNum
          this.infoForm.awardInfo.items[index].amount = item.amount
        })
      }
      if (form.awardInfo.testNum) {
        this.infoForm.awardInfo.testNum = form.awardInfo.testNum
      }
      this.numLotteryInfoShow = true
      this.$nextTick(() => {
        this.$refs.infoForm.clearValidate()
      })
    },
    submitInfoForm (form) {
      this.$refs['infoForm'].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          const data = { ...this.infoForm }
          if (!data.testNum) delete data.testNum
          data.awardInfo = JSON.stringify(data.awardInfo)
          delete data.gamesId
          data.gameType = lotteryListName[data.gameType]
          this.$service(NumLottery.updateAwardInfo, {
            method: 'post',
            data: data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.numLotteryInfoShow = false
              this.$message.success('开奖信息更新成功')
              this.getNumLottery()
            } else {
              this.$message.error(res.message)
            }
          }, err => {
            if (err) {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            }
          })
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

<style lang='scss'>
.expert-form-table {
  width: 100%;
  td {
    padding: 5px 6px;
    border: 1px solid #dcdfe6;
  }
}
.input-with-select {
  .el-input-group__append {
    width: 25px;
    background: #fff;
  }
}
</style>
