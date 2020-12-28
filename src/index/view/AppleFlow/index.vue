<template>
  <div class="apple-flow">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" v-if="operationAuth" @click="appleFlowPop()">新建掉单</el-button>
      </div>
    </div>
    <el-tabs v-model="appTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="待处理" name="2" :disabled="loading"></el-tab-pane>
      <el-tab-pane label="已完结" name="1" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      key='aTable'
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="appleOrderFlowId"
        label="流程ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="account"
        label="用户账号"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="nickname"
        label="用户昵称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="probablyTradeId"
        label="相关订单"
        width="170">
      </el-table-column>
      <el-table-column
        prop="appleOrderId"
        label="苹果订单"
        width="170">
      </el-table-column>
      <el-table-column
        prop="probablyTime"
        label="预计掉单时间"
        width="300">
      </el-table-column>
      <el-table-column
        label="截图证明"
        width="80">
        <template slot-scope="scope">
          <img style="cursor: pointer;" v-for="(imgItem, index) in scope.row.screenshot.split('||')" :key="index" @click="showImg(imgItem)" :src="imgItem+'?imageView&thumbnail=72y36&quality=85'">
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="提出时间"
        width="150">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="nodeStatusDesc"
        label="当前节点"
        width="80">
        <template slot-scope="scope">
          {{activeTab==='2' ? scope.row.nodeStatusDesc : '完结'}}
        </template>
      </el-table-column>
      <el-table-column
        :width="activeTab==='2'?110:170">
        <template slot="header" slot-scope="scope">
          {{activeTab==='2'?'下一节点':'确认掉单订单'}}
        </template>
        <template slot-scope="scope">
          <span v-if="activeTab==='2'">{{scope.row.nextNodeStatusDesc}}</span>
          <el-popover
            v-if="activeTab==='1'&&scope.row.tradeId"
            placement="left"
            width="680"
            v-model="scope.row.tradePop">
            <el-table :data="scope.row.tradeList" v-loading="scope.row.tradeLoading" size="mini">
              <el-table-column width="90" property="orderId" label="订单ID"></el-table-column>
              <el-table-column width="90" property="tradeId" label="交易ID"></el-table-column>
              <el-table-column width="90" property="createTime" label="创建时间">
                <template slot-scope="scope">
                  {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
                </template>
              </el-table-column>
              <el-table-column width="70" property="tradeStatus" label="支付状态">
                <template slot-scope="scope">
                  {{scope.row.tradeStatus | rechargeOrder2CH}}
                </template>
              </el-table-column>
              <el-table-column width="100" property="account" label="用户账号"></el-table-column>
              <el-table-column width="70" property="tradePrice" label="订单价格"></el-table-column>
              <el-table-column width="70" property="channelName" label="支付通道">
                <template slot-scope="scope">
                  {{[scope.row.payTerminal, appTab] | payTerminal2CH}}
                </template>
              </el-table-column>
              <el-table-column width="100" property="loginName" label="线上确认人">
              </el-table-column>
            </el-table>
            <el-button slot="reference" type="text" size="small" @click.native="tradeNativeClick(scope.row)">{{scope.row.tradeId}}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150">
        <template slot-scope="scope">
          <!-- 审批 弹窗按钮 begin -->
          <el-popover
            v-if="activeTab==='2' && supervisorAuth"
            placement="left"
            :width="scope.row.nodeStatus===0?250:680"
            v-model="scope.row.resolvePop">
            <!-- 主管初步审批 -->
            <p v-if="scope.row.nodeStatus===0">确认审批</p>
            <el-input
              v-if="scope.row.nodeStatus===0"
              type="textarea"
              :rows="3"
              placeholder="添加备注，最多30字"
              maxlength="30"
              v-model="scope.row.resolveContent">
            </el-input>
            <div v-if="scope.row.nodeStatus===0" style="text-align: right; margin-top: 10px;">
              <el-button size="mini" type="text" @click="scope.row.resolvePop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="leaderCheckSubmit(scope.row)">确定</el-button>
            </div>
            <!-- 技术确认 -->
            <div v-if="scope.row.nodeStatus===1">
              <el-input size="mini" style="width:180px" v-model="scope.row.orderId" placeholder="通行证、tradeId或orderId"></el-input>
              <el-button type="primary" size="mini" :loading="scope.row.searchOrderloading" @click="popSearchOrder(scope.row)">搜索</el-button>
            </div>
            <!-- 技术与最终确认通用一个表格 -->
            <el-table v-if="scope.row.nodeStatus!==0" :data="scope.row.tradeList" v-loading="scope.row.tradeLoading" size="mini">
              <el-table-column width="90" property="orderId" label="订单ID"></el-table-column>
              <el-table-column width="90" property="tradeId" label="交易ID"></el-table-column>
              <el-table-column width="90" property="createTime" label="创建时间">
                <template slot-scope="scope">
                  {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
                </template>
              </el-table-column>
              <el-table-column width="70" property="tradeStatus" label="支付状态">
                <template slot-scope="scope">
                  {{scope.row.tradeStatus | rechargeOrder2CH}}
                </template>
              </el-table-column>
              <el-table-column width="100" property="account" label="用户账号"></el-table-column>
              <el-table-column width="70" property="tradePrice" label="订单价格"></el-table-column>
              <el-table-column width="70" property="channelName" label="支付通道">
                <template slot-scope="scope">
                  {{[scope.row.payTerminal, appTab] | payTerminal2CH}}
                </template>
              </el-table-column>
              <el-table-column width="100" label="操作">
                <template slot-scope="_scope">
                  <el-button type="primary" size="mini" :loading="scope.row.loading" @click="devFinalSubmit(scope.row, _scope.row.channelTradeId)">{{scope.row.nodeStatus===1?'确认掉单':'线上确认'}}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" type="primary" icon="el-icon-check" circle size="small" @click.native="resolveNativeClick(scope.row)"></el-button>
          </el-popover>
          <!-- 审批 弹窗按钮 end -->
          <!-- 驳回 弹窗按钮 begin -->
          <el-popover
            v-if="activeTab==='2' && supervisorAuth"
            placement="left"
            width="250"
            v-model="scope.row.rejectedPop">
            <p>不予通过</p>
            <el-input
              type="textarea"
              :rows="3"
              placeholder="添加备注，最多30字"
              maxlength="30"
              v-model="scope.row.rejectedContent">
            </el-input>
            <div style="text-align: right;margin-top:10px;">
              <el-button size="mini" type="text" @click="scope.row.rejectedPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="rejectedSubmit(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-close" circle size="small" @click.native="scope.row.rejectedContent=''"></el-button>
          </el-popover>
          <!-- 驳回 弹窗按钮 end -->
          {{activeTab==='2'?'':'归档'}}
          <el-popover
            placement="left-end"
            width="530"
            trigger="click">
            <el-table :data="logData" v-loading="logLoading" size="mini">
              <el-table-column width="100" property="nodeStatusDesc" label="节点"></el-table-column>
              <el-table-column min-width="60" property="adminAccount" label="操作人"></el-table-column>
              <el-table-column width="100" property="nextNodeStatusDesc" label="下一节点"></el-table-column>
              <el-table-column width="140" property="address" label="操作时间">
                <template slot-scope="scope">
                  {{[scope.row.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
                </template>
              </el-table-column>
              <el-table-column width="50" property="address" label="结果">
                <template slot-scope="scope">
                  {{scope.row.nodeStatus===0?'提交':(!scope.row.status?'批准':'驳回')}}
                </template>
              </el-table-column>
              <el-table-column width="80" property="remark" label="备注"></el-table-column>
            </el-table>
            <el-button
              slot="reference"
              size="mini"
              type="info"
              style="padding:5px"
              @click.native="getLogList(scope.row.appleOrderFlowId)">日志</el-button>
          </el-popover>
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
    <el-dialog
      :visible.sync="imgVisible"
      center
      :width="imgWidth">
      <div class="img-full" v-if="imgFull">
        <img :src="imgFull" style="max-width:100%;display:block;">
      </div>
    </el-dialog>
    <el-dialog title="新建掉单" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="540px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="100px" size="small" ref="flowForm">
        <el-form-item label="用户账号" prop="account" :rules="{required: true, message: '必填', trigger: ['blur', 'change']}">
          <el-input v-model="form.account" maxlength="99" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname" :rules="{required: true, message: '必填', trigger: ['blur', 'change']}">
          <el-input v-model="form.nickname" maxlength="20" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="苹果掉单ID" prop="appleOrderId" :rules="[{required: true, message: '必填', trigger: ['blur', 'change']}]">
          <el-input v-model="form.appleOrderId" maxlength="30" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="红彩掉单ID" prop="probablyTradeId" :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '掉单ID必须为数字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.probablyTradeId" maxlength="30" autocomplete="off" @change="previewOrder" :suffix-icon="previewLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="orderPreview">
          <span>{{orderPreview}}</span>
        </el-form-item>
        <el-form-item label="预计掉单时间" prop="startTime"  :rules="[{validator: timeRule, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return new Date(form.endTime).getTime() !== 0 && time.getTime() > new Date(form.endTime).getTime()
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            v-model="form.endTime"
            ref="endTime"
            type="datetime"
            style="width:185px"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return new Date(form.startTime).getTime() !== 0 && time.getTime() < new Date(form.startTime).getTime()
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="配图" prop="imgUrls" :rules="{type: 'array', required: true, message: '配图至少上传1张', trigger: ['blur', 'change']}">
          <el-upload
            :file-list="form.imgUrls"
            list-type="picture-card"
            accept=".jpeg,.jpg,.png,.gif"
            :on-remove="removeImg"
            :http-request="uploadImg"
            :before-upload="beforeImgUpload">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('flowForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AppleFlow } from '../../util/api'
import { rechargeOrder2CH } from '../../util/filter'
import { arraySome } from '../../util/tool'
import { uploadImg } from '../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'appleFlow',
  data () {
    return {
      appTab: '0',
      activeTab: '2',
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      logLoading: false,
      logData: [],
      imgVisible: false,
      imgFull: '',
      imgWidth: '100px',
      dialogFormVisible: false,
      form: {
        imgUrls: []
      },
      updateLoading: false,
      orderPreview: '',
      previewLoading: false
    }
  },
  computed: {
    operationAuth () {
      return arraySome([35, 36], this.$store.state.userInfo.roleList)
    },
    supervisorAuth () {
      return arraySome([33, 34], this.$store.state.userInfo.roleList)
    },
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
    timeRule (rule, value, callback) {
      if (!value) {
        callback(new Error('预计掉单开始时间不为空'))
      } else {
        let _endTime = this.$refs.endTime.value
        if (!_endTime) {
          callback(new Error('预计掉单结束时间不为空'))
        } else {
          callback()
        }
      }
    },
    handleClickTabs () {
      this.list = []
      this.getList()
      this.setHeight()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(AppleFlow[this.appTab].list, {
        params: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          type: this.activeTab
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
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getLogList (id) {
      this.logData = []
      this.logLoading = true
      this.$service(AppleFlow[this.appTab].log, {
        params: {
          appleOrderFlowId: id
        }
      }).then(res => {
        this.logLoading = false
        if (res.code === 200) {
          this.logData = res.data
        }
      }, err => {
        if (err) this.logLoading = false
      })
    },
    appleFlowPop () {
      this.form = {imgUrls: []}
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.flowForm.clearValidate()
      })
    },
    showImg (img) {
      let _img = new Image()
      _img.src = img
      _img.onload = () => {
        this.imgWidth = _img.width > 1000 ? '1000px' : _img.width + 'px'
        this.imgVisible = true
        this.imgFull = img
      }
    },
    beforeImgUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    uploadImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.form.imgUrls.push({url: res})
      }, err => {
        if (err) this.$message.error('上传图片失败，请稍后再传！')
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _arr = []
          this.form.imgUrls.forEach(item => {
            _arr.push(item.url)
          })
          let _data = {
            'account': this.form.account,
            'nickname': this.form.nickname,
            'appleOrderId': this.form.appleOrderId,
            'probablyTradeId': this.form.probablyTradeId,
            'probablyTime': this.form.startTime + '~' + this.form.endTime,
            'imgUrls[]': _arr.join(',')
          }
          this.updateLoading = true
          this.$service(AppleFlow[this.appTab].add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.activeTab = '2'
              this.getList()
              this.$message.success('添加成功')
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
    removeImg (file, fileList) {
      this.form.imgUrls = fileList
    },
    asyncOrder (id) {
      return this.$service(AppleFlow[this.appTab].searchTradeId, {
        method: 'post',
        data: {
          query: id
        }
      }).then(res => {
        if (res.code === 200 && res.data.length > 0) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        return Promise.reject(err)
      })
    },
    previewOrder () {
      if (!this.form.probablyTradeId || this.previewLoading) return
      this.orderPreview = ''
      this.previewLoading = true
      this.asyncOrder(this.form.probablyTradeId).then(res => {
        this.previewLoading = false
        this.orderPreview = '订单' + rechargeOrder2CH(res[0].tradeStatus)
      }, () => {
        this.previewLoading = false
        this.orderPreview = '订单不存在'
      })
    },
    rejectedSubmit (data) {
      let urls = {
        0: AppleFlow[this.appTab].leaderCheck,
        1: AppleFlow[this.appTab].devCheck,
        2: AppleFlow[this.appTab].finalCheck
      }
      this.$set(data, 'loading', true)
      let _data = {
        appleOrderFlowId: data.appleOrderFlowId,
        status: 1
      }
      if (data.rejectedContent) _data['remark'] = data.rejectedContent.replace(/\r|\n/g, '')
      this.$service(urls[data.nodeStatus], {
        params: _data
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.rejectedPop = false
          this.$message.success('驳回成功')
          this.getList(this.pageIndex)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    resolveNativeClick (data) {
      if (data.nodeStatus === 0) {
        data.resolveContent = ''
      }
      if (data.nodeStatus === 1) {
        this.$set(data, 'orderId', '')
        this.$set(data, 'tradeList', [])
      }
      if (data.nodeStatus === 2) {
        this.$set(data, 'tradeList', [])
        this.$set(data, 'tradeLoading', true)
        this.getFinalOrder(data.tradeId).then(res => {
          this.$set(data, 'tradeLoading', false)
          data.tradeList.push(res)
        }, err => {
          this.$set(data, 'tradeLoading', false)
          this.$message.error(err)
        })
      }
    },
    getFinalOrder (id) {
      return this.$service(AppleFlow[this.appTab].finalTradeId, {
        params: {
          tradeId: id
        }
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        return Promise.reject(JSON.stringify(err))
      })
    },
    leaderCheckSubmit (data) {
      this.$set(data, 'loading', true)
      let _data = {
        appleOrderFlowId: data.appleOrderFlowId,
        status: 0
      }
      if (data.resolveContent) _data['remark'] = data.resolveContent.replace(/\r|\n/g, '')
      this.$service(AppleFlow[this.appTab].leaderCheck, {
        params: _data
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.resolvePop = false
          this.$message.success('审批成功')
          this.getList(this.pageIndex)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    popSearchOrder (data) {
      if (!data.orderId || data.tradeLoading) return
      this.$set(data, 'tradeLoading', true)
      data.tradeList = []
      this.asyncOrder(data.orderId).then(res => {
        this.$set(data, 'tradeLoading', false)
        data.tradeList = res
      }).catch(err => {
        err && this.$set(data, 'tradeLoading', false)
      })
    },
    devFinalSubmit (data, channelTradeId) {
      this.$prompt('', '确认为掉单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '备注，不超过30字'
      }).then(({ value }) => {
        let _data = {
          appleOrderFlowId: data.appleOrderFlowId,
          remark: value,
          status: 0
        }
        if (data.nodeStatus === 1) _data['channelTradeId'] = channelTradeId
        this.$set(data, 'loading', true)
        this.$service(data.nodeStatus === 1 ? AppleFlow[this.appTab].devCheck : AppleFlow[this.appTab].finalCheck, {
          params: _data
        }).then(res => {
          data.loading = false
          if (res.code === 200) {
            data.resolvePop = false
            this.$message.success('确认掉单成功')
            this.getList(this.pageIndex)
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          data.loading = false
          this.$message.error(JSON.stringify(err))
        })
      })
    },
    tradeNativeClick (data) {
      this.$set(data, 'tradeList', [])
      this.$set(data, 'tradeLoading', true)
      this.getFinalOrder(data.tradeId).then(res => {
        this.$set(data, 'tradeLoading', false)
        data.tradeList.push(res)
      }, err => {
        this.$set(data, 'tradeLoading', false)
        this.$message.error(err)
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
