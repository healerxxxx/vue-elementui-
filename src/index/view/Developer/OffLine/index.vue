<template>
  <div class="channel-promotion">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="dialogFormVisible = true,form = {},urlDisable = false">新建</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe
      :max-height="tableHeight<400?400:tableHeight"  >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table  :show-header="false" :data="props.row.historyList" >
            <el-table-column prop=" name" label="名称" min-width="70">
            </el-table-column>
            <el-table-column prop="url" label="页面地址" min-width="130">
            </el-table-column>
            <el-table-column prop="zipUrl" label="zip包地址" min-width="130">
            </el-table-column>
            <el-table-column prop="md5" label="md5" min-width="130">
            </el-table-column>
            <el-table-column label="更新时间" width="130">
              <template slot-scope="scope">
                {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="40">
              <template slot-scope="scope">
                {{scope.row.status === 0 ? '下线' : '上线'}}
              </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" min-width="80">
              <template slot-scope="scope">
                {{scope.row.version}}
              </template>
            </el-table-column>
            <el-table-column prop="" label="操作" width="300">
              <template slot-scope="scope">
                <el-popover placement="left" v-model="scope.row.isShowOn">
                  <p>上线</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="scope.row.isShowOn=false">取消</el-button>
                    <el-button type="primary" size="mini" :loading="scope.row.loading"
                      @click="offlineChange(scope.row,'on')">
                      确定
                    </el-button>
                  </div>
                  <el-button slot="reference" :type="scope.row.isMajor?'':'primary'" size="small">上线</el-button>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="70">
      </el-table-column>
      <el-table-column prop="url" label="页面地址" min-width="130">
      </el-table-column>
      <el-table-column prop="zipUrl" label="zip包地址" min-width="130">
      </el-table-column>
      <el-table-column prop="md5" label="md5" min-width="130">
      </el-table-column>
      <el-table-column label="更新时间" width="130">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="40">
      </el-table-column>
      <el-table-column label="版本" min-width="80">
      </el-table-column>
      <el-table-column prop="" label="操作" width="300">
        <template slot-scope="scope">
          <el-popover placement="left" v-model="scope.row.isShowRollback">
            <p>回滚</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.isShowRollback=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="rollback(scope.row)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" size="small" @click="scope.row.isShowRollback = true ">回滚
            </el-button>
          </el-popover>
          <el-popover placement="left" v-model="scope.row.isShowDelete" v-if="scope.row.zipUrl">
            <p>下线</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.isShowDelete=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading"
                @click="offlineChange(scope.row,'off')">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" size="small">下线</el-button>
          </el-popover>
          <el-button type="primary" size="small" @click="copyData(scope.row)">拷贝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList"
      :current-page.sync="Math.floor(offset/limit) + 1" :total="total" :page-size="limit" class="page-bar-reset">
    </el-pagination>
    <el-dialog title="新增离线配置" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="110px" size="small" ref="form">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="url" prop="url">
          <el-input v-model="form.url" autocomplete="off" :disabled="urlDisable"></el-input>
        </el-form-item>
        <el-form-item label="zipUrl" prop="zipUrl">
          <el-input v-model="form.zipUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="md5" prop="md5">
          <el-input v-model="form.md5" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="mark">
          <el-input v-model="form.mark" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="apiList" prop="apiList">
          <el-input v-model="form.apiList" :autosize="{ minRows: 2, maxRows: 6}" autocomplete="off" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input   v-model="form.version" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item label="codeVersion" prop="codeVersion">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="form.codeVersion" autocomplete="off">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { DeveloperFix } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'offline',
  data () {
    return {
      activeTab: 0,
      loading: false,
      expands: [],
      list: [],
      offset: 0,
      limit: 20,
      total: 1,
      tableHeight: null,
      dialogFormVisible: false,
      urlDisable: false,
      form: {
        name: '',
        url: '',
        zipUrl: '',
        md5: '',
        apiList: '',
        mark: '',
        codeVersion: '',
        version: ''
      },
      formRules: {
        name: [{ required: true, message: '名称必填', trigger: 'blur' }],
        url: [
          { required: true, type: 'url', message: '请输入正确的链接', trigger: 'blur' }
        ],
        zipUrl: [
          { required: true, type: 'url', message: '请输入正确的链接', trigger: 'blur' }
        ],
        md5: [
          { required: true, message: '必填', trigger: 'blur' }
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
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getRowKeys (row) {
      return row.versionKey
    },
    handleClickTabs () {
      this.pageIndex = 1
      this.pageCount = 1
      this.list = []
      this.getList()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      this.$service(DeveloperFix.offlineList, {
        params: {
          appId: this.activeTab,
          offset: this.offset,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.total = res.data.total
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    offlineChange (data, type) {
      data.loading = true
      let url = ''
      type === 'on' ? url = DeveloperFix.offlineOn : url = DeveloperFix.offlineOff
      type === 'on' ? data.isShowOn = false : data.isShowDelete = false
      this.$service(url, {
        method: 'post',
        data: {
          paramId: data.paramId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          let text = ''
          type === 'on' ? text = '上线成功' : text = '下线成功'
          this.$message.success(text)
          this.rollback(data)
          this.getList(Math.floor(this.offset / this.limit) + 1, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    rollback (data) {
      console.log(data)
      this.$service(DeveloperFix.offlineHistory, {
        method: 'post',
        data: {
          url: data.url,
          appId: this.activeTab
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          this.$set(data, 'historyList', res.data)
          data.isShowRollback = false
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    copyData (data) {
      this.form = {
        name: data.name,
        url: data.url,
        zipUrl: data.zipUrl,
        apiList: data.apiList,
        version: data.version
      }
      this.dialogFormVisible = true
      this.urlDisable = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          let _data = []
          _data = this.form
          _data.appId = this.activeTab
          this.$service(DeveloperFix.offlineAdd, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.urlDisable = false
              this.getList()
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
