<template>
  <div class="app-switch">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="switchPop()">添加开关</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :row-class-name="setClassName"
      :data="list"
      v-loading="loading"
      stripe
      :row-key="getRowKeys"
      :expand-row-keys="expands"
      @expand-change="countExpand"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        type="expand">
        <template slot-scope="props">
          <el-table
            :show-header="false"
            stripe
            :data="props.row.versionSwitchControlValue">
            <el-table-column
              prop="version"
              label="版本号"
              width="90">
            </el-table-column>
            <el-table-column
              prop="menuType"
              label="开关名"
              min-width="150">
              <template slot-scope="scope">
                {{menuName[scope.row.menuType] || scope.row.menuType}}
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="60">
              <template slot-scope="scope">
                {{scope.row.status ? '关' : '开'}}
              </template>
            </el-table-column>
            <el-table-column
              prop="operator"
              label="操作者"
              min-width="80">
              <template slot-scope="scope">
                {{/@/gi.test(scope.row.operator) ? scope.row.operator.split('@')[0] : scope.row.operator}}
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="160">
              <template slot-scope="scope">
                {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column
              prop="loginTime"
              label="更新时间"
              width="160">
              <template slot-scope="scope">
                {{[scope.row.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column
              prop="channel"
              label="渠道控制"
              width="80">
              <template slot-scope="scope">
                <channel-switch :info="scope.row" :api="switchApi" />
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label="操作"
              width="140">
              <template slot-scope="scope">
                <el-switch
                  v-if="scope.row.menuType !== 16"
                  v-model="scope.row.status"
                  :disabled="scope.row.statusLoading"
                  :active-value="0"
                  :inactive-value="1"
                  @click.native="switchStatus(scope.row)">
                </el-switch>
                <el-button type="primary" icon="el-icon-edit" circle size="small" @click="switchPop(scope.row)"></el-button>
                <el-popover
                  placement="left"
                  v-model="scope.row.delPop">
                  <p>确定删除？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
                    <el-button type="primary" size="mini" :loading="scope.row.loading" @click="switchDel(scope.row)">确定</el-button>
                  </div>
                  <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        prop="versionKey"
        label="版本号"
        width="90">
        <template slot-scope="scope">
          {{scope.row.versionKey+(scope.row.versionKey!==scope.row.version?'('+ scope.row.version +')':'')}}
        </template>
      </el-table-column>
      <el-table-column
        prop="menuType"
        label="开关名"
        min-width="150">
        <template slot-scope="scope">
          {{menuName[scope.row.menuType] || scope.row.menuType}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="60">
        <template slot-scope="scope">
          {{scope.row.status ? '关' : '开'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="operator"
        label="操作者"
        min-width="80">
        <template slot-scope="scope">
          {{/@/gi.test(scope.row.operator) ? scope.row.operator.split('@')[0] : scope.row.operator}}
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="loginTime"
        label="更新时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop="channel"
        label="渠道控制"
        width="80">
        <template slot-scope="scope">
          <channel-switch :info="scope.row" :api="switchApi" />
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="140">
        <template slot-scope="scope">
          <el-switch
            v-if="scope.row.menuType !== 16"
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value= "0"
            :inactive-value= "1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="switchPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @change="switchDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getSwtichList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.switchControlId?'修改开关':'添加开关'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="90px" ref="switchForm">
        <el-form-item label="版本号" prop="version" :rules="[{required: true, message: '版本号必填', trigger: 'blur'}]">
          <el-input v-model="form.version" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuTypeList" :rules="[{required: !form.switchControlId, message: '请选择菜单类型', trigger: 'blur'}]" v-show="!form.switchControlId">
          <el-select v-model="form.menuTypeList" multiple placeholder="请选择">
            <el-option
              v-for="(value, key) in menuName"
              :key="key"
              :label="value"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType" v-show="form.switchControlId" :rules="[{required: form.switchControlId, message: '请选择菜单类型', trigger: 'blur'}]">
          <el-select v-model="form.menuType" placeholder="请选择">
            <el-option
              v-for="(value, key) in menuName"
              :key="key"
              :label="value"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开关控制">
          <el-radio v-model="form.status" label="0">开</el-radio>
          <el-radio v-model="form.status" label="1">关</el-radio>
        </el-form-item>
        <el-form-item label="操作人" v-if="form.switchControlId">
          <el-input v-model="form.operator" disabled="true" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('switchForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AppSwitch } from '../../../util/api'
import { mapState } from 'vuex'
import ChannelSwitch from './components/channel-switch'
export default {
  name: 'Swtich',
  data () {
    return {
      activeTab: '0',
      menuName: null,
      list: [],
      expands: [],
      pageIndex: 1,
      pageSize: 20,
      pageCount: 1,
      loading: false,
      tableHeight: null,
      dialogFormVisible: false,
      form: {
        version: '',
        menuTypeList: [],
        menuType: '',
        status: '0'
      }
    }
  },
  computed: {
    ...mapState(['windowHeight']),
    switchApi () {
      return AppSwitch[this.activeTab]
    }
  },
  components: {
    ChannelSwitch
  },
  mounted () {
    this.getSwitchTypeList().then(() => {
      this.getSwtichList()
    }, () => {
      this.getSwtichList()
    })
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    setClassName ({row, index}) {
      return row.versionSwitchControlValue && row.versionSwitchControlValue.length > 1 ? '' : 'expend-hidden'
    },
    countExpand (row, column) {
      this.expands = []
      column.length > 0 && column.forEach(item => {
        this.expands.push(item.versionKey)
      })
    },
    getRowKeys (row) {
      return row.versionKey
    },
    /**
     * @description: el-tabs切换，具体类型根据model来控制，请求的API，则根据API的model的key决定
     */
    handleClickTabs () {
      this.pageIndex = 1
      this.pageCount = 1
      this.list = []
      this.menuName = null
      this.getSwitchTypeList().then(() => {
        this.getSwtichList()
      }, () => {
        this.getSwtichList()
      })
    },
    getSwitchTypeList () {
      return this.$service(this.switchApi.menuList).then(res => {
        if (res.code === 200) {
          this.menuName = res.data
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      }, err => {
        return Promise.reject(err)
      })
    },
    /**
     * @description: 获取列表
     * @param {Number} page 翻页的页码
     */
    getSwtichList (page, noScroll) {
      if (this.loading) return
      this.pageIndex = page || this.pageIndex
      this.loading = true
      this.$service(this.switchApi.switchList, {
        urlParams: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          let _this = this
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
          this.list = res.data.records || []
          this.list.forEach(item => {
            let _delData = item.versionSwitchControlValue.splice(0, 1)
            Object.keys(_delData[0]).forEach(_item => {
              _this.$set(item, _item, _delData[0][_item]) // 这里让item的属性拥有getter、setter方法
            })
          })
          this.pageCount = res.data.page ? res.data.page.pageCount : 1
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
    /**
     * @description: 更新状态的switch开关
     * @param {Object} data 数据对象，如果更新失败，则还原为原来的状态
     */
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        switchControlId: data.switchControlId,
        status: data.status
      }
      this.switchUpdate(_data).then(() => {
        data.statusLoading = false
        this.$message.success('状态更新成功')
      }, (err) => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(err.code ? err.code + ':' + err.message : JSON.stringify(err))
      })
    },
    /**
     * @description: 新建或修改开关
     * @param {Object} data 可为空
     */
    switchPop (data) {
      if (!this.menuName) {
        this.getSwitchTypeList().then(() => {
          this.asyncPop(data)
        }, () => {
          this.$message.error('获取开关列表失败，请稍后再试')
        })
      } else {
        this.asyncPop(data)
      }
    },
    asyncPop (data) {
      if (data) {
        this.form = Object.assign({}, data)
        this.form.menuType = this.form.menuType + ''
        this.form['menuTypeList'] = []
        this.form.status = this.form.status + ''
      } else {
        this.form = Object.assign({}, {version: '', menuTypeList: [], status: '0'})
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.switchForm.clearValidate()
      })
    },
    /**
     * @description: 提交form表单
     * @param {String} form 对应的form的ref
     */
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {
            version: this.form.version,
            status: this.form.status
          }
          if (this.form.switchControlId) {
            _data['switchControlId'] = this.form.switchControlId
            _data['menuType'] = this.form.menuType
          } else {
            _data['menuTypeList'] = this.form.menuTypeList.join(',')
          }
          this.switchUpdate(_data).then(() => {
            this.updateLoading = false
            this.dialogFormVisible = false
            this.$message.success((_data.switchControlId ? '修改' : '添加') + '成功')
            if (!_data.switchControlId) {
              this.pageIndex = 1
            }
            this.getSwtichList(this.pageIndex, !!_data.switchControlId)
          }, (err) => {
            this.updateLoading = false
            this.$message.error(err.code ? err.code + ':' + err.message : JSON.stringify(err))
          })
        }
      })
    },
    /**
     * @description: 添加或修改开关请求
     * @param {Object} data form表单数据
     */
    switchUpdate (data) {
      return this.$service(data.switchControlId ? this.switchApi.switchUpdate : this.switchApi.switchAdd, {
        method: 'post',
        data: data
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve()
        } else {
          return Promise.reject(res)
        }
      }, err => {
        return Promise.reject(err)
      })
    },
    /**
     * @description: 删除开关
     * @param {Object} data 行数据
     */
    switchDel (data) {
      this.$set(data, 'loading', true)
      if (data.loading) return
      this.$service(this.switchApi.switchDel, {
        urlParams: {
          switchControlId: data.switchControlId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getSwtichList(this.pageIndex, true)
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
