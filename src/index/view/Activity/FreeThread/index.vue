<template>
  <div class="activity-free-thread">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="freePop()">新建活动</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="activityId"
        label="期数ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="activityTheme"
        label="星期"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.activityTheme | week2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="nickname"
        label="专家1"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.expertList[0] ? scope.row.expertList[0].nickname : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="专家2"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.expertList[1] ? scope.row.expertList[1].nickname : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="专家3"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.expertList[2] ? scope.row.expertList[2].nickname : '-'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="发布时间"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="adminName"
        label="操作人"
        min-width="120">
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
    <el-dialog title="新建活动" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="渠道名" prop="theme" :rules="{required: true, message: '不为空', trigger: ['blur', 'change']}">
          <el-select v-model="form.theme" placeholder="请选择">
            <el-option label="星期一" value="1"></el-option>
            <el-option label="星期二" value="2"></el-option>
            <el-option label="星期三" value="3"></el-option>
            <el-option label="星期四" value="4"></el-option>
            <el-option label="星期五" value="5"></el-option>
            <el-option label="星期六" value="6"></el-option>
            <el-option label="星期七" value="7"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form.expertList"
          :label="'专家' + index"
          :key="index"
          :prop="'expertList.' + index + '.id'"
          :rules="[{required: true, message: '专家ID不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '必须为数字', trigger: ['blur', 'change']}]">
          <el-input v-model="item.id" @change="getExpertInfo(item)" :suffix-icon="item.loading ? 'el-icon-loading' : ''"></el-input>
          <p v-if="item.nickname">{{item.nickname}}</p>
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
import { ActivityFreeThread } from '../../../util/api'
import { queryExpertDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'activityFreeThread',
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
      updateLoading: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  filters: {
    week2CH (val) {
      let dict = {
        1: '星期一',
        2: '星期二',
        3: '星期三',
        4: '星期四',
        5: '星期五',
        6: '星期六',
        7: '星期日'
      }
      return dict[val] || ''
    }
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
      this.$service(ActivityFreeThread.list, {
        urlParams: {
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
    freePop () {
      this.form = {
        theme: '',
        expertList: [
          {
            id: '',
            flag: false,
            nickname: ''
          },
          {
            id: '',
            flag: false,
            nickname: ''
          },
          {
            id: '',
            flag: false,
            nickname: ''
          }
        ]
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    getExpertInfo (data) {
      if (data.loading || !/^\d+$/.test(data.id)) return
      data.nickname = ''
      data.flag = false
      this.$set(data, 'loading', true)
      queryExpertDetailbyId(data.id).then(res => {
        data.loading = false
        data.flag = !!res.nickname
        data.nickname = res.nickname || '找不到对应的专家'
      }).catch(err => {
        if (err) {
          data.loading = false
          data.flag = false
          data.nickname = '找不到对应的专家'
        }
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {
            theme: this.form.theme
          }
          let _error = null
          let _arr = ['expertA', 'expertB', 'expertC']
          this.form.expertList.forEach((item, index) => {
            if (item.flag) {
              _data[_arr[index]] = item.id
            } else {
              _error = '专家' + index + '非正确的专家ID，请重新填写'
            }
          })
          if (_error) return this.$message.error(_error)
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(ActivityFreeThread.add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
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
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
