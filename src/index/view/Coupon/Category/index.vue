<template>
    <div class="coupon-category">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="checkCouponPop()">验券</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="couponTab" @tab-click="handleCouponTabs">
      <el-tab-pane
        v-for="item in couponTypeList"
        :key="item.id"
        :label="item.name"
        :name="item.id.toString()"
        :disabled="loading" />
      <!-- <el-tab-pane label="折扣券" name="1" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="减满券" name="2" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="直减券" name="3" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="免单券" name="4" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="不中退" name="5" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="体验券" name="6" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="体验券" name="7" :disabled="loading"></el-tab-pane> -->
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        fixed
        prop="couponId"
        label="ID"
        width="90">
        <template slot-scope="scope">
          {{scope.row.couponId}}
          <el-tooltip effect="dark" content="优惠券已发完" placement="right" v-if="!scope.row.fetch">
            <span class="el-icon-warning" style="font-size:18px;color:#e62121;"></span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="couponType"
        label="类型"
        width="80">
        <template slot-scope="scope">
          {{scope.row.couponType | couponType2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="couponName"
        label="优惠券名称"
        min-width="160">
        <template slot-scope="scope">
          <router-link :to="{name: 'CouponDetail', params: {id: scope.row.couponId, source: activeTab}}">{{scope.row.couponName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="discountStr"
        label="优惠力度"
        min-width="100">
      </el-table-column>
      <el-table-column
        label="类型发放日期"
        min-width="160">
        <template slot-scope="scope">
          {{scope.row.releaseTimeType === 0 ? '-' : scope.row.releaseStartDate + ' ~ ' + scope.row.releaseEndDate}}
        </template>
      </el-table-column>
      <el-table-column
        prop="useCount"
        label="使用数"
        width="100">
      </el-table-column>
      <el-table-column
        prop="fetchCount"
        label="领取数"
        width="100">
      </el-table-column>
      <el-table-column
        prop="amount"
        label="总数"
        width="100">
        <template slot-scope="scope">
          {{scope.row.amountType === 0 ? scope.row.fetchCount : scope.row.amount}}
        </template>
      </el-table-column>
      <el-table-column
        label="创建方式"
        width="80">
        <template slot-scope="scope">
          {{scope.row.amountType === 0 ? '自动' : '手动'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="validStatus"
        label="状态"
        width="100">
        <template slot-scope="scope">
          {{scope.row.validStatus ? '停用' : '正常'}}
          <span v-if="scope.row.validStatus===0&&!scope.row.valid" class="el-icon-warning" style="font-size:18px;color:#e62121;"></span>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="categoryPop(scope.row)"></el-button>
          <el-switch
            v-model="scope.row.validStatus"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog title="验券" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form
        :model="form"
        :disabled="checkLoading"
        size="small"
        label-width="60px"
        ref="form">
        <el-form-item
          label="券码"
          prop="str"
          :rules="[{required: true, message: '不为空', trigger: ['blur', 'change']},
          {pattern: /^[0-9a-zA-Z]{1,}$/, message: '仅支持字母、数字', trigger: ['blur', 'change']},
          {max: 199, message: '最多199个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.str" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <el-form
        v-if="checkCouponInfo"
        size="mini"
        label-width="100px">
        <el-form-item label="优惠券ID：">
          {{checkCouponInfo.userCouponId}}
        </el-form-item>
        <el-form-item label="优惠券类型：">
          {{checkCouponInfo.couponType | couponType2CH}}
        </el-form-item>
        <el-form-item label="优惠力度：">
          {{checkCouponInfo.discountStr}}
        </el-form-item>
        <el-form-item label="优惠券名称：">
          {{checkCouponInfo.couponName}}
        </el-form-item>
        <el-form-item label="有效日期：">
          {{checkCouponInfo.validStr}}
        </el-form-item>
        <el-form-item label="领取人：">
          {{checkCouponInfo.account || '未领取'}}
        </el-form-item>
        <el-form-item label="领取时间：" v-if="checkCouponInfo.fetchTime">
          {{checkCouponInfo.fetchTime}}
        </el-form-item>
        <el-form-item label="状态：">
          {{checkCouponInfo.statusStr}}
        </el-form-item>
        <el-form-item label="使用时间：" v-if="checkCouponInfo.useTime">
          {{checkCouponInfo.useTime}}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" :loading="checkLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
    <dialog-coupon-category
      :tab="activeTab"
      :data="dialogCategoryData"
      :visible="dialogCategoryVisible"
      @closeDialog="dialogCategoryVisible=false"
      @success="getList(pageIndex)">
    </dialog-coupon-category>
  </div>
</template>

<script>
import { CouponCategory } from '../../../util/api'
import { mapState } from 'vuex'
import DialogCouponCategory from '../Components/DialogCouponCategory'
import baseType from '../../../util/base'
export default {
  name: 'couponCategory',
  data () {
    return {
      activeTab: '0',
      couponTab: '1',
      couponTypeList: baseType.couponType,
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      form: {
        str: ''
      },
      dialogFormVisible: false,
      checkLoading: false,
      checkCouponInfo: null,
      dialogCategoryData: {},
      dialogCategoryVisible: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  components: {
    DialogCouponCategory
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
    handleClickTabs () {
      this.couponTab = '1'
      this.handleCouponTabs()
    },
    handleCouponTabs () {
      this.pageIndex = 1
      this.pageCount = 1
      this.list = []
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.pageIndex = page || 1
      this.loading = true
      this.$service(CouponCategory[this.activeTab].list, {
        urlParams: {
          type: this.couponTab,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        couponId: data.couponId,
        validStatus: data.validStatus
      }
      this.$service(CouponCategory[this.activeTab].status, {
        method: 'post',
        data: _data
      }).then(res => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'validStatus', data.validStatus ? 0 : 1)
          this.$message.error(res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'validStatus', data.validStatus ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    categoryPop (data) {
      this.$service(CouponCategory[this.activeTab].detail, {
        urlParams: {
          couponId: data.couponId
        }
      }).then(res => {
        if (res.code === 200) {
          this.dialogCategoryData = res.data
          this.dialogCategoryVisible = true
        } else {
          this.$message.error('获取优惠券详情失败，请稍后再试')
        }
      }, err => {
        if (err) this.$message.error('获取优惠券详情失败，请稍后再试')
      })
    },
    checkCouponPop () {
      this.form.str = ''
      this.checkCouponInfo = null
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.checkLoading) return
          this.checkCouponInfo = null
          this.checkLoading = true
          this.$service(CouponCategory[this.activeTab].checkCouponStr, {
            urlParams: {
              str: this.form.str
            }
          }).then(res => {
            this.checkLoading = false
            if (res.code === 200) {
              this.checkCouponInfo = res.data
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.checkLoading = false
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
