<template>
  <div class="activity-draw-lottery">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" v-if="showInit" @click="initPop()">赛事初始化</el-button>
        <el-button type="primary" size="small" v-if="showInit" @click="testPop()">抽奖测试</el-button>
        <el-button type="primary" size="small" @click="newPop()">新建活动</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="drawLotteryManageId"
        label="活动ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="activityTitle"
        label="赛事名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="chatOpenTime"
        label="聊天室开放时间"
        min-width="160">
        <template slot-scope="scope">
          {{[scope.row.chatOpenTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="activityId"
        label="赛事ID"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="recHomePage"
        label="是否推荐到首页"
        min-width="130">
        <template slot-scope="scope">
          {{scope.row.recHomePage?'是':'否'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="210">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.drawLotteryStatus"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="activeDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="newPop(scope.row)"></el-button>
          <el-button type="primary" size="mini" @click="newPop(scope.row, true)">复制</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      :page-size="pageSize"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.drawLotteryManageId?'修改活动':'新建活动'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="800px" center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        size="mini"
        ref="form">
        <el-form-item
          prop="activityId"
          :rules="[{required: true, message: '赛事ID必填', trigger: ['blur']},
          {pattern: /^\d+$/, message: '赛事ID必须为数字', trigger: ['blur']}]">
          <el-row :gutter="20">
            <el-col :span="4" style="text-align:right">关联赛事ID</el-col>
            <el-col :span="20">
              <el-input @change="getMatchInfo(form)" v-model="form.activityId" style="width:200px;" :disabled="form.drawLotteryManageId" autocomplete="off" />
              <span v-if="form.match">{{form.match}}</span>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          prop="recHomePageTemp">
          <el-row :gutter="20">
            <el-col :span="4" style="text-align:right">推荐到首页</el-col>
            <el-col :span="20">
              <el-checkbox v-model="form.recHomePageTemp">{{form.recHomePageTemp?'是':'否'}}</el-checkbox>
              <el-button type="primary"
                v-if="form.drawLotteryManageId && form.recHomePage !== form.recHomePageTemp"
                @click.prevent="updateRecHomePage">更新</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-row :gutter="20" style="margin-top:15px" v-for="(value, key) in form.list" :key="key">
          <el-col :span="6"><b style="font-size:16px; color:#ff2222;">{{activityTypeList[key]}}抽奖:</b></el-col>
          <el-col :span="24" style="margin-top:15px">
            <el-form-item
              v-for="(item, index) in value"
              :key="index"
              :prop="key + index + ''"
              :rules="{validator: listRules, trigger: ['change', 'blur']}">
              <el-select
                style="width:100px;"
                :ref="'productTypeList' + key + index"
                v-model="item.productTypeTemp"
                :disabled="item.productTypeTemp === '0' || item.productTypeTemp === '3'"
                @change="getLotteryInfoAnsy(item)"
                placeholder="请选择">
                <el-option
                  v-for="(_value, _key) in productTypeList"
                  :disabled="_key === '0' || _key === '3'"
                  :key="_key"
                  :label="_value"
                  :value="_key" />
              </el-select>
              <span>ID:</span>
              <el-input
                v-model="item.productIdTemp"
                :disabled="item.productTypeTemp === '0'"
                style="width:110px;"
                :ref="'productIdList' + key + index"
                @change="getLotteryInfoAnsy(item)"
                @blur="getLotteryInfoAnsy(item)"
                :suffix-icon="item.loading ? 'el-icon-loading' : ''" />
              <span>中奖几率:</span>
              <el-input
                :ref="'probabilityList' + key + index"
                v-model="item.probabilityTemp"
                style="width:80px;" />
              <span v-show="item.productTypeTemp !== '0'">最大发放:</span>
              <el-input
                v-show="item.productTypeTemp !== '0'"
                :ref="'maxLimitList' + key + index"
                v-model="item.maxLimitTemp"
                style="width:80px;" />
              <span>位置:</span>
              <el-input
                :ref="'positionList' + key + index"
                v-model="item.positionTemp"
                style="width:60px;" />
              <el-button type="primary"
                v-if="form.drawLotteryManageId && (item.productType !== item.productTypeTemp || item.productId !== parseInt(item.productIdTemp) || item.probability !== parseFloat(item.probabilityTemp) || item.maxLimit !== parseInt(item.maxLimitTemp) || item.position !== parseInt(item.positionTemp))"
                @click.prevent="clickLotteryId(item, key, form.drawLotteryManageId)">{{!item.drawLotteryId ? '确认' : '更新'}}</el-button>
              <el-button type="text" v-if="item.productTypeTemp !== '0' && item.productTypeTemp !== '3'" @click.prevent="removeLotteryId(index, key)">删除</el-button>
              <p v-if="item.name">{{productTypeList[item.productType]}}名称：{{item.name}}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24" style="margin-top:15px"><el-button type="primary" size="mini" v-if="value.length < 8" @click.prevent="addLotteryId(key)">新增优惠券/点卡</el-button></el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" v-if="!form.drawLotteryManageId" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="测试" :close-on-click-modal="false" :visible.sync="testVisible" width="500px" center>
      <el-form
        :model="testForm"
        size="mini"
        ref="testForm">
        <el-form-item
          label="赛事ID"
          prop="activityId"
          :rules="[{required: true, message: '必填', trigger: ['blur']},
          {pattern: /^\d+$/, message: '必须为数字', trigger: ['blur']}]">
          <el-input v-model="testForm.activityId" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="用户ID"
          prop="userId"
          :rules="[{required: true, message: '必填', trigger: ['blur']},
          {pattern: /^\d+$/, message: '必须为数字', trigger: ['blur']}]">
          <el-input v-model="testForm.userId" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="testVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="testSubmit('testForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ActivityDrawLottery } from '../../../util/api'
import { queryMatchDetailbyId, queryCouponById, queryPointCardById } from '../../../util/commonQuery'
import { mapState } from 'vuex'
import axios from 'axios'
const productObj = {
  productId: '',
  productIdTemp: '',
  productType: '',
  productTypeTemp: '',
  name: '',
  probability: '',
  probabilityTemp: '',
  maxLimit: '',
  maxLimitTemp: '',
  loading: false,
  position: 0,
  positionTemp: 0
}
export default {
  name: 'ActivityDrawLottery',
  data () {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      tableHeight: null,
      productTypeList: {
        0: '谢谢参与',
        1: '优惠券',
        2: '点卡',
        3: '必中点卡'
      },
      dialogFormVisible: false,
      form: {},
      updateLoading: false,
      activityTypeList: {
        0: '普通用户',
        1: '银卡用户',
        2: '金卡用户',
        3: '钻石用户',
        4: '至尊用户'
      },
      testVisible: false,
      testForm: {}
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    showInit () {
      return /test|netease/gi.test(window.location.href)
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
    listRules (rule, value, callback) {
      const id = rule.field
      const productType = this.$refs['productTypeList' + id][0].value
      const productId = this.$refs['productIdList' + id][0].value
      const probability = this.$refs['probabilityList' + id][0].value
      const maxLimit = this.$refs['maxLimitList' + id][0].value
      const position = this.$refs['positionList' + id][0].value
      if (productType === '') {
        return callback(new Error('奖品类型不能为空'))
      }
      if (!/^\d+$/.test(productId)) {
        return callback(new Error('奖品ID必须为正整数'))
      }
      if (!/^[0-1]{1}([.]([0-9]){1,2})?$/.test(probability)) {
        return callback(new Error('中奖几率必须为0-1之间的小数，最多两位'))
      }
      if (!/^\d+$/.test(maxLimit)) {
        return callback(new Error('最大发放数必须为正整数'))
      }
      if (!/^\d+$/.test(position)) {
        return callback(new Error('权重必须为正整数'))
      }
      return callback()
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(ActivityDrawLottery.list, {
        params: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      this.$service(ActivityDrawLottery.updateStatus, {
        method: 'post',
        params: {
          drawLotteryManageId: data.drawLotteryManageId,
          status: data.drawLotteryStatus
        }
      }).then(res => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'drawLotteryStatus', data.drawLotteryStatus ? 0 : 1)
          this.$message.error(res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'status', data.drawLotteryStatus ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    activeDel (data) {
      if (data.loading) return
      this.$set(data, 'loading', true)
      this.$service(ActivityDrawLottery.delete, {
        params: {
          drawLotteryManageId: data.drawLotteryManageId
        }
      }).then(res => {
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(this.pageIndex, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        data.loading = false
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getMatchInfo (data) {
      this.$set(data, 'match', '')
      if (!/^\d+$/.test(data.activityId)) return
      queryMatchDetailbyId(data.activityId).then(res => {
        if (res.matchInfoId) this.$set(data, 'match', res.homeMatchTeam.teamName + ' vs ' + res.guestMatchTeam.teamName)
      }).catch(err => {
        this.$message.error(err)
      })
    },
    getInfoById (id) {
      if (!id) return Promise.resolve()
      return this.$service(ActivityDrawLottery.listById, {
        params: {
          drawLotteryManageId: id
        }
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        if (err) {
          return Promise.reject(err)
        }
      })
    },
    newPop (data, flag) {
      let id = data ? data.drawLotteryManageId : null
      this.getInfoById(id).then(res => {
        let _data = {
          activityId: data ? data.activityId : '',
          recHomePage: data ? !!data.recHomePage : false,
          recHomePageTemp: data ? !!data.recHomePage : false
        }
        if (data && !flag) {
          _data['drawLotteryManageId'] = data.drawLotteryManageId
        }
        const list = {}
        Object.keys(this.activityTypeList).map(key => {
          list[key] = []
        })
        if (res) {
          res.forEach(item => {
            if (!_data['drawLotteryManageId']) {
              delete item.drawLotteryId
            }
            item.productType = item.productType + ''
            item['productTypeTemp'] = item.productType
            item['productIdTemp'] = item.productId
            item['probabilityTemp'] = item.probability
            item['maxLimitTemp'] = item.maxLimit
            item['positionTemp'] = item.position
            list[item.activityType].push(item)
          })
        }
        Object.keys(list).map(key => {
          if (list[key].length < 1) {
            list[key] = [
              {
                ...productObj,
                ...{
                  productId: '0',
                  productIdTemp: '0',
                  productType: '0',
                  productTypeTemp: '0',
                  maxLimit: '10000000',
                  maxLimitTemp: '10000000'
                }
              },
              {
                ...productObj,
                ...{
                  productId: '',
                  productIdTemp: '',
                  productType: '3',
                  productTypeTemp: '3',
                  position: 1,
                  positionTemp: 1
                }
              }
            ]
          } else {
            if (list[key].filter(item => item.productType === '0').length < 1) {
              list[key].push({
                ...productObj,
                ...{
                  productId: '0',
                  productIdTemp: '0',
                  productType: '0',
                  productTypeTemp: '0',
                  maxLimit: '10000000',
                  maxLimitTemp: '10000000'
                }
              })
            }
            if (list[key].filter(item => item.productType === '3').length < 1) {
              list[key].push({
                ...productObj,
                ...{
                  productId: '0',
                  productIdTemp: '0',
                  productType: '3',
                  productTypeTemp: '3'
                }
              })
            }
          }
        })
        _data['list'] = list
        this.form = _data
        if (data && data.activityId) {
          this.getMatchInfo(this.form)
        }
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }).catch(err => {
        err && this.$message.error('获取活动详情失败，请稍后再试')
      })
    },
    addLotteryId (type) {
      const arr = this.form.list[type].map(item => item.positionTemp).sort((a, b) => b - a)
      const i = arr ? parseInt(arr[0]) + 1 : 0
      this.form.list[type].push({
        ...productObj,
        ...{
          position: i,
          positionTemp: i
        }
      })
    },
    removeLotteryId (i, type) {
      const list = this.form.list[type]
      this.delLotteryById(list[i].drawLotteryId).then(() => {
        list.splice(i, 1)
      }).catch(err => {
        this.$message.error(err)
      })
    },
    getLotteryInfoAnsy (data) {
      if (data.productType !== data.productTypeTemp || data.productId !== parseInt(data.productIdTemp)) {
        data.name = ''
      }
      this.getLotteryInfo(data).catch(err => {
        if (err) {}
      })
    },
    getLotteryInfo (data) {
      const type = parseInt(data.productTypeTemp)
      const id = data.productIdTemp
      if (data.name || type === 0) {
        return Promise.resolve()
      }
      if (data.loading) {
        return Promise.reject(new Error('正在获取商品类型信息，请稍后再试'))
      }
      if (data.productTypeTemp === '' || !/^\d+$/.test(data.productIdTemp)) {
        return Promise.reject(new Error('奖品ID必须为正整数'))
      }
      data.name = ''
      this.$set(data, 'loading', true)
      if (type === 1) {
        return queryCouponById(id).then(res => {
          data.loading = false
          if (res.couponName) {
            data.name = res.couponName
            return Promise.resolve()
          } else {
            this.$message.error('找不到对应的优惠券，请更换ID')
            return Promise.reject(new Error('找不到对应的优惠券，请更换ID'))
          }
        }, err => {
          if (err) {
            data.loading = false
            this.$message.error(JSON.stringify(err))
            return Promise.reject(new Error(JSON.stringify(err)))
          }
        })
      }
      if (type === 2 || type === 3) {
        return queryPointCardById(id).then(res => {
          data.loading = false
          if (res.name) {
            data.name = res.name
            return Promise.resolve()
          } else {
            this.$message.error('找不到对应的点卡，请更换ID')
            return Promise.reject(new Error('找不到对应的点卡，请更换ID'))
          }
        }, err => {
          if (err) {
            data.loading = false
            this.$message.error(JSON.stringify(err))
            return Promise.reject(new Error(JSON.stringify(err)))
          }
        })
      }
    },
    isRepeat (arr) {
      const obj = {}
      let flag = false
      arr.forEach(item => {
        if (obj[item]) {
          flag = true
        } else {
          obj[item] = true
        }
      })
      return flag
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          let positionError = false
          const keys = Object.keys(this.form.list)
          for (let i = 0; i < keys.length; i++) {
            if (this.isRepeat(this.form.list[keys[i]].map(item => item.positionTemp))) {
              positionError = true
              this.$message.warning(`${this.activityTypeList[keys[i]]}奖品列表中有位置重复的奖品`)
              break
            }
          }
          if (positionError) return
          const _data = {
            activityId: this.form.activityId,
            recHomePage: this.form.recHomePageTemp ? 1 : 0
          }
          this.updateLoading = true
          this.addActivity(_data).then(res => {
            this.updateLoading = false
            this.form.drawLotteryManageId = res
            this.dialogFormVisible = false
            this.getList()
            const promiseAll = Object.keys(this.form.list).map(key => {
              return this.form.list[key].map(item => {
                const _data = {
                  drawLotteryManageId: res,
                  activityType: key,
                  productId: item.productIdTemp,
                  productType: item.productTypeTemp,
                  probability: item.probabilityTemp,
                  maxLimit: item.maxLimitTemp,
                  position: item.positionTemp
                }
                return this.addLotteryById(_data, key)
              })
            })
            axios.all(promiseAll).then(resArr => {
              this.$message.success('活动及活动抽奖列表创建成功')
            }).catch(err => {
              this.$message.error(JSON.stringify(err))
            })
          }).catch(err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    clickLotteryId (data, type, drawLotteryManageId) {
      if (this.isRepeat(this.form.list[type].map(item => item.positionTemp))) {
        return this.$message.warning(`${this.activityTypeList[type]}奖品列表中有位置重复的奖品`)
      }
      let _data = {
        activityType: type,
        productId: data.productIdTemp,
        productType: data.productTypeTemp,
        probability: data.probabilityTemp,
        maxLimit: data.maxLimitTemp,
        position: data.positionTemp
      }
      if (data.productTypeTemp === '') return
      if (!/^\d+$/.test(data.productIdTemp)) return
      if (!/^[0-1]{1}([.]([0-9]){1,2})?$/.test(data.probabilityTemp)) return
      if (!/^\d+$/.test(data.maxLimitTemp)) return
      if (!/^\d+$/.test(data.positionTemp)) return
      this.getLotteryInfo(data).then(() => {
        if (data.drawLotteryId) {
          _data['drawLotteryId'] = data.drawLotteryId
          this.updateLotteryById(_data, type).then(res => {
            data.productId = parseInt(data.productIdTemp)
            data.productType = data.productTypeTemp
            data.probability = parseFloat(data.probabilityTemp)
            data.maxLimit = parseInt(data.maxLimitTemp)
            data.position = parseInt(data.positionTemp)
            this.$message.success('更新成功')
          }).catch(err => {
            this.$message.error(err)
          })
        } else {
          _data['drawLotteryManageId'] = drawLotteryManageId
          this.addLotteryById(_data, type).then(res => {
            this.$set(data, 'drawLotteryId', res)
            data.productId = parseInt(data.productIdTemp)
            data.productType = data.productTypeTemp
            data.probability = parseFloat(data.probabilityTemp)
            data.maxLimit = parseInt(data.maxLimitTemp)
            data.position = parseInt(data.positionTemp)
            this.$message.success('新增成功')
          }).catch(err => {
            this.$message.error(err)
          })
        }
      }).catch(err => {
        if (err) {}
      })
    },
    addActivity (data) {
      return this.$service(ActivityDrawLottery.add, {
        method: 'post',
        data: data
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        return Promise.reject(JSON.stringify(err))
      })
    },
    updateRecHomePage () {
      this.$service(ActivityDrawLottery.updateRecHomePage, {
        method: 'post',
        data: {
          drawLotteryManageId: this.form.drawLotteryManageId,
          recHomePage: this.form.recHomePageTemp ? 1 : 0
        }
      }).then(res => {
        if (res.code === 200) {
          this.form.recHomePage = this.form.recHomePageTemp
          this.$message.success('更新成功')
          this.getList(this.pageIndex, true)
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    addLotteryById (data, type) {
      return this.$service(ActivityDrawLottery.addById, {
        method: 'post',
        data: data
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        return Promise.reject(JSON.stringify(err))
      })
    },
    updateLotteryById (data, type) {
      return this.$service(ActivityDrawLottery.updateById, {
        method: 'post',
        data: data
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve()
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        return Promise.reject(JSON.stringify(err))
      })
    },
    delLotteryById (id) {
      if (!id) return Promise.resolve()
      return this.$service(ActivityDrawLottery.deleteById, {
        params: {
          drawLotteryId: id
        }
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve()
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        return Promise.reject(JSON.stringify(err))
      })
    },
    initPop () {
      this.$prompt('输入赛事ID', '赛事初始化', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '赛事ID必须为数字',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service('/api/admin/drawLottery/test/init', {
          params: {
            matchInfoId: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('初始化成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    testPop () {
      this.testForm = {
        activityId: '',
        userId: ''
      }
      this.testVisible = true
      this.$nextTick(() => {
        this.$refs.testForm.clearValidate()
      })
    },
    testSubmit (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          const _data = {
            activityId: this.testForm.activityId,
            userId: this.testForm.userId
          }
          this.$service('/api/admin/drawLottery/test/draw', {
            params: _data
          }).then(res => {
            if (res.code === 200) {
              this.testVisible = false
              this.$message.success('抽奖成功')
            } else {
              this.$message.error(res.message)
            }
          }).catch(err => {
            if (err) {
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
