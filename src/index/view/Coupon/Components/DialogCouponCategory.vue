<template>
  <div class="dialog-coupon-category">
    <el-dialog
      :title="form.couponId ? '修改类别' : '新建类别'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="580px"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="140px" ref="form" size="small">
        <el-form-item
          label="类型"
          prop="couponType"
          :rules="{required: true, message: '必选', trigger: ['blur', 'change']}">
          <el-select v-model="form.couponType" placeholder="请选择" :disabled="form.couponId">
            <el-option :value="item.id" :label="item.name" v-for="(item, index) in couponType" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="名称"
          prop="couponName"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 10, message: '最多10字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.couponName" autocomplete="off"></el-input>
        </el-form-item>
        <!-- 折扣券 -->
        <el-form-item
          v-show="form.couponType === 1"
          label="优惠力度"
          prop="discount"
          :rules="[{required: form.couponType === 1, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,1}$/, message: '1-99', trigger: ['blur', 'change']}]">
          <el-input v-model="form.discount" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 折
        </el-form-item>
        <el-form-item
          v-show="form.couponType === 1"
          label="体验方案限制"
          prop="threadLimitFlag">
          <el-radio v-model="form.threadLimitFlag" label="0" :disabled="form.couponId">无限制</el-radio>
          <el-radio v-model="form.threadLimitFlag" label="1" :disabled="form.couponId">限制</el-radio>
        </el-form-item>
        <el-form-item
          v-show="form.couponType === 1 && form.threadLimitFlag === '1'"
          label="最高X元"
          prop="threadLimit"
          :rules="[{required: form.couponType === 1 && form.threadLimitFlag === '1', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^([1-9]\d{0,1}|[1-4]\d{2}|500)$/, message: '1-500', trigger: ['blur', 'change']}]">
          <el-input v-model="form.threadLimit" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 元
        </el-form-item>
        <!-- 满减券 -->
        <el-form-item
          v-show="form.couponType === 2"
          label="优惠力度"
          prop="reduction"
          :rules="[{required: form.couponType === 2, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^([1-9]\d{0,2}|1000)$/, message: '1-1000', trigger: ['blur', 'change']}]">
          <el-input v-model="form.reduction" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 红豆
        </el-form-item>
        <el-form-item
          v-show="form.couponType === 2"
          label="优惠条件"
          prop="full"
          :rules="[{required: form.couponType === 2, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,8}$/, message: '1-999999999', trigger: ['blur', 'change']}]">
          满 <el-input v-model="form.full" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 红豆使用
        </el-form-item>
        <!-- 直减券 -->
        <el-form-item
          v-show="form.couponType === 3"
          label="优惠力度"
          prop="down"
          :rules="[{required: form.couponType === 3, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^([1-9]\d{0,2}|1000)$/, message: '1-1000', trigger: ['blur', 'change']}]">
          减 <el-input v-model="form.down" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 红豆
        </el-form-item>
        <!-- 体验券 -->
        <el-form-item
          v-show="form.couponType === 6"
          label="N元体验"
          prop="experience"
          :rules="[{required: form.couponType === 6, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^([1-9]\d{0,2}|1000)$/, message: '1-1000', trigger: ['blur', 'change']}]">
          <el-input v-model="form.experience" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 元
        </el-form-item>
        <el-form-item
          v-show="form.couponType === 6"
          label="体验方案最大额度"
          prop="upperLimit"
          :rules="[{required: form.couponType === 6, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^([1-9]\d{0,2}|1000)$/, message: '1-1000', trigger: ['blur', 'change']}]">
          <el-input v-model="form.upperLimit" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 元
        </el-form-item>
        <el-form-item
          v-show="form.couponType === 6"
          label="体验方案最小额度"
          prop="lowerLimit"
          :rules="[{required: form.couponType === 6, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^([1-9]\d{0,2}|1000)$/, message: '1-1000', trigger: ['blur', 'change']}]">
          <el-input v-model="form.lowerLimit" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 元
        </el-form-item>
        <!-- 充值券 -->
        <el-form-item
          v-show="form.couponType === 7"
          label="优惠力度"
          prop="rechargeDiscount"
          :rules="[{required: form.couponType === 7, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-4]?\d{1,2}$|^500$/, message: '1-500', trigger: ['blur', 'change']}]">
          1 + <el-input v-model="form.rechargeDiscount" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> % 豆
        </el-form-item>
        <el-form-item
          v-show="form.couponType === 7"
          label="充值上限"
          prop="rechargeLimit"
          :rules="[{required: form.couponType === 7, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-4]?\d{1,4}$|^50000$/, message: '必须为正整数且最大50000', trigger: ['blur', 'change']}]">
          <el-input v-model="form.rechargeLimit" autocomplete="off" style="width:180px;" :disabled="form.couponId"></el-input> 元
        </el-form-item>
        <!--  -->
        <el-form-item
          label="创建方式"
          prop="amountType"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']}]">
          <el-select v-model="form.amountType" placeholder="请选择" :disabled="form.couponId">
            <el-option value="0" label="自动"></el-option>
            <el-option value="1" label="手动"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="form.amountType === '1'"
          label="新增"
          prop="amount"
          :rules="[{required: form.amountType === '1', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,8}$/, message: '1-999999999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.amount" autocomplete="off" style="width:120px;"></el-input>个
        </el-form-item>
        <el-form-item label="有效期" prop="validType">
          <el-radio v-model="form.validType" label="0" :disabled="form.couponId">相对天数</el-radio>
          <el-radio v-model="form.validType" label="1" :disabled="form.couponId">固定时间</el-radio>
        </el-form-item>
        <el-form-item
          v-show="form.validType === '0'"
          prop="validDay"
          :rules="[{required: form.validType === '0', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^(1500|[1][0-4]\d{2}|\d{1,3})$/, message: '天数范围0-1500', trigger: ['blur', 'change']}]">
          <el-input v-model="form.validDay" autocomplete="off" style="width:120px;" :disabled="form.couponId"></el-input> 天
        </el-form-item>
        <el-form-item
          v-show="form.validType === '1'"
          prop="validStartDate"
          :rules="[{validator: dateRule, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.validStartDate"
            type="date"
            style="width:135px"
            value-format="yyyy-MM-dd 00:00:00"
            placeholder="选择日期"
            :disabled="form.couponId"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.validEndDate).getTime() !== 0 && time.getTime() > new Date(form.validEndDate).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            ref="endTime"
            v-model="form.validEndDate"
            type="date"
            style="width:135px"
            value-format="yyyy-MM-dd 23:59:59"
            placeholder="选择日期"
            :disabled="form.couponId"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.validStartDate).getTime() !== 0 && time.getTime() < new Date(form.validStartDate).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="发放日期" prop="releaseTimeType">
          <el-radio v-model="form.releaseTimeType" label="0">无</el-radio>
          <el-radio v-model="form.releaseTimeType" label="1">有</el-radio>
        </el-form-item>
        <el-form-item
          v-show="form.releaseTimeType === '1'"
          prop="releaseStartDate"
          :rules="[{validator: dateRule1, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.releaseStartDate"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.releaseEndDate).getTime() !== 0 && time.getTime() > new Date(form.releaseEndDate).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            ref="endTime1"
            v-model="form.releaseEndDate"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.releaseStartDate).getTime() !== 0 && time.getTime() < new Date(form.releaseStartDate).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="使用范围"
          prop="app"
          :rules="{required: true, type: 'array', message: '适用范围必选一项', trigger: ['blur', 'change']}">
          <el-checkbox-group v-model="form.app" :disabled="form.couponId">
            <el-checkbox label="2">iOS</el-checkbox>
            <el-checkbox label="1">Android</el-checkbox>
            <el-checkbox label="3">PC</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="" prop="channelList" v-show="form.app&&form.app.indexOf('1')>-1">
          <el-select v-model="form.channelList" multiple placeholder="请选择" :disabled="form.couponId">
            <el-option
              v-for="item in channelList"
              :key="item.appChannelId"
              :label="item.channelName"
              :value="item.appChannelId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="适用人群"
          prop="user"
          :rules="{required: true, type: 'array', message: '适用人群必选一项', trigger: ['blur', 'change']}">
          <el-checkbox-group v-model="form.user" :disabled="form.couponId">
            <el-checkbox label="0">新用户</el-checkbox>
            <el-checkbox label="1">老用户</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item
          label="说明"
          prop="couponDesc"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 20, message: '最多20字', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="2" placeholder="不为空且不超20字" v-model="form.couponDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="visible = false">取 消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('form')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { CouponCategory, CouponChannel } from '../../../util/api'
