<template>
  <div class="point-card-dialog">
    <el-dialog
      :title="form.pointCardId ? '修改价格' : '新增价格'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="500px"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="120px" ref="form" size="small">
        <el-form-item
          label="商品全称"
          prop="name"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 20, message: '最多20个字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="商品简称"
          prop="shortName"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 15, message: '最多15个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.shortName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="特权说明"
          prop="description"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 200, message: '最多200个字', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item
          label="可用点数"
          prop="point"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,3}$/, message: '整数且0-999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.point" autocomplete="off" style="width:135px"></el-input>
        </el-form-item>
        <el-form-item
          label="折扣"
          prop="discount"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,2}$/, message: '整数且0-99', trigger: ['blur', 'change']}]">
          <el-input v-model="form.discount" autocomplete="off" style="width:135px"></el-input> %
        </el-form-item>
        <el-form-item
          label="价值">
          <el-input :value="form.point?form.point*28:''" autocomplete="off" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item
          label="卡片定价(元)"
          prop="price"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{0,4}$/, message: '整数且0-9999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.price" autocomplete="off" :disabled="form.pointCardId"></el-input>
        </el-form-item>
        <el-form-item>
          <span>定价=点数×28×折扣;{{form.point&&form.discount?'约'+form.point*28*form.discount/100+'豆':''}}</span>
        </el-form-item>
        <el-form-item
          label="红豆数量(豆)"
          prop="redCurrency"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{0,4}$/, message: '整数且0-9999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.redCurrency" autocomplete="off" :disabled="form.pointCardId"></el-input>
        </el-form-item>
        <el-form-item>
          <span>红豆=点数×28×折扣; {{form.point&&form.discount?'约'+form.point*28*form.discount/100+'元':''}}</span>
        </el-form-item>
        <el-form-item
          label="iOS产品码"
          prop="productCode"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']}]">
          <el-input v-model="form.productCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="有效期"
          prop="validDay"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,2}$/, message: '整数且1-999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.validDay" autocomplete="off" style="width:135px"></el-input> 天
        </el-form-item>
        <el-form-item
          v-show="type === 'vipSupply'"
          label="未激活有效期"
          prop="noActiveValidDay"
          :rules="[{required: type === 'vipSupply', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,2}$/, message: '整数且1-999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.noActiveValidDay" autocomplete="off" style="width:135px"></el-input> 天
        </el-form-item>
        <el-form-item label="生成链接" v-show="type === 'common'">
          <el-radio v-model="form.hasLinkUrl" label="1">是</el-radio>
          <el-radio v-model="form.hasLinkUrl" label="0">否</el-radio>
        </el-form-item>
        <el-form-item label="新用户专享" v-show="type === 'common'">
          <el-radio v-model="form.newUserEnjoy" label="1">是</el-radio>
          <el-radio v-model="form.newUserEnjoy" label="0">否</el-radio>
        </el-form-item>
        <el-form-item label="指定用户可见" v-show="type === 'common' && form.newUserEnjoy === '0'">
          <el-radio v-model="form.userRestrict" label="0">不限制</el-radio>
          <el-radio v-model="form.userRestrict" label="1">限制</el-radio>
        </el-form-item>
        <el-form-item
          prop="userLevelIds"
          v-show="type === 'common' && form.newUserEnjoy === '0' && form.userRestrict === '1'">
          <el-select v-model="form.userLevelIds" multiple placeholder="请选择">
            <el-option
              v-for="(item, index) in userLevel"
              :key="index"
              :label="item.levelName"
              :value="item.userLevelId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="type === 'common' && form.newUserEnjoy === '0' && form.userRestrict === '1' && form.userLevelIds.indexOf(singleUserId) > -1"
          label="用户ID"
          prop="tempUserIds"
          :rules="[{validator: userIdRule, trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" v-model="form.tempUserIds"></el-input>
        </el-form-item>
        <el-form-item v-show="type === 'common' && form.newUserEnjoy === '0' && form.userRestrict === '1' && form.userLevelIds.indexOf(singleUserId) > -1">
          <span>*不为空&用,隔开，最多200个用户</span>
        </el-form-item>
        <el-form-item
          prop="excel"
          v-show="type === 'common' && form.newUserEnjoy === '0' && form.userRestrict === '1' && form.userLevelIds.indexOf(singleUserId) > -1"
          :rules="[{required: type === 'common' && form.newUserEnjoy === '0' && form.userRestrict === '1' && form.userLevelIds.indexOf(singleUserId) > -1 && !form.tempUserIds, message: '不为空', trigger: ['blur', 'change']}]">
          <el-upload
            ref="upload"
            limit="1"
            accept=".xls,.xlsx,.xlc,.xlm,.xlt,.xlw"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">*文件需为excel格式</div>
          </el-upload>
        </el-form-item>
        <el-form-item
          label="每人最多激活"
          prop="perCardCount"
          v-show="type !== 1"
          :rules="[{validator: cardCountRule, trigger: ['blur', 'change']}]">
          <el-input v-model="form.perCardCount" autocomplete="off" style="width:135px"></el-input> 张
        </el-form-item>
        <el-form-item
          label="奖品总量"
          prop="totalCount"
          v-show="type === 'lottery'"
          :rules="[{required: type === 'lottery', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{1,6}$/, message: '整数且0-999999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.totalCount" autocomplete="off" style="width:135px"></el-input> 张
        </el-form-item>
        <el-form-item
          label="每日限量"
          prop="dailyCount"
          v-show="type === 'lottery'"
          :rules="[{required: type === 'lottery', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{1,3}$/, message: '整数且0-999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.dailyCount" autocomplete="off" style="width:135px"></el-input> 张
        </el-form-item>
        <el-form-item label="开放时间" prop="timeRestrict" v-show="type === 'lottery'">
          <el-radio v-model="form.timeRestrict" label="0">不限制</el-radio>
          <el-radio v-model="form.timeRestrict" label="1">限制</el-radio>
        </el-form-item>
        <el-form-item
          label="生效日期"
          prop="timeStart"
          v-show="type === 'lottery' && form.timeRestrict === '1'"
          :rules="[{validator: dateRule, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.timeStart"
            type="date"
            style="width:130px"
            value-format="yyyy-MM-dd 00:00:00"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.timeEnd).getTime() !== 0 && time.getTime() > new Date(form.timeEnd).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            ref="endTime"
            v-model="form.timeEnd"
            type="date"
            style="width:130px"
            value-format="yyyy-MM-dd 23:59:59"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.timeStart).getTime() !== 0 && time.getTime() < new Date(form.timeStart).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.inUseStatus" placeholder="请选择">
            <el-option value="1" label="正常"></el-option>
            <el-option value="0" label="停用"></el-option>
          </el-select>
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
import { PriceProductPointCard } from '../../../../util/api'
import { formatDate } from '../../../../util/tool'
export default {
  name: 'SpDialog',
  props: {
    data: {
      type: 'Object',
      default () {
        return {}
      }
    },
    type: {
      type: 'String',
      default: null
    },
    appType: {
      type: 'String',
      default: null
    },
    userLevel: {
      type: 'Array',
      default: []
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
        name: '',
        shortName: '',
        description: '',
        point: '',
        discount: '',
        pointCardData: '',
        price: '',
        redCurrency: '',
        productCode: '',
        validDay: '',
        hasLinkUrl: '1',
        newUserEnjoy: '0',
        userRestrict: '0',
        userLevelIds: [],
        tempUserIds: '',
        perCardCount: '',
        totalCount: '',
        dailyCount: '',
        timeRestrict: '0',
        timeStart: '',
        timeEnd: '',
        inUseStatus: '1',
        excel: ''
      },
      singleUserId: null,
      updateLoading: false
    }
  },
  computed: {
    queryApi () {
      return PriceProductPointCard[this.appTab]
    }
  },
  methods: {
    dateRule (rule, value, callback) {
      if (this.type === 'lottery' && this.form.timeRestrict === '1') {
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
    userIdRule (rule, value, callback) {
      if (this.type === 'common' && this.form.newUserEnjoy === '0' && this.form.userRestrict === '1' && this.form.userLevelIds.indexOf(this.singleUserId) > -1) {
        if (!this.form.excel) {
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
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    cardCountRule (rule, value, callback) {
      if (this.type !== 'common') {
        if (!value) {
          callback(new Error('不为空'))
        } else if (!/^\d+$/.test(value)) {
          callback(new Error('必须为正数'))
        } else {
          if (this.type === 'vip' || this.type === 'sharePullNew' || this.type === 'vipSupply' || this.type === 'chatRoomDraw' || this.type === 'birthdayGift') {
            if (value > 99 && value < 501) {
              callback()
            } else {
              callback(new Error('100-500'))
            }
          } else {
            if (value > 0 && value < 200) {
              callback()
            } else {
              callback(new Error('1-199'))
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
          this.updateLoading = true
          if (this.form.timeStart) this.form.timeStart = formatDate(this.form.timeStart, 'yyyy-MM-dd hh:mm:ss')
          if (this.form.timeEnd) this.form.timeEnd = formatDate(this.form.timeEnd, 'yyyy-MM-dd hh:mm:ss')
          let _data = Object.assign({}, this.form)
          Object.keys(_data).forEach(item => {
            if (!_data[item] && _data[item] !== 0) delete _data[item]
          })
          if (_data.userLevelIds) {
            _data.userLevelIds = _data.userLevelIds.join(',')
          }
          if (_data.tempUserIds) {
            _data.tempUserIds = _data.tempUserIds.replace(/，/g, ',').replace(/\r|\n/g, ',').replace(/,,/g, ',')
          }
          _data.discount = _data.discount / 100
          _data['appPackageType'] = this.appType
          let _exceleData = new FormData()
          if (_data.excel) {
            Object.keys(_data).forEach(item => {
              _exceleData.append(item, _data[item])
            })
          }
          this.$service(this.form.pointCardId ? this.queryApi.update : this.queryApi.add, {
            method: 'post',
            urlParams: {type: this.type, pointCardId: this.form.pointCardId},
            headers: _data.excel ? {
              'Content-Type': 'multipart/form-data'
            } : null,
            data: _data.excel ? _exceleData : _data
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              if (_data.excel) this.$refs.upload.clearFiles()
              this.$message.success(this.form.pointCardId ? '修改点卡成功' : '新增点卡成功')
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
        this.form = Object.assign({
          name: '',
          shortName: '',
          description: '',
          point: '',
          discount: '',
          pointCardData: '',
          price: '',
          redCurrency: '',
          productCode: '',
          validDay: '',
          hasLinkUrl: '1',
          newUserEnjoy: '0',
          userRestrict: '0',
          userLevelIds: [],
          tempUserIds: '',
          perCardCount: '',
          totalCount: '',
          dailyCount: '',
          timeRestrict: '0',
          timeStart: '',
          timeEnd: '',
          inUseStatus: '1',
          excel: ''
        }, this.data || {})
        if (this.data && this.data.pointCardId) {
          this.form.discount = this.form.discount * 100
          if (this.data.userLevelIdList) this.form.userLevelIds = this.data.userLevelIdList
          if (this.data.tempUserIdList) this.form.tempUserIds = this.data.tempUserIdList
          this.form.description = this.data.description.replace(/<br(\s)?(\/)?>/g, '\n')
          this.form.inUseStatus = this.data.status ? '1' : '0'
        }
        this.form.hasLinkUrl = this.form.hasLinkUrl + ''
        this.form.inUseStatus = this.form.inUseStatus + ''
        this.form.newUserEnjoy = this.form.newUserEnjoy + ''
        this.form.userRestrict = this.form.userRestrict + ''
        this.form.timeRestrict = this.form.timeRestrict + ''
        this.form.noActiveValidDay = this.type === 'vipSupply' ? this.form.noActiveValidDay : ''
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      } else {
        this.$emit('closeDialog')
      }
    },
    userLevel (val) {
      val.forEach(item => {
        if (item.userGroupType === 0) this.singleUserId = item.userLevelId
      })
    }
  }
}
</script>
