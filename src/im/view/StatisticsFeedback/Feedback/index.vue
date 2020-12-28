<template>
  <div class="customer">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-table size="medium" ref="elTable" :data="list" v-loading="loading" stripe
      :max-height="tableHeight<400?400:tableHeight" @row-dblclick="conversationShow">
      <el-table-column prop="userId" label="客户ID" min-width="80">
      </el-table-column>
      <el-table-column prop="createTime" label="反馈时间" min-width="120">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="adminName" label="专属客服" min-width="80">
      </el-table-column>
      <el-table-column label="反馈内容" min-width="180" prop="content">
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120">
        <template slot-scope="scope">
          <div v-if="!scope.row.isEdit" @click="isEditChange(scope.row)" class="remark-show">
            {{scope.row.remarkTemp}}
          </div>
          <el-input v-model="scope.row.remark" style="width:160px" @blur="scope.row.isEdit = false"
            @change="updataRemark(scope.row)" type="textarea" size="small" v-if="scope.row.isEdit" ref="textarea">
          </el-input>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getFilterList"
      :current-page.sync="Math.floor(offset/limit) + 1" :total="total" :page-size="limit" class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { feedback } from '../../../util/api/statisticsfeedback'
import { mapState } from 'vuex'
export default {
  name: 'feedback',
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 1,
      loading: false,
      tableHeight: null,
      list: []
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getFilterList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getFilterList (page) {
      if (this.loading) return
      this.loading = true
      if (typeof page === 'number') {
        this.offset = page ? (page - 1) * this.limit : 0
      } else {
        this.offset = 0
      }
      const filter = {
        offset: this.offset,
        limit: this.limit
      }
      this.$service(feedback.list, {
        params: filter
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          res.data.data.forEach(item => {
            item.remarkTemp = item.remark
            item.isEdit = false
          })
          this.list = res.data.data || []
          this.total = res.data.total || 1
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
    isEditChange (item) {
      item.remark = item.remarkTemp
      item.isEdit = true
      this.$nextTick(() => {
        this.$refs.textarea.$refs.textarea.focus()
      })
    },
    updataRemark (item) {
      if (item.remark.length > 20) {
        this.$message.error('最长不超过20个字符！')
      } else {
        this.$service(feedback.updataRemark, {
          method: 'post',
          data: {
            coupleBackId: item.coupleBackId,
            remark: item.remark
          }
        }).then(res => {
          this.loading = false
          if (res.code === 200) {
            this.$message.success('更新成功！')
            item.remarkTemp = item.remark
            item.isEdit = false
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.loading = false
            this.$message.error(JSON.stringify(err))
          }
        })
      }
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
<style lang="scss">
.remark-show {
  border: 1px solid #dcdfe6;
  word-break: break-all;
  overflow-wrap: break-word;
  min-height: 36px;
  padding: 5px 15px;
  border-radius: 4px;
  max-width: 160px;
}
</style>
