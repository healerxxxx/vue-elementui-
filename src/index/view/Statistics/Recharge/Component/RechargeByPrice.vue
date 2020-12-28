<template>
  <div class="recharge-price-wrap">
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane :label="item.name" :name="item.id" :key="index" v-for="(item, index) in platformList[appTab]" :disabled="loading"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="price"
        label="价格"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="rechargeCount"
        label="充值次数"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="userCount"
        label="充值用户数"
        min-width="80">
      </el-table-column>
      <el-table-column
        label="充值次数占比"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.rechargeScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        label="充值用户占比"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.userScale | toPercent}}
        </template>
      </el-table-column>
      <el-table-column
        prop="totalRecharge"
        label="充值总额"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="averageRecharge"
        label="人均充值额"
        min-width="100">
        <template slot-scope="scope">
          {{Math.round(scope.row.averageRecharge * 100) / 100}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(start/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { StatisticsRecharge } from '../../../../util/api'
export default {
  name: 'statisticsRechargeByTime',
  props: {
    appTab: {
      type: 'String',
      default: '0'
    },
    visible: {
      type: 'Boolean',
      default: false
    },
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      activeTab: null,
      platformList: {
        0: [
          {
            id: 2,
            name: 'iOS'
          },
          {
            id: 1,
            name: 'Android'
          },
          {
            id: 3,
            name: 'PC'
          },
          {
            id: 4,
            name: 'WAP'
          },
          {
            id: 5,
            name: 'PRVIP'
          },
          {
            id: 9,
            name: 'iOSWAP'
          }
        ],
        1: [
          {
            id: 2,
            name: 'iOS'
          },
          {
            id: 1,
            name: 'Android'
          },
          {
            id: 3,
            name: 'PC'
          }
        ]
      },
      start: 0,
      limit: 25,
      total: 1,
      list: [],
      loading: false,
      tableHeight: null
    }
  },
  created () {
    this.activeTab = this.platformList[this.appTab][0].id
    if (this.visible) {
      this.getList()
      this.setHeight()
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    handleClickTabs () {
      this.getList()
      this.setHeight()
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.start = page ? (page - 1) * this.limit : 0
      let _data = {
        start: this.start,
        limit: this.limit
      }
      this.$service(StatisticsRecharge[this.appTab].listByPlatform, {
        urlParams: {
          platform: this.activeTab
        },
        params: _data
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
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.setHeight()
      }
    },
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>
