<template>
  <div class="channel-promotion">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="channelPop()">新建渠道</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="channelName"
        label="渠道号"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="iosShortChain"
        label="iOS短链"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="androidApkUrl"
        label="安卓地址"
        min-width="170">
      </el-table-column>
      <el-table-column
        prop="weChatUrl"
        label="微信地址"
        min-width="130">
      </el-table-column>
      <el-table-column
        label="推广页面链接"
        width="130">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            width="400"
            trigger="click" v-if="promotionUrl[activeTab].length>0">
            <el-table :data="promotionUrl[activeTab]" :show-header="false" :key="Math.random()">
              <el-table-column width="400" prop="url">
                <template slot-scope="_scope">
                  <a :href="_scope.row.url + '?from=' + scope.row.channelName" target="_blank">{{_scope.row.url + '?from=' + scope.row.channelName}}</a>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" type="text" size="small">查看推广链接</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="80">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="channelPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getChannelList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.channelSpreadConfigId?'修改渠道':'添加渠道'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" size="small" ref="channelForm">
        <el-form-item label="渠道号" prop="channelName">
          <el-input v-model="form.channelName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="iOS短链" prop="iosShortChain">
          <el-input v-model="form.iosShortChain" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="安卓地址" prop="androidApkUrl">
          <el-input v-model="form.androidApkUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="" v-if="apkUrl">
          <span>{{apkUrl}}</span>
        </el-form-item>
        <el-form-item label="微信地址" prop="weChatUrl">
          <el-input v-model="form.weChatUrl" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('channelForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MarketChannelPromotion } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'ChannelPromotion',
  data () {
    return {
      activeTab: 0,
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      promotionUrl: {
        0: [
          {url: 'https://hongcai.163.com/html/downloadapp.html'},
          {url: 'https://hongcai.163.com/html/live_download.html'},
          {url: 'https://hongcai.163.com/html/promotion.html'},
          {url: 'https://hongcai.163.com/html/promotion_lottery.html'},
          {url: 'https://hongcai.163.com/html/promotion_new.html'},
          {url: 'https://hongcai.163.com/html/worldcupquiz.html'}
        ],
        1: []
      },
      dialogFormVisible: false,
      form: {
        channelName: '',
        iosShortChain: '',
        androidApkUrl: '',
        weChatUrl: ''
      },
      formRules: {
        channelName: [
          {validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('请输入渠道号'))
            } else if (!/^[A-Za-z0-9_-]{1,}$/.test(value)) {
              callback(new Error('只支持输入大小字母数字及-_'))
            } else {
              callback(this.checkApkUrl())
            }
          },
          trigger: 'blur'}
        ],
        iosShortChain: [
          {type: 'url', message: '请输入正确的链接', trigger: 'blur'}
        ],
        androidApkUrl: [
          {type: 'url', message: '请输入正确的链接', trigger: 'blur'}
        ],
        weChatUrl: [
          {type: 'url', message: '请输入正确的链接', trigger: 'blur'}
        ]
      },
      apkUrl: null,
      updateLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getChannelList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    handleClickTabs () {
      this.pageIndex = 1
      this.pageCount = 1
      this.list = []
      this.getChannelList()
    },
    getChannelList (pageIndex) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = pageIndex || this.pageIndex
      this.$service(MarketChannelPromotion[this.activeTab].list, {
        urlParams: {
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
        this.$message.error(JSON.stringify(err))
      })
    },
    channelPop (data) {
      this.apkUrl = null
      if (data) {
        this.form = Object.assign({}, data)
      } else {
        this.form = Object.assign({}, {channelName: '', iosShortChain: '', androidApkUrl: '', weChatUrl: ''})
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.channelForm.clearValidate()
      })
    },
    checkApkUrl () {
      this.$service(MarketChannelPromotion[this.activeTab].checkApk, {
        params: {
          channelName: this.form.channelName
        }
      }).then(res => {
        if (res.code === 200 && res.data && typeof res.data === 'string') {
          if (this.form.androidApkUrl) {
            this.apkUrl = '安卓渠道APK链接已更新'
          }
          this.form.androidApkUrl = res.data
        } else {
          this.apkUrl = '找不到对应的安卓渠道APK链接'
        }
      }, err => {
        if (err) this.apkUrl = '找不到对应的安卓渠道APK链接'
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          if (!this.form.iosShortChain && !this.form.androidApkUrl && !this.form.weChatUrl) {
            return this.$message.error('三个地址必填一个')
          }
          this.updateLoading = true
          this.$service(this.form.channelSpreadConfigId ? MarketChannelPromotion[this.activeTab].update : MarketChannelPromotion[this.activeTab].add, {
            method: 'post',
            urlParams: this.form.channelSpreadConfigId ? {channelSpreadConfigId: this.form.channelSpreadConfigId} : null,
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.channelSpreadConfigId ? '修改' : '添加') + '成功。')
              if (!this.form.channelSpreadConfigId) {
                this.pageIndex = 1
              }
              this.getChannelList()
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
