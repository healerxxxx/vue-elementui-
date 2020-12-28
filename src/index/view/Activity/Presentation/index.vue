<template>
  <div class="activity-presentation">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="newPop()">新建活动</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="buyXGetNActivityId"
        label="活动ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="activityName"
        label="活动名称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="startTime"
        label="开始时间"
        min-width="120">
        <template slot-scope="scope">
          {{[scope.row.startTime, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="endTime"
        label="结束时间"
        min-width="120">
        <template slot-scope="scope">
          {{[scope.row.endTime, 'yyyy-MM-dd'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        label="购买规则"
        min-width="130">
        <template slot-scope="scope">
          {{rulesList[scope.row.buyStatsRuleTypeId] || ''}}
        </template>
      </el-table-column>
      <el-table-column
        prop="buyCount"
        label="购买篇数"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="couponIds"
        label="赠送优惠券数量"
        min-width="120">
        <template slot-scope="scope">
          {{JSON.parse(scope.row.couponIds).length}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="210">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="1"
            :inactive-value="0"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="presentationDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="newPop(scope.row)"></el-button>
          <el-button type="primary" size="mini" @click="newPop(scope.row, true)">复制</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="pageIndex"
      :page-count="pageCount"
      :page-size="pageSize"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.buyXGetNActivityId?'修改活动':'新建活动'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        label-width="80px"
        size="mini"
        ref="form">
        <el-form-item
          label="活动名称"
          prop="activityName"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 15, message: '最多15字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.activityName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          prop="startTime"
          label="开始时间"
          :rules="{required: true, message: '必填', trigger: ['blur', 'change']}">
          <el-date-picker
            v-model="form.startTime"
            type="date"
            style="width:135px"
            value-format="yyyy-MM-dd 00:00:00"
            placeholder="选择日期"
            :disabled="form.activityStatus!==0&&form.buyXGetNActivityId"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.endTime).getTime() !== 0 && time.getTime() > new Date(form.endTime).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          prop="endTime"
          label="结束时间"
          :rules="{required: true, message: '必填', trigger: ['blur', 'change']}">
          <el-date-picker
            ref="endTime"
            v-model="form.endTime"
            type="date"
            style="width:135px"
            value-format="yyyy-MM-dd 23:59:59"
            placeholder="选择日期"
            :disabled="form.activityStatus===2&&form.buyXGetNActivityId"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.startTime).getTime() !== 0 && time.getTime() < new Date(form.startTime).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="购买规则"
          prop="buyStatsRuleTypeId"
          :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-select
            v-model="form.buyStatsRuleTypeId"
            placeholder="请选择"
            :disabled="form.buyXGetNActivityId">
            <el-option :label="value" :value="key" :key="key" v-for="(value, key) in rulesList"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="购买篇数"
          prop="buyCount"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{1,3}$/, message: '0-999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.buyCount" :disabled="form.buyXGetNActivityId" autocomplete="off" style="width:120px;"></el-input> 篇
        </el-form-item>
        <el-form-item
          label="方案类型"
          prop="buyTypeIdSet"
          :rules="{required: true, type: 'array', message: '必填', trigger: ['blur', 'change']}">
          <el-select v-model="form.buyTypeIdSet" multiple :disabled="form.buyXGetNActivityId" placeholder="请选择">
            <el-option
              v-for="(value, key) in buyTypeList"
              v-show="key!=='1' && key!=='2'"
              :key="key"
              :label="value"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="每日优惠次数上限"
          prop="dailyGetTimes"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d{1,3}$/, message: '0-999', trigger: ['blur', 'change']}]">
          <el-input v-model="form.dailyGetTimes" autocomplete="off" style="width:120px;"></el-input> 次
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form.couponIds"
          label="优惠券ID"
          :key="index"
          :prop="'couponIds.' + index + '.id'"
          :rules="[{required: true, message: '优惠券ID不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '必须为数字', trigger: ['blur', 'change']}]">
          <el-input v-model="item.id" style="width:200px;" @change="getCouponInfo(item)" :suffix-icon="item.loading ? 'el-icon-loading' : ''"></el-input>
          <el-button v-if="form.couponIds.length > 1" @click.prevent="removeCoupon(index)">删除</el-button>
          <p v-if="item.couponName">优惠券名称：{{item.couponName}}</p>
          <p v-if="item.discount">优惠力度：{{item.discount}}</p>
        </el-form-item>
        <el-form-item v-if="form.couponIds && form.couponIds.length < 10">
          <el-button type="primary" @click.prevent="addCoupon(index)">新增优惠券</el-button>
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
import { ActivityPresentation } from '../../../util/api'
import { formatDate } from '../../../util/tool'
import { queryCouponById } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'activityPresentation',
  data () {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      list: [],
      tableHeight: null,
      rulesList: {
        1: '每日消费统计',
        2: '活动期间消费累计'
      },
      buyTypeList: {
        1: '竞彩',
        2: '北单',
        3: '任九',
        4: '胜负彩',
        5: '竞足',
        6: '竞篮',
        7: '北单足',
        8: '北单篮'
      },
      dialogFormVisible: false,
      form: {},
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
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(ActivityPresentation.list, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getInfoById (id) {
      if (!id) return Promise.resolve()
      return this.$service(ActivityPresentation.infoById, {
        urlParams: {
          buyXGetNActivityId: id
        }
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        if (err) {
          return Promise.reject(err)
        }
      })
    },
    newPop (data, flag) {
      let id = data ? data.buyXGetNActivityId : null
      this.getInfoById(id).then(res => {
        let _data = {}
        if (res) {
          _data = {...res}
          _data.startTime = formatDate(_data.startTime, 'yyyy-MM-dd hh:mm:ss')
          _data.endTime = formatDate(_data.endTime, 'yyyy-MM-dd hh:mm:ss')
          let _arr = []
          JSON.parse(_data.couponIds).forEach(item => {
            _arr.push({id: item, name: '', discount: '', loading: false})
          })
          _data.couponIds = _arr
          _data.buyStatsRuleTypeId = _data.buyStatsRuleTypeId + ''
          _data['buyTypeIdSet'] = []
          _data.buyTypeIds.forEach(item => {
            _data['buyTypeIdSet'].push(item + '')
          })
          if (flag) {
            delete _data.buyXGetNActivityId
          } else {
            let activityStatus = 0 // 未开始
            let _now = new Date().getTime()
            if (_now > res.startTime && _now < res.endTime) {
              activityStatus = 1 // 进行中
            }
            if (_now > res.endTime) {
              activityStatus = 2 // 已结束
            }
            _data['activityStatus'] = activityStatus
          }
        }
        this.form = Object.assign({
          activityName: '',
          startTime: '',
          endTime: '',
          buyStatsRuleTypeId: '',
          buyTypeIdSet: [],
          couponIds: [{id: '', name: '', discount: '', loading: false}],
          dailyGetTimes: '',
          buyCount: ''
        }, _data)
        this.form.couponIds.forEach(item => {
          if (!item.id) return
          queryCouponById(item.id).then(res => {
            item.couponName = res.couponName
            item.discount = res.discount
          })
        })
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }, () => {
        this.$message.error('获取活动详情失败，请稍后再试')
      })
    },
    addCoupon () {
      this.form.couponIds.push({id: '', name: '', discount: '', loading: false})
    },
    removeCoupon (i) {
      this.form.couponIds.splice(i, 1)
    },
    getCouponInfo (data) {
      if (data.loading || !/^\d+$/.test(data.id)) return
      data.couponName = ''
      data.discount = ''
      this.$set(data, 'loading', true)
      queryCouponById(data.id).then(res => {
        data.loading = false
        data.couponName = res.couponName
        data.discount = res.discount
      }, err => {
        if (err) {
          data.loading = false
          this.$message.error(err)
        }
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {...this.form}
          let _arr = []
          this.form.couponIds.forEach(item => {
            _arr.push(item.id)
          })
          _data.couponIds = _arr.join(',')
          _data.buyTypeIdSet = _data.buyTypeIdSet.join(',')
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(_data.buyXGetNActivityId ? ActivityPresentation.update : ActivityPresentation.add, {
            method: 'post',
            urlParams: _data.buyXGetNActivityId ? {buyXGetNActivityId: _data.buyXGetNActivityId} : null,
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getList(_data.buyXGetNActivityId ? this.pageIndex : 1, !!_data.buyXGetNActivityId)
              this.$message.success(_data.buyXGetNActivityId ? '修改成功' : '添加成功')
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
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      this.$service(ActivityPresentation.status, {
        method: 'post',
        urlParams: {
          buyXGetNActivityId: data.buyXGetNActivityId
        },
        data: {
          status: data.status
        }
      }).then(res => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'status', data.status ? 0 : 1)
          this.$message.error(res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    presentationDel (data) {
      this.$set(data, 'loading', true)
      this.$service(ActivityPresentation.del, {
        method: 'post',
        urlParams: {
          buyXGetNActivityId: data.buyXGetNActivityId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(this.pageIndex, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
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
