<template>
  <div class="market-cooperation-app">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="appPop()">新建合作方应用</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="appId"
        label="合作方应用ID"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="name"
        label="合作方应用名称"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="identify"
        label="应用唯一标示"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="vendorName"
        label="关联母公司"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="factor"
        label="货币兑换比例"
        min-width="110">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        min-width="150">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="220">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="appPop(scope.row, true)">详情</el-button>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="appPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="appDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value= "0"
            :inactive-value= "1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
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
      :title="(form.look ? '查看' : form.appId ? '修改' : '新建') + '合作方应用信息'"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :disabled="updateLoading||form.look" label-width="110px" size="small" ref="form">
        <el-form-item label="渠道名" prop="name"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input v-model="form.name" maxlength="50" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="渠道号" prop="identify"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[a-zA-Z0-9_-]{1,}$/, message: '必须为数字大小写字母或_-组成', trigger: ['blur', 'change']}]">
          <el-input v-model="form.identify" maxlength="50" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="!form.look">*该标识作为与合作方联合开发的唯一标识，填后不可更改，不可与已有应用标识重复</el-form-item>
        <el-form-item label="合作母公司"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="form.vendorId" placeholder="请选择">
            <el-option
              v-for="item in companyList"
              :key="item.vendorId"
              :label="item.name"
              :value="item.vendorId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用公钥" prop="publicKey">
          <el-input type="textarea" :rows="3" placeholder="如果不填写，会自动生成" v-model="form.publicKey"></el-input>
        </el-form-item>
        <el-form-item label="应用私钥" prop="privateKey">
          <el-input type="textarea" :rows="3" placeholder="如果不填写，会自动生成" v-model="form.privateKey"></el-input>
        </el-form-item>
        <el-form-item label="合作公司公钥" prop="cooperationPublicKey"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input type="textarea" :rows="3" v-model="form.cooperationPublicKey"></el-input>
        </el-form-item>
        <el-form-item label="IP白名单" prop="ipWhiteList"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9,.]{1,}$/, message: '不符合IP格式', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" maxlength="500" v-model="form.ipWhiteList"></el-input>
        </el-form-item>
        <el-form-item v-if="!form.look">*多个IP白名单时，中间用英文逗号分隔</el-form-item>
        <el-form-item label="Push回调地址" prop="pushUrl"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {type: 'url', message: '不符合url格式,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.pushUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="!form.look">*设地址格式必须为http://或https://开头</el-form-item>
        <el-form-item label="商品价格系数" prop="factor"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '必须为数字', trigger: ['blur', 'change']}]">
          1 : <el-input v-model="form.factor" maxlength="20" autocomplete="off" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item v-if="!form.look">*系数1:N是指，在红彩平台售价为1元的方案，在外部应用售价为N元；若乘N得出的外部平台方案单价不是整数，则进一取整显示。</el-form-item>
        <el-form-item label="外部货币单位" prop="unit"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-input v-model="form.unit" maxlength="30" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="下单地址" prop="orderUrl"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {type: 'url', message: '不符合url格式,', trigger: ['blur', 'change']}]">
          <el-input v-model="form.orderUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="可访问专家" prop="expertIds"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9,]{1,}$/, message: '仅支持数字及英文,', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="3" placeholder="专家ID用逗号分隔" v-model="form.expertIds"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!form.look">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MarketCooperationApp, MarketCooperationCompany } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'markeCooperationApp',
  data () {
    return {
      loading: false,
      offset: 0,
      limit: 25,
      total: 1,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      companyList: [],
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
      this.$service(MarketCooperationApp.list, {
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
    getCompanyList () {
      if (this.companyList.length > 0) return Promise.resolve()
      return this.$service(MarketCooperationCompany.list, {
        params: {
          offset: 0,
          limit: 1000
        }
      }).then(res => {
        if (res.code === 200 && res.data.data && res.data.data.length > 0) {
          this.companyList = res.data.data
          return Promise.resolve(res.data.data)
        } else {
          this.$message.warning('获取不到合作母公司列表，请稍后再试')
        }
      }, err => {
        if (err) this.$message.warning('获取不到合作母公司列表，请稍后再试')
      })
    },
    appPop (data, look) {
      this.getCompanyList().then(() => {
        this.form = Object.assign({}, data || {})
        if (!data) this.form.vendorId = this.companyList[0].vendorId
        if (look) this.form['look'] = true
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(this.form.appId ? MarketCooperationApp.update : MarketCooperationApp.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              if (!this.form.appId) this.offset = 0
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
    },
    appDel (data) {
      this.$set(data, 'loading', true)
      this.$service(MarketCooperationApp.del, {
        method: 'post',
        data: {
          appId: data.appId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(Math.floor(this.offset / this.limit) + 1)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        appId: data.appId,
        status: data.status
      }
      this.$service(MarketCooperationApp.status, {
        method: 'post',
        data: _data
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.statusLoading = false
          this.$message.success('状态更新成功')
        } else {
          data.statusLoading = false
          this.$set(data, 'status', data.status ? 0 : 1)
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(JSON.stringify(err))
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
