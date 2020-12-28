<template>
  <div class="sp-dialog">
    <el-dialog
      :title="form.subscribeProductId ? '修改价格' : '新增价格'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="500px"
      center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        label-width="120px"
        ref="form"
        size="small">
        <el-form-item
          label="商品全称"
          prop="title"
          :rules="[
            { required: true, message: '不为空', trigger: ['blur', 'change'] },
            { max: 20, message: '最多20个字', trigger: ['blur', 'change'] }
          ]">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="商品简称"
          prop="subTitle"
          :rules="[
            { required: true, message: '不为空', trigger: ['blur', 'change'] },
            { max: 5, message: '最多5个字', trigger: ['blur', 'change'] }
          ]">
          <el-input v-model="form.subTitle" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="付费类型" prop="freeSign" v-show="type!==2&&type!==11&&!form.subscribeProductId">
          <el-radio v-model="form.freeSign" label="1">普通</el-radio>
          <el-radio v-model="form.freeSign" label="2">免费试用</el-radio>
          <el-radio v-model="form.freeSign" label="3">VIP免费试用</el-radio>
          <el-radio v-model="form.freeSign" label="4">彩票地推免费试用</el-radio>
        </el-form-item>
        <el-form-item label="可用场次数" prop="dataCount" :rules="[{required: type===2||type===11, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,3}$/, message: '整数且0-999', trigger: ['blur', 'change']}]" v-show="type===2||type===11">
          <el-input v-model="form.dataCount" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送积分" prop="creditPresent" :rules="[{required: type===2||type===11, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d{1,8}$/, message: '整数且0-99999999', trigger: ['blur', 'change']}]" v-show="type===2||type===11">
          <el-input v-model="form.creditPresent" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="商品定价(元)" prop="price" :rules="[{required: form.freeSign==='1', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}]"
          v-show="form.freeSign==='1'">
          <el-input v-model="form.price" autocomplete="off" :disabled="form.subscribeProductId"></el-input>
        </el-form-item>
        <el-form-item label="红豆数量(豆)" prop="redCurrency" :rules="[{required: form.freeSign==='1', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}]"
          v-show="form.freeSign==='1'">
          <el-input v-model="form.redCurrency" autocomplete="off" :disabled="form.subscribeProductId"></el-input>
        </el-form-item>
        <el-form-item label="有效期" prop="effectiveType">
          <el-radio v-model="form.effectiveType" label="0">无</el-radio>
          <el-radio v-model="form.effectiveType" label="1">相对</el-radio>
        </el-form-item>
        <el-form-item label="相对天数" prop="days" :rules="[{required: form.effectiveType==='1', message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,2}$/, message: '整数且0-999', trigger: ['blur', 'change']}]"
          v-show="form.effectiveType === '1'">
          <el-input v-model="form.days" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="iOS产品码" prop="appleGoodsId"
          :rules="[{required: form.freeSign!=='2', message: '必填', trigger: ['blur', 'change']}]"
          v-show="form.freeSign !== '2'">
          <el-input v-model="form.appleGoodsId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="平台" prop="payTerminalId">
          <el-select v-model="form.payTerminalId" placeholder="请选择">
            <el-option value="0" label="其他"></el-option>
            <el-option value="4" label="WAP"></el-option>
            <el-option :value="{0: '9', 1: '5'}[appTab]" label="iOSWAP"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option value="0" label="正常"></el-option>
            <el-option value="1" label="停用"></el-option>
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
import { PriceProductSp } from '../../../../util/api'
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
        title: '',
        subTitle: '',
        freeSign: '1',
        dataCount: '',
        creditPresent: '',
        price: '',
        redCurrency: '',
        effectiveType: '1',
        days: '',
        appleGoodsId: '',
        payTerminalId: '0',
        status: '0'
      },
      updateLoading: false
    }
  },
  computed: {
    queryApi () {
      return PriceProductSp[this.appTab]
    }
  },
  methods: {
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          if (this.form.subscribeProductId) {
            this.form['spId'] = this.form.subscribeProductId
          } else {
            this.form['typeId'] = this.type
          }
          this.$service(this.form.subscribeProductId ? this.queryApi.update : this.queryApi.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$message.success(this.form.subscribeProductId ? '修改价格成功' : '新增价格成功')
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
        this.form = Object.assign({}, this.data.subscribeProductId ? this.data : {
          title: '',
          subTitle: '',
          freeSign: '1',
          dataCount: '',
          creditPresent: '',
          price: '',
          redCurrency: '',
          effectiveType: '1',
          days: '',
          appleGoodsId: '',
          payTerminalId: '0',
          status: '0'
        })
        this.form.status = this.form.status + ''
        this.form.payTerminalId = this.form.payTerminalId + ''
        this.form.effectiveType = this.form.effectiveType + ''
        this.form.freeSign = this.form.freeSign + ''
        if (this.form.freeSign !== '1') {
          if (this.form.price === 0) {
            this.form.price = ''
          }
          if (this.form.redCurrency === 0) {
            this.form.redCurrency = ''
          }
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      } else {
        this.$emit('closeDialog')
      }
    },
    type (val) {
      this.type = parseInt(val)
    }
  }
}
</script>
