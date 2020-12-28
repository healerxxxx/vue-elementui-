<template>
  <div class="dialog-coupon-wrap">
    <el-dialog
      :title="form.couponWrapId ? '修改组合' : '新建组合'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="530px"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="90px" ref="form" size="small">
        <el-form-item
          label="活动类型"
          prop="couponWrapType"
          v-show="!form.couponWrapId"
          :rules="{required: !form.couponWrapId, message: '必选', trigger: ['blur', 'change']}">
          <el-select v-model="form.couponWrapType" placeholder="请选择">
            <el-option :value="item.couponWrapType" :label="item.codeName" v-for="(item, index) in codeList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="组合名称"
          prop="wrapName"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 20, message: '最多20字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.wrapName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="活动标题"
          prop="activeTitle"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 10, message: '最多10字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.activeTitle" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="活动说明"
          prop="activeDesc"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 20, message: '最多20字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.activeDesc" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="发放日期" prop="releaseTimeType">
          <el-radio v-model="form.releaseTimeType" label="0">无</el-radio>
          <el-radio v-model="form.releaseTimeType" label="1">有</el-radio>
        </el-form-item>
        <el-form-item
          v-show="form.releaseTimeType === '1'"
          prop="releaseStartDate"
          :rules="[{validator: dateRule, trigger: ['blur', 'change']}]">
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
            ref="endTime"
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
        <el-form-item label="允许重复领" prop="isMultGet">
          <el-radio v-model="form.isMultGet" label="0">否</el-radio>
          <el-radio v-model="form.isMultGet" label="1">是</el-radio>
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
import { CouponPackage } from '../../../util/api'
import { formatDate } from '../../../util/tool'
export default {
  name: 'dialogCouponWrap',
  props: {
    data: {
      type: 'Object',
      default () {
        return {}
      }
    },
    tab: 'String',
    visible: {
      type: 'Boolean',
      default: false
    }
  },
  data () {
    return {
      form: {},
      updateLoading: false,
      codeList: []
    }
  },
  methods: {
    dateRule (rule, value, callback) {
      if (this.form.releaseTimeType === '1') {
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
    getCodeList () {
      this.$service(CouponPackage[this.tab].codeList).then(res => {
        if (res.code === 200) {
          this.codeList = res.data
        }
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          let _data = {
            wrapName: this.form.wrapName,
            activeTitle: this.form.activeTitle,
            activeDesc: this.form.activeDesc,
            releaseTimeType: parseInt(this.form.releaseTimeType),
            isMultGet: parseInt(this.form.isMultGet)
          }
          if (_data.releaseTimeType === 1) {
            _data['releaseStartDate'] = this.form.releaseStartDate
            _data['releaseEndDate'] = this.form.releaseEndDate
          }
          if (this.form.couponWrapId) {
            _data['couponWrapId'] = this.form.couponWrapId
          } else {
            _data['couponWrapType'] = this.form.couponWrapType
          }
          this.$service(this.form.couponWrapId ? CouponPackage[this.tab].update : CouponPackage[this.tab].add, {
            method: 'post',
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$message.success(this.form.couponWrapId ? '修改组合成功' : '新建组合成功')
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
        if (!this.data.couponWrapId) this.getCodeList()
        this.form = Object.assign({}, this.data.couponWrapId ? this.data : {
          couponWrapType: '',
          wrapName: '',
          activeTitle: '',
          activeDesc: '',
          releaseTimeType: '0',
          isMultGet: '0',
          releaseStartDate: '',
          releaseEndDate: ''
        })
        if (this.form.releaseStartDate) this.form.releaseStartDate = formatDate(this.form.releaseStartDate, 'yyyy-MM-dd hh:mm:ss')
        if (this.form.releaseEndDate) this.form.releaseEndDate = formatDate(this.form.releaseEndDate, 'yyyy-MM-dd hh:mm:ss')
        this.form.releaseTimeType = this.form.releaseTimeType + ''
        if (this.data.couponWrapId) this.form.isMultGet = this.form.isMultGet ? '1' : '0'
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
