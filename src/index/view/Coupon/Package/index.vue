<template>
    <div class="coupon-package">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button v-if="activeTab === '0'" type="danger" size="small" @click="ResendNewCoupon">补发新手礼包</el-button>
        <el-button type="primary" size="small" @click="dialogWrapData={},dialogWrapVisible=true">新建组合</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight"
      :row-key="getRowKeys"
      :expand-row-keys="expands"
      @cell-click="countExpand"
      @row-click="countExpand"
      @expand-change="countExpand">
      <el-table-column fixed type="expand">
        <template slot-scope="props">
          <el-table
            :data="props.row.list"
            v-loading="props.row.loading">
            <el-table-column
              prop="couponId"
              label="类型ID"
              width="80">
              <template slot-scope="scope">
                {{scope.row.couponId}}
                <el-tooltip effect="dark" content="优惠券已发完" placement="top" v-if="!scope.row.isFetch">
                  <span class="el-icon-warning" style="font-size:18px;color:#e62121;"></span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="wrapName"
              label="类型"
              width="80">
              <template slot-scope="scope">
                {{scope.row.couponType | couponType2CH}}
              </template>
            </el-table-column>
            <el-table-column
              prop="couponName"
              label="优惠券名称"
              min-width="130">
              <template slot-scope="scope">
                <router-link :to="{name: 'CouponDetail', params: {id: scope.row.couponId, source: activeTab}}">{{scope.row.couponName}}</router-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="validType"
              label="有效期"
              min-width="100">
              <template slot-scope="scope">
                {{scope.row.validType === 0 ? scope.row.validDay + '天' : scope.row.validStartDate + ' ~ ' + scope.row.validEndDate}}
              </template>
            </el-table-column>
            <el-table-column
              prop="discountStr"
              label="优惠力度"
              width="100">
            </el-table-column>
            <el-table-column
              prop="useCount"
              label="使用数"
              width="80">
            </el-table-column>
            <el-table-column
              prop="fetchCount"
              label="领取数"
              width="80">
            </el-table-column>
            <el-table-column
              prop="amount"
              label="总数"
              width="90">
              <template slot-scope="scope">
                {{scope.row.amountType === 0 ? scope.row.fetchCount : scope.row.amount}}
              </template>
            </el-table-column>
            <el-table-column
              prop="amount"
              label="导出数"
              width="80">
              <template slot-scope="scope">
                {{scope.row.amountType === 0 && scope.row.exportCount ? scope.row.exportCount : '-'}}
              </template>
            </el-table-column>
            <el-table-column
              prop="amount"
              label="导出待领取数"
              width="110">
              <template slot-scope="scope">
                {{scope.row.amountType === 0 && scope.row.unclaimedCount ? scope.row.unclaimedCount : '-'}}
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
              label="类型发放日期"
              min-width="160">
              <template slot-scope="scope">
                {{scope.row.releaseTimeType === 0 ? '-' : scope.row.releaseStartDate + ' ~ ' + scope.row.releaseEndDate}}
              </template>
            </el-table-column>
            <el-table-column
              prop="validStatus"
              label="状态"
              width="90">
              <template slot-scope="scope">
                {{scope.row.validStatus ? '停用' : '正常'}}
                <span v-if="scope.row.validStatus===0&&!scope.row.isValid" class="el-icon-warning" style="font-size:18px;color:#e62121;"></span>
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label="操作"
              width="300">
              <template slot-scope="scope">
                <el-popover
                  v-if="props.row.couponWrapType!=='1001'&&scope.row.amountType===1&&!(scope.row.validType==1 && new Date(scope.row.validEndDate).valueOf() < new Date().valueOf())"
                  v-model="scope.row.addPop"
                  placement="left-start"
                  trigger="click">
                  <el-input size="small" v-model="scope.row.addCount" placeholder="整数且大于0"></el-input>
                  <div style="text-align: right; margin: 10px 0 0">
                    <el-button size="mini" type="text" @click="scope.row.addPop=false">取消</el-button>
                    <el-button size="mini" type="" :loading="scope.row.addLoading" @click="couponAdd(scope.row)">增加</el-button>
                    <el-button type="primary" size="mini" @click="couponAdd(scope.row, true)">增加并导出</el-button>
                  </div>
                  <el-button slot="reference" type="primary" plain size="mini" @click.native="$set(scope.row, 'addCount', '')">增加券数</el-button>
                </el-popover>
                <el-button type="primary" size="mini" plain @click="categoryPop(scope.row, scope.row.couponId)">修改</el-button>
                <el-button type="primary" size="mini" plain @click="categoryPop(scope.row)">复制</el-button>
                <el-switch
                  active-color="#e6212180"
                  v-model="scope.row.validStatus"
                  :disabled="scope.row.statusLoading"
                  :active-value="0"
                  :inactive-value="1"
                  @click.native="switchCouponId(scope.row)">
                </el-switch>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        fixed
        prop="couponWrapId"
        label="组合ID"
        width="80">
        <template slot-scope="scope">
          {{scope.row.couponWrapId}}
          <span v-if="!scope.row.isFetch" class="el-icon-warning" style="font-size:18px;color:#e62121;"></span>
        </template>
      </el-table-column>
      <el-table-column
        prop="wrapName"
        label="组合名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="140">
      </el-table-column>
      <el-table-column
        prop="fetchCount"
        label="发放次数"
        width="120">
      </el-table-column>
      <el-table-column
        label="组合发放日期"
        min-width="160">
        <template slot-scope="scope">
          {{scope.row.releaseTimeType !== 1 ? '-' : scope.row.releaseStartDate + ' ~ ' + scope.row.releaseEndDate}}
        </template>
      </el-table-column>
      <el-table-column
        prop="useCount"
        label="是否可重复领取"
        width="120">
        <template slot-scope="scope">
          {{scope.row.isMultGet?'是':'否'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="validStatus"
        label="状态"
        width="80">
        <template slot-scope="scope">
          {{scope.row.couponWrapStatus ? '停用' : '正常'}}
          <span v-if="scope.row.couponWrapStatus===0&&!scope.row.isValid" class="el-icon-warning" style="font-size:18px;color:#e62121;"></span>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="280">
        <template slot-scope="scope">
          <el-button v-if="scope.row.couponWrapStatus === 0" type="primary" size="mini" @click.stop="dialogSendId=scope.row.couponWrapId,dialogSendVisible=true">定向发放</el-button>
          <el-button type="primary" size="mini" @click.stop="dialogCategoryData={},dialogCouponWrapId=scope.row.couponWrapId,dialogCategoryVisible=true">添加类别</el-button>
          <el-button type="primary" size="mini" icon="el-icon-edit" circle @click.stop="dialogWrapData=scope.row,dialogWrapVisible=true"></el-button>
          <el-switch
            v-model="scope.row.couponWrapStatus"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native.stop="switchCouponWrapId(scope.row)">
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
    <dialog-coupon-wrap
      :tab="activeTab"
      :data="dialogWrapData"
      :visible="dialogWrapVisible"
      @closeDialog="dialogWrapVisible=false"
      @success="getList(dialogWrapData.couponWrapId ? pageIndex : 1)">
    </dialog-coupon-wrap>
    <dialog-coupon-category
      :tab="activeTab"
      :data="dialogCategoryData"
      :visible="dialogCategoryVisible"
      :couponWrapId="dialogCouponWrapId"
      @closeDialog="dialogCategoryVisible=false"
      @success="categorySuccess">
    </dialog-coupon-category>
    <dialog-coupon-send
      :tab="activeTab"
      :id="dialogSendId"
      :visible="dialogSendVisible"
      @closeDialog="dialogSendVisible=false"
      @success="getList(pageIndex).then(() => {categorySuccess()})">
    </dialog-coupon-send>
  </div>
</template>

<script>
import { CouponPackage, CouponCategory, CouponDetail } from '../../../util/api'
import { mapState } from 'vuex'
import DialogCouponWrap from '../Components/DialogCouponWrap'
import DialogCouponCategory from '../Components/DialogCouponCategory'
import DialogCouponSend from '../Components/DialogCouponSend'
export default {
  name: 'couponPackage',
  data () {
    return {
      activeTab: '0',
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      expands: [],
      dialogWrapData: {},
      dialogWrapVisible: false,
      dialogCategoryData: {},
      dialogCategoryVisible: false,
      dialogCouponWrapId: null,
      dialogSendId: null,
      dialogSendVisible: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  components: {
    DialogCouponWrap,
    DialogCouponCategory,
    DialogCouponSend
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
      this.list = []
      this.getList()
    },
    getRowKeys (row) {
      return row.couponWrapId
    },
    getList (page) {
      if (this.loading) return
      let scrollTop = this.pageIndex === page ? this.$refs.elTable.bodyWrapper.scrollTop : 0
      this.pageIndex = page || 1
      this.loading = true
      return this.$service(CouponPackage[this.activeTab].list, {
        params: {
          start: this.pageIndex,
          limit: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = scrollTop
          return Promise.resolve()
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
    countExpand (row, column) {
      if (column.length === 0) {
        this.expands = []
        return
      }
      if (this.expands.indexOf(row.couponWrapId) > -1) return
      this.expands = [row.couponWrapId]
      this.getCategoryList(row)
    },
    getCategoryList (row) {
      this.$set(row, 'loading', true)
      if (!row.list) this.$set(row, 'list', [])
      this.$service(CouponPackage[this.activeTab].listByCouponWrapId, {
        urlParams: {
          couponWrapId: row.couponWrapId
        }
      }).then(res => {
        row.loading = false
        if (res.code === 200) {
          this.$set(row, 'list', res.data)
        } else {
          this.$message.error(res.message)
        }
      }, err => {
        if (err) {
          row.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    switchCouponWrapId (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        couponWrapId: data.couponWrapId,
        couponWrapStatus: data.couponWrapStatus
      }
      this.$service(CouponPackage[this.activeTab].status, {
        method: 'post',
        data: _data
      }).then(res => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'couponWrapStatus', data.couponWrapStatus ? 0 : 1)
          this.$message.error(res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'couponWrapStatus', data.couponWrapStatus ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    switchCouponId (data) {
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
    categoryPop (data, id) {
      this.$service(CouponCategory[this.activeTab].detail, {
        urlParams: {
          couponId: data.couponId
        }
      }).then(res => {
        if (res.code === 200) {
          this.dialogCategoryData = res.data
          if (id) {
            this.dialogCouponWrapId = null
          } else {
            this.dialogCouponWrapId = this.expands[0]
            delete this.dialogCategoryData.couponId
          }
          this.dialogCategoryVisible = true
        } else {
          this.$message.error('获取优惠券详情失败，请稍后再试')
        }
      }, err => {
        if (err) this.$message.error('获取优惠券详情失败，请稍后再试')
      })
    },
    categorySuccess () {
      let id = this.expands[0]
      if (!id) return
      this.list.forEach(item => {
        if (item.couponWrapId === id) this.getCategoryList(item)
      })
    },
    couponAdd (data, flag) {
      if (!/\d+/.test(data.addCount)) return this.$message.warning('要增加的券数必须为整数')
      if (data.addCount < 1) return this.$message.warning('要增加的券数必须大于0')
      if (flag) {
        window.open(location.origin + CouponDetail[this.activeTab].addExport + '?couponId=' + data.couponId + '&count=' + data.addCount)
        data.addPop = false
        this.categorySuccess()
      } else {
        if (data.addLoading) return
        this.$set(data, 'addLoading', true)
        this.$service(CouponDetail[this.activeTab].add, {
          method: 'post',
          data: {
            couponId: data.couponId,
            count: data.addCount
          }
        }).then(res => {
          data.addLoading = false
          if (res.code === 200) {
            data.addPop = false
            this.$message.success('券数增加成功')
            this.categorySuccess()
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            data.addLoading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      }
    },
    ResendNewCoupon () {
      this.$prompt('输入新手通行证账号', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        inputErrorMessage: '邮箱格式不正确',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.$service(CouponPackage[this.activeTab].ResendNewCoupon, {
          params: {
            account: value
          }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('补发新手礼包成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
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
