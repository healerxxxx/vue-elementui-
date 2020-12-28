<template>
  <div class="level-dialog">
    <el-dialog
      :title="form.userLevelId ? '修改用户群' : '新增用户群'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="500px"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="110px" ref="form" size="small">
        <el-form-item
          label="用户群等级"
          prop="levelName"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 20, message: '最多20个字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.levelName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="消费天数"
          prop="consumeDaysStart"
          :rules="[{validator: consumeDaysRule, trigger: ['blur', 'change']}]">
          <el-input v-model.number="form.consumeDaysStart" autocomplete="off" style="width:95px"></el-input>
          <el-select v-model="form.consumeDaysStartEqual" style="width:65px">
            <el-option value="3" label=">"></el-option>
            <el-option value="2" label=">="></el-option>
          </el-select>
          <el-select v-model="form.consumeDaysEndEqual" style="width:65px">
            <el-option value="3" label="<"></el-option>
            <el-option value="2" label="<="></el-option>
          </el-select>
          <el-input v-model.number="form.consumeDaysEnd" ref="consumeDaysEnd" autocomplete="off" style="width:95px"></el-input>
        </el-form-item>
        <el-form-item
          label="周均消费次数"
          prop="weeklyConsumeTimesStart"
          :rules="[{validator: weeklyConsumeRule, trigger: ['blur', 'change']}]">
          <el-input v-model.number="form.weeklyConsumeTimesStart" autocomplete="off" style="width:95px"></el-input>
          <el-select v-model="form.weeklyConsumeTimesStartEqual" style="width:65px">
            <el-option value="3" label=">"></el-option>
            <el-option value="2" label=">="></el-option>
          </el-select>
          <el-select v-model="form.weeklyConsumeTimesEndEqual" style="width:65px">
            <el-option value="3" label="<"></el-option>
            <el-option value="2" label="<="></el-option>
          </el-select>
          <el-input v-model.number="form.weeklyConsumeTimesEnd" ref="weeklyConsumeTimesEnd" autocomplete="off" style="width:95px"></el-input>
        </el-form-item>
        <el-form-item
          label="日均消费额"
          prop="dailyConsumeStart"
          :rules="[{validator: dailyConsumeRule, trigger: ['blur', 'change']}]">
          <el-input v-model.number="form.dailyConsumeStart" autocomplete="off" style="width:95px"></el-input>
          <el-select v-model="form.dailyConsumeStartEqual" style="width:65px">
            <el-option value="3" label=">"></el-option>
            <el-option value="2" label=">="></el-option>
          </el-select>
          <el-select v-model="form.dailyConsumeEndEqual" style="width:65px">
            <el-option value="3" label="<"></el-option>
            <el-option value="2" label="<="></el-option>
          </el-select>
          <el-input v-model.number="form.dailyConsumeEnd" ref="dailyConsumeEnd" autocomplete="off" style="width:95px"></el-input>
        </el-form-item>
        <el-form-item
          label="周最高消费额"
          prop="maxWeekConsumeStart"
          :rules="[{validator: maxWeekConsumeRule, trigger: ['blur', 'change']}]">
          <el-input v-model.number="form.maxWeekConsumeStart" autocomplete="off" style="width:95px"></el-input>
          <el-select v-model="form.maxWeekConsumeStartEqual" style="width:65px">
            <el-option value="3" label=">"></el-option>
            <el-option value="2" label=">="></el-option>
          </el-select>
          <el-select v-model="form.consumeDaysEndEqual" style="width:65px">
            <el-option value="3" label="<"></el-option>
            <el-option value="2" label="<="></el-option>
          </el-select>
          <el-input v-model.number="form.maxWeekConsumeEnd" ref="maxWeekConsumeEnd" autocomplete="off" style="width:95px"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="inUseStatus">
          <el-select v-model="form.inUseStatus" placeholder="请选择">
            <el-option value="1" label="正常"></el-option>
            <el-option value="0" label="停用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提示">
          <span>*输入框内填-1代表无穷</span>
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
import { PriceProductPointCardUserLevel } from '../../../../util/api'
export default {
  name: 'levelDialog',
  props: {
    data: {
      type: 'Object',
      default () {
        return {}
      }
    },
    visible: {
      type: 'Boolean',
      default: false
    },
    appTab: {
      default: 0
    }
  },
  data () {
    return {
      form: {
        levelName: '',
        consumeDaysStart: '',
        consumeDaysEnd: '',
        consumeDaysStartEqual: '3',
        consumeDaysEndEqual: '3',
        weeklyConsumeTimesStart: '',
        weeklyConsumeTimesEnd: '',
        weeklyConsumeTimesStartEqual: '3',
        weeklyConsumeTimesEndEqual: '3',
        dailyConsumeStart: '',
        dailyConsumeEnd: '',
        dailyConsumeStartEqual: '3',
        dailyConsumeEndEqual: '3',
        maxWeekConsumeStart: '',
        maxWeekConsumeEnd: '',
        maxWeekConsumeStartEqual: '3',
        maxWeekConsumeEndEqual: '3',
        inUseStatus: '1'
      },
      updateLoading: false
    }
  },
  computed: {
    queryApi () {
      return PriceProductPointCardUserLevel[this.appTab]
    }
  },
  methods: {
    consumeDaysRule (rule, value, callback) {
      let _val = this.$refs.consumeDaysEnd.value
      if (value === '') {
        callback(new Error('左侧值不为空'))
      } else {
        if (/^\d+$/.test(value)) {
          if (value >= 0 && value <= 999) {
            if (_val === '') {
              callback(new Error('右侧值不为空'))
            } else {
              if (/^\d+|-1$/.test(_val)) {
                if (_val >= -1 && _val <= 999) {
                  if (!/^-1$/.test(_val) && _val < value) {
                    callback(new Error('右侧值不能小于左侧值'))
                  } else {
                    callback()
                  }
                } else {
                  callback(new Error('右侧值0-999或-1'))
                }
              } else {
                callback(new Error('右侧值必须为数字'))
              }
            }
          } else {
            callback(new Error('左侧值0-999'))
          }
        } else {
          callback(new Error('左侧值必须为数字'))
        }
      }
    },
    weeklyConsumeRule (rule, value, callback) {
      let _val = this.$refs.weeklyConsumeTimesEnd.value
      if (value === '') {
        callback(new Error('左侧值不为空'))
      } else {
        if (/^\d+$/.test(value)) {
          if (value >= 0 && value <= 200) {
            if (_val === '') {
              callback(new Error('右侧值不为空'))
            } else {
              if (/^\d+|-1$/.test(_val)) {
                if (_val >= -1 && _val <= 200) {
                  if (!/^-1$/.test(_val) && _val < value) {
                    callback(new Error('右侧值不能小于左侧值'))
                  } else {
                    callback()
                  }
                } else {
                  callback(new Error('右侧值0-200或-1'))
                }
              } else {
                callback(new Error('右侧值必须为数字'))
              }
            }
          } else {
            callback(new Error('左侧值0-200'))
          }
        } else {
          callback(new Error('左侧值必须为数字'))
        }
      }
    },
    dailyConsumeRule (rule, value, callback) {
      let _val = this.$refs.dailyConsumeEnd.value
      if (value === '') {
        callback(new Error('左侧值不为空'))
      } else {
        if (/^\d+$/.test(value)) {
          if (value >= 0 && value <= 999) {
            if (_val === '') {
              callback(new Error('右侧值不为空'))
            } else {
              if (/^\d+|-1$/.test(_val)) {
                if (_val >= -1 && _val <= 999) {
                  if (!/^-1$/.test(_val) && _val < value) {
                    callback(new Error('右侧值不能小于左侧值'))
                  } else {
                    callback()
                  }
                } else {
                  callback(new Error('右侧值0-999或-1'))
                }
              } else {
                callback(new Error('右侧值必须为数字'))
              }
            }
          } else {
            callback(new Error('左侧值0-999'))
          }
        } else {
          callback(new Error('左侧值必须为数字'))
        }
      }
    },
    maxWeekConsumeRule (rule, value, callback) {
      let _val = this.$refs.maxWeekConsumeEnd.value
      if (value === '') {
        callback(new Error('左侧值不为空'))
      } else {
        if (/^\d+$/.test(value)) {
          if (value >= 0 && value <= 99999) {
            if (_val === '') {
              callback(new Error('右侧值不为空'))
            } else {
              if (/^\d+|-1$/.test(_val)) {
                if (_val >= -1 && _val <= 99999) {
                  if (!/^-1$/.test(_val) && _val < value) {
                    callback(new Error('右侧值不能小于左侧值'))
                  } else {
                    callback()
                  }
                } else {
                  callback(new Error('右侧值0-99999或-1'))
                }
              } else {
                callback(new Error('右侧值必须为数字'))
              }
            }
          } else {
            callback(new Error('左侧值0-99999'))
          }
        } else {
          callback(new Error('左侧值必须为数字'))
        }
      }
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          this.$service(this.form.userLevelId ? this.queryApi.update : this.queryApi.add, {
            method: 'post',
            urlParams: {
              userLevelId: this.form.userLevelId
            },
            data: this.form
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$message.success(this.form.userLevelId ? '修改用户级别成功' : '新增用户级别成功')
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
        this.form = {
          levelName: '',
          consumeDaysStart: '',
          consumeDaysEnd: '',
          consumeDaysStartEqual: '3',
          consumeDaysEndEqual: '3',
          weeklyConsumeTimesStart: '',
          weeklyConsumeTimesEnd: '',
          weeklyConsumeTimesStartEqual: '3',
          weeklyConsumeTimesEndEqual: '3',
          dailyConsumeStart: '',
          dailyConsumeEnd: '',
          dailyConsumeStartEqual: '3',
          dailyConsumeEndEqual: '3',
          maxWeekConsumeStart: '',
          maxWeekConsumeEnd: '',
          maxWeekConsumeStartEqual: '3',
          maxWeekConsumeEndEqual: '3',
          inUseStatus: '1'
        }
        if (this.data && this.data.userLevelId) {
          this.form = {
            consumeDaysStartEqual: this.data.consumeDaysIntervalObject.includeStart ? '2' : '3',
            consumeDaysEndEqual: this.data.consumeDaysIntervalObject.includeEnd ? '2' : '3',
            weeklyConsumeTimesStartEqual: this.data.weeklyConsumeTimesIntervalObject.includeStart ? '2' : '3',
            weeklyConsumeTimesEndEqual: this.data.weeklyConsumeTimesIntervalObject.includeEnd ? '2' : '3',
            dailyConsumeStartEqual: this.data.dailyConsumeIntervalObject.includeStart ? '2' : '3',
            dailyConsumeEndEqual: this.data.dailyConsumeIntervalObject.includeEnd ? '2' : '3',
            maxWeekConsumeStartEqual: this.data.maxWeekConsumeIntervalObject.includeStart ? '2' : '3',
            maxWeekConsumeEndEqual: this.data.maxWeekConsumeIntervalObject.includeEnd ? '2' : '3',
            levelName: this.data.levelName,
            consumeDaysStart: this.data.consumeDaysIntervalObject.start,
            consumeDaysEnd: this.data.consumeDaysIntervalObject.end,
            weeklyConsumeTimesStart: this.data.weeklyConsumeTimesIntervalObject.start,
            weeklyConsumeTimesEnd: this.data.weeklyConsumeTimesIntervalObject.end,
            dailyConsumeStart: this.data.dailyConsumeIntervalObject.start,
            dailyConsumeEnd: this.data.dailyConsumeIntervalObject.end,
            maxWeekConsumeStart: this.data.maxWeekConsumeIntervalObject.start,
            maxWeekConsumeEnd: this.data.maxWeekConsumeIntervalObject.end,
            inUseStatus: this.data.status ? '1' : '0',
            userLevelId: this.data.userLevelId
          }
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
