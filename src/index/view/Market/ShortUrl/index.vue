<template>
  <div class="short-url">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="shortUrlPop()">新建短链</el-button>
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
        prop="appleChannelId"
        label="短链ID"
        width="100">
      </el-table-column>
      <el-table-column
        prop="channelCode"
        label="渠道号"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="appleChannelGroupId"
        label="渠道类型"
        min-width="120">
        <template slot-scope="scope">
          {{type2CH[scope.row.appleChannelGroupId] || scope.row.appleChannelGroupId}}
        </template>
      </el-table-column>
      <el-table-column
        prop="shortUrl"
        label="短链"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="description"
        label="备注"
        min-width="150">
      </el-table-column>
      <el-table-column
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="shortUrlPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="shortUrlDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="form.appleChannelId?'修改短链':'添加短链'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" size="small" ref="shortUrlForm">
        <el-form-item label="渠道号" prop="channelCode">
          <el-input v-model="form.channelCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="appleChannelGroupId">
          <el-select v-model="form.appleChannelGroupId" placeholder="请选择">
            <el-option
              v-for="item in typeList"
              :key="item.appleChannelGroupId"
              :label="item.channelGroupName"
              :value="item.appleChannelGroupId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input
            type="textarea"
            :rows="2"
            maxlength="30"
            placeholder="备注可为空"
            v-model="form.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('shortUrlForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MarketShortUrl } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'ShortUrl',
  data () {
    return {
      activeTab: 0,
      loading: false,
      list: [],
      tableHeight: null,
      type2CH: {},
      typeList: [],
      dialogFormVisible: false,
      form: {
        channelCode: '',
        appleChannelGroupId: '',
        description: ''
      },
      formRules: {
        channelCode: [
          {required: true, message: '请输入渠道号', trigger: ['blur', 'change']},
          {max: 50, message: '长度不多于50个字符', trigger: ['blur', 'change']},
          {pattern: /^[0-9a-zA-Z_-]{1,}$/, message: '仅支持字母、数字及_或-', trigger: ['blur', 'change']}
        ],
        appleChannelGroupId: [
          {required: true, message: '类型必选', trigger: ['blur', 'change']}
        ]
      },
      updateLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getTypeList().then(() => {
      this.getShorUrlList()
    }, () => {
      this.getShorUrlList()
    })
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    handleClickTabs () {
      this.list = []
      this.type2CH = {}
      this.typeList = []
      this.getTypeList().then(() => {
        this.getShorUrlList()
      }, () => {
        this.getShorUrlList()
      })
    },
    getShorUrlList () {
      if (this.loading) return
      this.loading = true
      this.$service(MarketShortUrl[this.activeTab].list).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getTypeList () {
      return this.$service(MarketShortUrl[this.activeTab].typeList).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            this.type2CH[item.appleChannelGroupId] = item.channelGroupName
          })
          this.typeList = res.data
          return Promise.resolve(res)
        } else {
          this.$message.error(res.code + ':' + res.message)
          return Promise.reject(res)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
        return Promise.reject(err)
      })
    },
    shortUrlPop (data) {
      if (this.typeList.length > 0) {
        this.asyncPop(data)
      } else {
        this.getTypeList().then(() => {
          this.asyncPop(data)
        })
      }
    },
    asyncPop (data) {
      this.form = Object.assign({}, data || {channelCode: '', appleChannelGroupId: '', description: ''})
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.shortUrlForm.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(this.form.appleChannelId ? MarketShortUrl[this.activeTab].update : MarketShortUrl[this.activeTab].add, {
            method: 'post',
            urlParams: this.form.appleChannelId ? {appleChannelId: this.form.appleChannelId} : null,
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getShorUrlList()
              this.$message.success((this.form.appleChannelId ? '更新' : '添加') + '成功')
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
    shortUrlDel (data) {
      this.$set(data, 'loading', true)
      this.$service(MarketShortUrl[this.activeTab].del, {
        method: 'post',
        urlParams: {
          appleChannelId: data.appleChannelId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getShorUrlList()
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
