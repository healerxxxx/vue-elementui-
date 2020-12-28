<template>
  <div class="expert-recommend">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="recommendPop()">新建专家</el-button>
      </div>
    </div>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe :max-height="tableHeight<400?400:tableHeight"
      @cell-dblclick="dblclick">
      <el-table-column prop="recommendExpertId" label="ID" width="80">
      </el-table-column>
      <el-table-column prop="realName" label="专家名称" min-width="160">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.userId}}">{{scope.row.realName}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="专家ID" min-width="100">
        <template slot-scope="scope">
          <router-link :to="{name: 'ExpertDetail', params: {id: scope.row.userId}}">{{scope.row.userId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="弹框专家简介" min-width="120">
        <template slot-scope="scope">
          <span v-if="!scope.row.editor">{{scope.row.description}}</span>
          <el-input v-show="scope.row.editor" :disabled="scope.row.loading" type="textarea" :rows="2"
            placeholder="请填写简介" v-model="scope.row.des" @blur="recommendUpdate(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作" width="80">
        <template slot-scope="scope">
          <el-popover placement="left" v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="recommendDel(scope.row)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" icon="el-icon-delete" circle size="mini"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
    <el-dialog title="新增专家" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="专家ID" prop="userId" :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: 'ID必须为数字', trigger: ['blur', 'change']}]">
          <el-input v-model="form.userId" autocomplete="off" @change="queryExpertInfo"
            :suffix-icon="expertLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="form.nickname">
          <span>{{form.nickname}}</span>
        </el-form-item>
        <el-form-item label="弹框简介" prop="description" :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 60, message: '最多60字', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="2" placeholder="请填写简介" v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { HeadExpertRecommend } from '../../../util/api'
import { queryExpertDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'HeadExpertRecommend',
  data () {
    return {
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      updateLoading: false,
      expertLoading: false
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
    getList (page) {
      if (this.loading) return
      this.pageIndex = page || 1
      this.loading = true
      this.$service(HeadExpertRecommend.list, {
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
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    recommendPop () {
      this.form = {}
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    queryExpertInfo () {
      let id = this.form.userId
      if (!/^\d+$/g.test(id) || this.expertLoading) return
      this.form['nickname'] = ''
      this.expertLoading = true
      queryExpertDetailbyId(id).then(res => {
        this.form['nickname'] = '专家昵称为：' + res.nickname
        this.expertLoading = false
      }).catch(err => {
        if (err) {
          this.expertLoading = false
          this.form['nickname'] = err
        }
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(HeadExpertRecommend.add, {
            method: 'post',
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success('新增专家成功')
              this.getList()
            } else {
              this.$message.error(res.message)
            }
          }, err => {
            if (err) {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            }
          })
        }
      })
    },
    recommendDel (data) {
      if (data.loading) return
      this.$set(data, 'loading', true)
      this.$service(HeadExpertRecommend.del, {
        params: {
          recommendExpertId: data.recommendExpertId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(this.pageIndex)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          data.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    dblclick (row, column, cell, event) {
      if (column.property === 'description') {
        this.$set(row, 'editor', true)
        this.$set(row, 'des', row.description)
      }
    },
    recommendUpdate (data) {
      let des = data.des.replace(/\r|\n/g, '')
      if (!des) {
        return this.$message.warning('专家简介不允许为空')
      }
      if (des.length > 60) {
        return this.$message.warning('专家简介最多60字')
      }
      if (data.loading) return
      this.$set(data, 'loading', true)
      this.$service(HeadExpertRecommend.update, {
        method: 'post',
        data: {
          recommendExpertId: data.recommendExpertId,
          description: des
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          this.$message.success('更新简介成功')
          data.description = des
          data.editor = false
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          data.loading = false
          this.$message.error(JSON.stringify(err))
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