import baseType from '../../../util/base'
import { formatDate } from '../../../util/tool'
export default {
  name: 'dialogCouponCategory',
  props: {
    data: {
      type: 'Object',
      default () {
        return {}
      }
    },
    couponWrapId: 'Number',
    tab: 'String',
    visible: {
      type: 'Boolean',
      default: false
    }
  },
  data () {
    return {
      couponType: baseType.couponType,
      form: {},
      updateLoading: false,
      channelList: []
    }
  },
  methods: {
    dateRule (rule, value, callback) {
      if (this.form.validType === '1') {
        let _endTime = this.$refs.endTime.value
        if (!value) {
          callback(new Error('开始时间不为空'))
        } else if (!_endTime) {
          callback(new Error('结束时间不为空'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    dateRule1 (rule, value, callback) {
      if (this.form.releaseTimeType === '1') {
        let _endTime = this.$refs.endTime1.value
        if (!value) {
          callback(new Error('开始时间不为空'))
        } else if (!_endTime) {
          callback(new Error('结束时间不为空'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    getChannelList () {
      if (this.channelList.length > 0 || this.tab !== '0') return
      return this.$service(CouponChannel.list).then(res => {
        if (res.code === 200) {
          this.channelList = res.data
        }
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          let _data = {}
          if (this.form.couponId) {
            _data = {
              couponId: this.form.couponId,
              couponName: this.form.couponName,
              releaseTimeType: parseInt(this.form.releaseTimeType),
              couponDesc: this.form.couponDesc
            }
          } else {
            _data = {
              couponType: parseInt(this.form.couponType),
              couponName: this.form.couponName,
              discount: {},
              amountType: parseInt(this.form.amountType),
              validType: parseInt(this.form.validType),
              releaseTimeType: parseInt(this.form.releaseTimeType),
              couponDesc: this.form.couponDesc,
              isIOS: this.form.app.indexOf('2') > -1,
              isAndroid: this.form.app.indexOf('1') > -1,
              isPC: this.form.app.indexOf('3') > -1,
              newUser: this.form.user.indexOf('0') > -1,
              oldUser: this.form.user.indexOf('1') > -1
            }
            if (_data.amountType === 1) {
              _data['amount'] = this.form.amount
            }
            if (_data.couponType === 1) {
              _data.discount['discount'] = this.form.discount
              _data.discount['limit'] = this.form.threadLimitFlag === '0' ? 0 : this.form.threadLimit
            }
            if (_data.couponType === 2) {
              _data.discount['reduction'] = this.form.reduction
              _data.discount['full'] = this.form.full
            }
            if (_data.couponType === 3) _data.discount['down'] = this.form.down
            if (_data.couponType === 6) {
              _data.discount['experience'] = this.form.experience
              _data.discount['upperLimit'] = this.form.upperLimit
              _data.discount['lowerLimit'] = this.form.lowerLimit
            }
            if (_data.couponType === 7) {
              _data.discount['discount'] = this.form.rechargeDiscount
              _data.discount['limit'] = this.form.rechargeLimit
            }
            if (_data.validType === 0) {
              _data['validDay'] = this.form.validDay
            } else {
              _data['validStartDate'] = this.form.validStartDate
              _data['validEndDate'] = this.form.validEndDate
            }
            if (_data.isAndroid && this.form.channelList.length > 0) _data['channelList'] = JSON.stringify(this.form.channelList)
            _data.discount = JSON.stringify(_data.discount)
          }
          if (_data['releaseTimeType'] === 1) {
            _data['releaseStartDate'] = this.form.releaseStartDate
            _data['releaseEndDate'] = this.form.releaseEndDate
          }
          this.$service(this.form.couponId ? CouponCategory[this.tab].update : CouponCategory[this.tab].add, {
            method: 'post',
            urlParams: this.form.couponId ? null : {couponWrapId: this.couponWrapId},
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$message.success(this.form.couponId ? '修改类别成功' : '新建类别成功')
              this.$emit('closeDialog')
              this.$emit('success')
            } else {
              this.updateLoading = false
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getChannelList()
        this.form = Object.assign({
          couponType: '',
          couponName: '',
          discount: '',
          threadLimitFlag: '0',
          threadLimit: '',
          reduction: '',
          full: '',
          down: '',
          experience: '',
          upperLimit: '',
          lowerLimit: '',
          amountType: '',
          amount: '',
          rechargeDiscount: '',
          rechargeLimit: '',
          validType: '0',
          validDay: '',
          validStartDate: '',
          validEndDate: '',
          releaseTimeType: '0',
          releaseStartDate: '',
          releaseEndDate: '',
          app: [],
          channelList: [],
          user: [],
          couponDesc: ''
        }, this.data || {})
        this.form.amountType = this.form.amountType + ''
        this.form.validType = this.form.validType + ''
        this.form.releaseTimeType = this.form.releaseTimeType + ''
        if (this.data.amount === 0) this.form.amount = ''
        if (!this.data.newUser && !this.data.oldUser) {
          this.form.user = ['0']
        } else {
          if (this.data.newUser) this.form.user.push('0')
          if (this.data.oldUser) this.form.user.push('1')
        }
        if (this.data.isIOS) this.form.app.push('2')
        if (this.data.isAndroid) this.form.app.push('1')
        if (this.data.isPC) this.form.app.push('3')
        if (this.data.channelList) this.form.channelList = JSON.parse(this.data.channelList)
        this.form.discount = ''
        if (this.data.discount) {
          this.data.discount = JSON.parse(this.data.discount)
          if (this.data.couponType === 1) {
            this.form.discount = this.data.discount.discount
            if (this.data.discount.limit) {
              this.form.threadLimitFlag = '1'
              this.form.threadLimit = this.data.discount.limit
            } else {
              this.form.threadLimitFlag = '0'
              this.form.threadLimit = ''
            }
          }
          if (this.data.couponType === 2) {
            this.form.reduction = this.data.discount.reduction
            this.form.full = this.data.discount.full
          }
          if (this.data.couponType === 3) this.form.down = this.data.discount.down
          if (this.data.couponType === 6) {
            this.form.experience = this.data.discount.experience
            this.form.upperLimit = this.data.discount.upperLimit
            this.form.lowerLimit = this.data.discount.lowerLimit
          }
          if (this.data.couponType === 7) {
            this.form.rechargeDiscount = this.data.discount.discount
            this.form.rechargeLimit = this.data.discount.limit
          }
        }
        if (this.data.validType === 1) {
          this.form.validStartDate = formatDate(this.data.validStartDate, 'yyyy-MM-dd hh:mm:ss')
          this.form.validEndDate = formatDate(this.data.validEndDate, 'yyyy-MM-dd hh:mm:ss')
        }
        if (this.data.releaseTimeType === 1) {
          this.form.releaseStartDate = formatDate(this.data.releaseStartDate, 'yyyy-MM-dd hh:mm:ss')
          this.form.releaseEndDate = formatDate(this.data.releaseEndDate, 'yyyy-MM-dd hh:mm:ss')
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      } else {
        this.$emit('closeDialog')
      }
    }
  }
}
</script>
