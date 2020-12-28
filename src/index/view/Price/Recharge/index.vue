<template>
  <div class="price-recharge">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="priceRechargePop()">新建价格</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs(0)">
      <el-tab-pane label="红彩" :disabled="loading" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" :disabled="loading" name="1"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="goodsTab" @tab-click="handleClickTabs(1)">
      <el-tab-pane :label="item.name" :disabled="loading" :name="item.id" v-for="(item, index) in goodsTabArr[activeTab]" :key="index"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="iOSGoodsTab" @tab-click="handleClickTabs(2)" v-show="activeTab==='0'&&goodsTab===2">
      <el-tab-pane label="主包" :disabled="loading" :name="2"></el-tab-pane>
      <el-tab-pane label="马甲包1" :disabled="loading" :name="6"></el-tab-pane>
      <el-tab-pane label="马甲包2" :disabled="loading" :name="7"></el-tab-pane>
      <el-tab-pane label="马甲包3" :disabled="loading" :name="8"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="goodsId"
        label="商品ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="goodsName"
        label="商品名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="appleGoodsId"
        label="产品码"
        min-width="160">
      </el-table-column>
      <el-table-column
        prop="goodsPrice"
        label="商品定价(元)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="redCurrency"
        label="红豆数量(豆)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="realGoodsPrice"
        label="实际价格"
        width="90">
      </el-table-column>
      <el-table-column
        prop="realRedCurrency"
        label="实际红豆数"
        width="90">
      </el-table-column>
      <el-table-column
        prop="displayHot"
        label="标识"
        width="100">
        <template slot-scope="scope">
          {{priceTag[scope.row.displayHot] || '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="生效日期"
        min-width="150">
        <template slot-scope="scope">
          {{[scope.row.startTime, 'yyyy.MM.dd', '--'] | dateFormat}} ~ {{[scope.row.endTime, 'yyyy.MM.dd', '--'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="70">
        <template slot-scope="scope">
          {{scope.row.status==0 ? '正常' : '停用'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="权重"
        width="70">
        <template slot-scope="scope">
          <el-button type="text" @click="changeWeight(scope.row)">{{scope.row.weight}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="priceRechargePop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="form.goodsId?'修改价格':'新建价格'"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="110px" size="small" ref="priceRechargeForm">
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="form.goodsName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="商品定价(元)" prop="goodsPrice">
          <el-input v-model="form.goodsPrice" autocomplete="off" :disabled="form.goodsId"></el-input>
        </el-form-item>
        <el-form-item label="红豆数量(豆)" prop="redCurrency">
          <el-input v-model="form.redCurrency" autocomplete="off" :disabled="form.goodsId"></el-input>
        </el-form-item>
        <el-form-item label="实际价格(元)" prop="realPrice">
          <el-input v-model="form.realPrice" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="标识" prop="displayHot">
          <el-radio v-model="form.displayHot" :label="key" v-for="(value, key) in priceTag" :key="key">{{value}}</el-radio>
        </el-form-item>
        <el-form-item
          label="实际红豆数量"
          prop="realRedCurrency"
          v-show="form.displayHot === '2'"
          :rules="[{required: this.form.displayHot === '2', message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{1,5}$/, message: '整数且1-99999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.realRedCurrency" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="form.startTime"
            type="date"
            style="width:130px"
            value-format="yyyy-MM-dd 00:00:00"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.endTime).getTime() !== 0 && time.getTime() > new Date(form.endTime).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            v-model="form.endTime"
            type="date"
            style="width:130px"
            value-format="yyyy-MM-dd 23:59:59"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() || (new Date(form.startTime).getTime() !== 0 && time.getTime() < new Date(form.startTime).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="适用范围" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择">
            <el-option
              v-for="item in goodsTabArr[activeTab]"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
            <el-option label="马甲包1" value="6" v-if="activeTab==='0'"></el-option>
            <el-option label="马甲包2" value="7" v-if="activeTab==='0'"></el-option>
            <el-option label="马甲包3" value="8" v-if="activeTab==='0'"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="产品码"
          prop="appleGoodsId"
          v-show="parseInt(form.typeId)==2||(activeTab==='0'&&(parseInt(form.typeId)==6||parseInt(form.typeId)==7||parseInt(form.typeId)==8))"
          :rules="[{required: parseInt(form.typeId)==2||(activeTab==='0'&&(parseInt(form.typeId)==6||parseInt(form.typeId)==7||parseInt(form.typeId)==8)), message: '必填', trigger: ['blur', 'change']},
            {max:100, message: '最多100字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.appleGoodsId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option label="正常" value="0"></el-option>
            <el-option label="停用" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('priceRechargeForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { PriceRecharge } from '../../../util/api'
import { formatDate } from '../../../util/tool'
import { mapState } from 'vuex'
export default {
  name: 'PriceRecharge',
  data () {
    return {
      activeTab: '0',
      goodsTab: 2,
      iOSGoodsTab: 2,
      goodsTabArr: {
        0: [
          {
            id: 2,
            name: 'iOS'
          },
          {
            id: 1,
            name: 'Android'
          },
          {
            id: 3,
            name: 'PC'
          },
          {
            id: 4,
            name: 'WAP'
          },
          {
            id: 5,
            name: 'PRVIP'
          },
          {
            id: 9,
            name: 'iOSWAP'
          },
          {
            id: 12,
            name: 'iOS套壳WAP'
          },
          {
            id: 13,
            name: '套壳WAP'
          }
        ],
        1: [
          {
            id: 2,
            name: 'iOS'
          },
          {
            id: 1,
            name: 'Android'
          },
          {
            id: 3,
            name: 'PC'
          },
          {
            id: 4,
            name: 'WAP'
          },
          {
            id: 5,
            name: 'iOSWAP'
          }
        ]
      },
      loading: false,
      list: [],
      tableHeight: null,
      priceTag: {
        '0': '无',
        '1': 'HOT',
        '2': '首冲特惠'
      },
      dialogFormVisible: false,
      form: {
        goodsName: '',
        goodsPrice: '',
        redCurrency: '',
        realPrice: '',
        displayHot: '0',
        realRedCurrency: '',
        startTime: '',
        endTime: '',
        typeId: '',
        appleGoodsId: '',
        status: '0'
      },
      formRules: {
        appleChannelGroupId: [
          {required: true, message: '类型必选', trigger: 'blur'}
        ],
        goodsName: [
          {required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 15, message: '长度不多于15个字符', trigger: ['blur', 'change']}
        ],
        goodsPrice: [
          {required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}
        ],
        redCurrency: [
          {required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}
        ],
        realPrice: [
          {required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,4}$/, message: '整数且1-99999', trigger: ['blur', 'change']}
        ],
        typeId: [{required: true, message: '适用范围必选', trigger: ['blur', 'change']}],
        appleGoodsId: []
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
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    /**
     * @description: 控制标签页切换回调
     * @param {Number} type 标签层级 0 APP层面， 1 价格类型层面 2 iOS的app主包、马甲包层面
     */
    handleClickTabs (type) {
      if (type === 0) this.goodsTab = 2
      if (type === 1) this.iOSGoodsTab = 2
      this.getList()
      this.setHeight()
    },
    getList () {
      if (this.loading) return
      this.loading = true
      this.$service(PriceRecharge[this.activeTab].list, {
        urlParams: {
          payTerminalId: this.activeTab === '0' && this.goodsTab === 2 ? this.iOSGoodsTab : this.goodsTab
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.$refs.elTable.bodyWrapper.scrollLeft = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    /**
     * @description: 更新状态的switch开关
     * @param {Object} data 数据对象，如果更新失败，则还原为原来的状态
     */
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        goodsId: data.goodsId,
        status: data.status
      }
      this.$service(PriceRecharge[this.activeTab].status, {
        method: 'post',
        data: _data
      }).then((res) => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'status', data.status ? 0 : 1)
          this.$message.error(res.code + ':' + res.message)
        }
      }, (err) => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    changeWeight (data) {
      this.$prompt('', '修改权重', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{1,2}$/,
        inputErrorMessage: '0-99之间',
        closeOnClickModal: false,
        inputValue: data.weight
      }).then(({ value }) => {
        this.$service(PriceRecharge[this.activeTab].weight, {
          method: 'post',
          data: {
            goodsId: data.goodsId,
            weight: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.getList()
            this.$message.success('权重修改成功！')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    priceRechargePop (data) {
      this.form = Object.assign({goodsName: '',
        goodsPrice: '',
        redCurrency: '',
        realPrice: '',
        displayHot: '0',
        realRedCurrency: '',
        startTime: '',
        endTime: '',
        typeId: '',
        appleGoodsId: '',
        status: '0'}, data || {})
      this.form.displayHot = this.form.displayHot + ''
      this.form.status = this.form.status + ''
      if (this.form.startTime) this.form.startTime = formatDate(this.form.startTime, 'yyyy-MM-dd hh:mm:ss')
      if (this.form.endTime) this.form.endTime = formatDate(this.form.endTime, 'yyyy-MM-dd hh:mm:ss')
      if (data) this.form['realPrice'] = this.form.realGoodsPrice
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.priceRechargeForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          if (!this.form.goodsId) this.form['payTerminalId'] = this.form.typeId
          this.$service(this.form.goodsId ? PriceRecharge[this.activeTab].update : PriceRecharge[this.activeTab].add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getList()
              this.$message.success((this.form.goodsId ? '更新' : '添加') + '成功')
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
