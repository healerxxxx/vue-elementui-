<template>
  <div class="dialog-coupon-send">
    <el-dialog
      title="定向发放"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="500px"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" ref="form" size="small">
        <el-form-item
          label="用户群">
          <el-select v-model="form.userType">
            <el-option value="1" label="全部用户"></el-option>
            <el-option value="2" label="单用户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="form.userType==='2'"
          label="用户ID"
          prop="userIds"
          :rules="[{validator: userIdRule, trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" v-model="form.userIds"></el-input>
        </el-form-item>
        <el-form-item v-show="form.userType==='2'">
          <span>*不为空&用,隔开，最多200个用户</span><br />
          <span class="text-red">(用户ID与Excel只能二选一)</span>
        </el-form-item>
        <el-form-item
          prop="excel"
          v-show="form.userType==='2'"
          :rules="[{required: form.userType==='2'&&!form.userIds, message: '请选择Excel', trigger: ['blur', 'change']}]">
          <el-upload
            ref="upload"
            limit="1"
            accept=".xls,.xlsx,.xlc,.xlm,.xlt,.xlw"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
            :auto-upload="false"
            :file-list="fileList">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">*文件需为excel格式</div>
          </el-upload>
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
import baseType from '../../../util/base'
export default {
  name: 'dialogCouponSend',
  props: {
    id: 'Number',
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
      fileList: []
    }
  },
  methods: {
    userIdRule (rule, value, callback) {
      if (this.form.userType === '2') {
        if (this.form.excel) {
          callback()
        } else {
          if (!value) {
            callback(new Error('不为空'))
          } else if (!/^[0-9,]+$/.test(value)) {
            callback(new Error('必须为数字且英文(,)隔开'))
          } else {
            if (value.split(',').length > 200) {
              callback(new Error('最多200个用户ID'))
            } else {
              callback()
            }
          }
        }
      } else {
        callback()
      }
    },
    handleFileExceed () {
      this.$message.warning('请先移除Excel文件。')
    },
    handleFileRemove (file) {
      this.form.excel = null
    },
    handleFileChange (file, fileList) {
      this.form.excel = file.raw
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.form.excel && this.form.userIds) return this.$message.warning('用户ID与Excel只能二选一')
          if (this.updateLoading) return
          this.updateLoading = true
          let _data = {
            couponWrapId: this.id,
            userType: this.form.userType
          }
          if (this.form.excel) {
            _data = new FormData()
            _data.append('excel', this.form.excel)
            _data.append('couponWrapId', this.id)
            _data.append('userType', this.form.userType)
          } else if (this.form.userIds) {
            _data['userIds'] = this.form.userIds
          }
          this.$service(CouponPackage[this.tab].sendConfirmation, {
            method: 'post',
            headers: this.form.excel ? {
              'Content-Type': 'multipart/form-data'
            } : null,
            data: _data
          }).then(res => {
            if (res.code === 200) {
              let couponType = {}
              baseType.couponType.forEach(item => {
                couponType[item.id] = item.name
              })
              let _text = '确定要'
              res.data.forEach((item, index) => {
                _text += (index !== 0 ? '；' : '') + '对' + (item.number > 0 ? item.number + '名用户' : '全部用户') + '发送【' + item.couponName + '】【' + item.validDay + '天】【' + item.discountStr + '】【' + couponType[item.couponType] + '】'
              })
              _text += '吗？'
              this.$confirm(_text, {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                this.$service(CouponPackage[this.tab].send, {
                  method: 'post',
                  headers: this.form.excel ? {
                    'Content-Type': 'multipart/form-data'
                  } : null,
                  data: _data
                }).then(res => {
                  this.updateLoading = false
                  if (res.code === 200) {
                    this.$message.success('定向发送成功')
                    this.$emit('closeDialog')
                    this.$emit('success')
                  } else {
                    this.$message.error(res.code + ':' + res.message)
                  }
                }, err => {
                  this.updateLoading = false
                  this.$message.error(JSON.stringify(err))
                })
              }).catch(() => {
                this.updateLoading = false
              })
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
        this.form = {
          userType: '1',
          excel: null
        }
        this.fileList = []
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
