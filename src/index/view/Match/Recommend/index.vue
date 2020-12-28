<template>
  <div class="match-recommend">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched"
            :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary"
          size="mini"
          @click="openDialog">新增首页赛事推荐</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :height="tableHeight<400?400:tableHeight"
      >
      <el-table-column
        prop="homeTeamName"
        label="赛事对阵"
        min-width="150">
        <template slot-scope="scope">
          {{scope.rowlotteryCategoryId === 1 ? scope.row.homeTeamName + 'VS' + scope.row.awayTeamName : scope.row.awayTeamName + 'VS' + scope.row.homeTeamName}}
        </template>
      </el-table-column>
      <el-table-column
        prop="matchInfoId"
        label="赛事ID"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="recommendTime"
        label="配置时间"
        min-width="120">
        <template slot-scope="scope">
          {{[scope.row.recommendTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="210">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="deleteRecommend(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
    background
    layout="prev, pager, next"
    @current-change="getGlobalList"
    :current-page.sync="pageIndex"
    :page-count="pageCount"
    class="page-bar-reset">
    </el-pagination>
    <el-dialog title="新增首页赛事推荐" :visible.sync="dialogVisible" width="400px" center>
      <el-form :model="form" label-width="100px" ref="form">
        <el-form-item label="推荐赛事ID:" prop="matchInfoId"
        :rules="[{ required: true, message: '赛事ID不能为空', trigger: 'blur'}]">
          <el-input v-model="form.matchInfoId" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submit" :loading="submitOfLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { MatchRecommendIndex } from '../../../util/api'
export default {
  name: 'MatchRecommend',
  data () {
    return {
      tableHeight: 0,
      dialogVisible: false,
      submitOfLoading: false,
      submitText: {
        0: '提交',
        1: '提交中'
      },
      submitStatus: 0,
      form: {
        matchInfoId: ''
      },
      list: [],
      pageIndex: 1,
      pageCount: 1,
      limit: 20,
      loading: false
    }
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.$store.state.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    openDialog () {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.$refs['form'].clearValidate()
      })
    },
    submit () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.add()
          this.submitStatus = 1
          this.submitOfLoading = true
        } else {
          return false
        }
      })
    },
    add () {
      this.operate(MatchRecommendIndex.add, this.form)
    },
    deleteRecommend (data) {
      this.operate(MatchRecommendIndex.delete, {matchInfoId: data.matchInfoId})
    },
    operate (url, data) {
      this.$service(url, {
        method: 'post',
        data: data
      }).then(res => {
        this.submitOfLoading = false
        this.dialogVisible = false
        if (res.code === 200) {
          this.$message.success('提交成功')
          this.getList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(MatchRecommendIndex.list, {
        params: {
          offset: (this.pageIndex - 1) * this.limit,
          limit: this.limit
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.pageCount = Math.ceil(res.data.total / this.limit)
          // !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
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
