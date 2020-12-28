<template>
  <div class="statistics-recharge">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs v-model="appTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="时间段统计" name="1"></el-tab-pane>
      <el-tab-pane label="各价位统计" name="2"></el-tab-pane>
    </el-tabs>
    <recharge-by-time
      :screenHeight="windowHeight"
      appTab="0"
      :visible="appTab==='0'&&activeTab==='1'"
      v-show="appTab==='0'&&activeTab==='1'">
    </recharge-by-time>
    <recharge-by-time
      :screenHeight="windowHeight"
      appTab="1"
      :visible="appTab==='1'&&activeTab==='1'"
      v-show="appTab==='1'&&activeTab==='1'">
    </recharge-by-time>
    <recharge-by-price
      :screenHeight="windowHeight"
      appTab="0"
      :visible="appTab==='0'&&activeTab==='2'"
      v-show="appTab==='0'&&activeTab==='2'">
    </recharge-by-price>
    <recharge-by-price
      :screenHeight="windowHeight"
      appTab="1"
      :visible="appTab==='1'&&activeTab==='2'"
      v-show="appTab==='1'&&activeTab==='2'">
    </recharge-by-price>
  </div>
</template>

<script>
import RechargeByTime from './Component/RechargeByTime'
import RechargeByPrice from './Component/RechargeByPrice'
import { mapState } from 'vuex'
export default {
  name: 'statisticsRecharge',
  data () {
    return {
      appTab: '0',
      activeTab: '1'
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  components: {
    RechargeByTime,
    RechargeByPrice
  }
}
</script>
