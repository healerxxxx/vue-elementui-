<template>
  <div class="statistics-journal">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-form :inline="true" size="mini">
      <el-form-item label="VIP用户统计数" v-if="count[0].vip !== null">
        <span>{{count[0].vip}}</span>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" :loading="count[0].loading" @click="getVipCount(0)">获取VIP用户数</el-button>
      </el-form-item>
      <el-form-item label="VIP免费试用用户统计数" v-if="count[1].vip !== null">
        <span>{{count[1].vip}}</span>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" :loading="count[1].loading" @click="getVipCount(1)">获取VIP免费试用用户数</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { StatisticsVip } from '../../../util/api'
export default {
  name: 'StatisticsVip',
  data () {
    return {
      count: {
        0: {
          vip: null,
          loading: false
        },
        1: {
          vip: null,
          loading: false
        }
      }
    }
  },
  methods: {
    getVipCount (type) {
      if (this.count[type].loading) return
      this.count[type].loading = true
      this.$service(StatisticsVip.vip, {
        params: {
          freeType: type
        }
      }).then(res => {
        if (res.code === 200) {
          this.count[type].vip = res.data.userCount
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        if (err) {
          this.$message.error(JSON.stringify(err))
        }
      }).finally(() => {
        this.count[type].loading = false
      })
    }
  }
}
</script>
