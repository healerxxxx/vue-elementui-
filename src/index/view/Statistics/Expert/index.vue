<template>
  <div class="statistics-expert">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础统计" name="1"></el-tab-pane>
      <el-tab-pane label="联赛分布" name="2"></el-tab-pane>
      <el-tab-pane label="盈利率榜" name="3"></el-tab-pane>
      <el-tab-pane label="足球人气榜" name="4"></el-tab-pane>
      <el-tab-pane label="篮球人气榜" name="5"></el-tab-pane>
      <el-tab-pane label="预选专家统计" name="6"></el-tab-pane>
    </el-tabs>
    <expert-base-stat category = "1" :screenHeight="windowHeight" :visible="activeTab==='1'" v-show="activeTab==='1'"></expert-base-stat>
    <expert-league :screenHeight="windowHeight" :visible="activeTab==='2'" v-show="activeTab==='2'"></expert-league>
    <expert-earning :screenHeight="windowHeight" :visible="activeTab==='3'" v-show="activeTab==='3'"></expert-earning>
    <expert-popularity categoryId="1" :screenHeight="windowHeight" :visible="activeTab==='4'" v-show="activeTab==='4'"></expert-popularity>
    <expert-popularity categoryId="2" :screenHeight="windowHeight" :visible="activeTab==='5'" v-show="activeTab==='5'"></expert-popularity>
    <expert-base-stat categoryId="2" :screenHeight="windowHeight" :visible="activeTab==='6'" v-show="activeTab==='6'"></expert-base-stat>
  </div>
</template>

<script>
import ExpertBaseStat from './Component/ExpertBaseStat'
import ExpertLeague from './Component/ExpertLeague'
import ExpertEarning from './Component/ExpertEarning'
import ExpertPopularity from './Component/ExpertPopularity'
import { mapState } from 'vuex'
export default {
  name: 'statisticsExpert',
  data () {
    return {
      activeTab: '1'
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  components: {
    ExpertBaseStat,
    ExpertLeague,
    ExpertEarning,
    ExpertPopularity
  }
}
</script>
