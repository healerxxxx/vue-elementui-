<template>
  <div class="market-wap-coupon">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="wapCouponPop()">新建WAP优惠券渠道开关</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="partnerName"
        label="渠道名称"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="partnerCode"
        label="渠道号"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="partnerName"
        label="状态"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.switchValue?'上线':'下线'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="80">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="wapCouponPop(scope.row)"></el-button>
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
    <el-dialog
      :title="form.createTime?'修改WAP优惠券渠道开关':'新建WAP优惠券渠道开关'"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="渠道名" prop="partnerName">
          <el-input v-model="form.partnerName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="渠道号" prop="updatePartnerCode">
          <el-input v-model="form.updatePartnerCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="开关控制">
          <el-radio v-model="form.switchValue" label="1">上线</el-radio>
          <el-radio v-model="form.switchValue" label="0">下线</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MarketWapCoupon } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'marketWapCoupon',
  data () {
    return {
      loading: false,
      offset: 0,
      limit: 25,
      total: 1,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {
        partnerName: '',
        updatePartnerCode: '',
        switchValue: '1'
      },
      formRules: {
        partnerName: [
          {required: true, message: '不为空', trigger: ['blur', 'change']}
        ],
        updatePartnerCode: [
          {required: true, message: '请输入渠道号', trigger: ['blur', 'change']},
          {pattern: /^[0-9a-zA-Z_-]{1,}$/, message: '仅支持字母、数字及_或-', trigger: ['blur', 'change']}
        ]
      },
      updateLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
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
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      this.$service(MarketWapCoupon.list, {
        params: {
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.total = res.data.total || 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    wapCouponPop (data) {
      this.form = Object.assign({}, data || {partnerName: '', updatePartnerCode: '', switchValue: '1'})
      this.form.switchValue = this.form.switchValue + ''
      if (data) this.form['updatePartnerCode'] = data.partnerCode
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          if (!this.form.createTime) {
            this.form['partnerCode'] = this.form.updatePartnerCode
            delete this.form.updatePartnerCode
          }
          this.$service(this.form.createTime ? MarketWapCoupon.update : MarketWapCoupon.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getList(Math.floor(this.offset / this.limit) + 1)
              this.$message.success((this.form.createTime ? '更新' : '添加') + '成功')
            } else {
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
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
