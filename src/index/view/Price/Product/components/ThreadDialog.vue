<template>
  <div class="thread-dialog">
    <el-dialog
      :title="form.threadPriceId ? '修改价格' : '新增价格'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="500px"
      center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="120px" ref="form" size="small">
        <el-form-item label="商品全称" prop="threadPriceName">
          <el-input v-model="form.threadPriceName" autocomplete="off" :disabled="form.userId"></el-input>
        </el-form-item>
        <el-form-item label="商品定价(元)" prop="threadPrice">
          <el-input v-model="form.threadPrice" autocomplete="off" :disabled="form.threadPriceId"></el-input>
        </el-form-item>
        <el-form-item label="红豆数量(豆)" prop="redCurrency">
          <el-input v-model="form.redCurrency" autocomplete="off" :disabled="form.threadPriceId"></el-input>
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
import { PriceProductArticle } from '../../../../util/api'
export default {
  name: 'ThreadDialog',
  props: {
    appTab: {
      default: 0
    },
    data: {
      type: 'Object',
      default () {
        return {}
      }
    },
    visible: {
      type: 'Boolean',
      default: false
    }
  },
  data () {
    return {
      form: {
        threadPriceName: '',
        threadPrice: '',
        redCurrency: '',
        status: '0'
      },
      formRules: {
        threadPriceName: [
          {required: true, message: '不为空', trigger: ['blur', 'change']},
          {max: 15, message: '最多15个字', trigger: ['blur', 'change']}
        ],
        threadPrice: [
          {required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}
        ],
        redCurrency: [
          {required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}
        ]
      },
      updateLoading: false
    }
  },
  computed: {
    queryApi () {
      return PriceProductArticle[this.appTab]
    }
  },
  methods: {
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          this.$service(this.form.threadPriceId ? this.queryApi.update : this.queryApi.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$message.success(this.form.threadPriceId ? '修改方案价格成功' : '新增方案价格成功')
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
        this.form = Object.assign({}, this.data.threadPriceId ? this.data : {
          threadPriceName: '',
          threadPrice: '',
          redCurrency: '',
          status: '0'
        })
        this.form.status = this.form.status + ''
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
