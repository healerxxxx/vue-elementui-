<template>
  <div class="statistics-product">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button size="mini" type="primary" @click="eloPop=true" v-if="activeTab==='3'">新建红彩指数数据</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="交叉盘" name="1"></el-tab-pane>
      <el-tab-pane label="五星指数" name="2"></el-tab-pane>
      <el-tab-pane label="红彩指数" name="3"></el-tab-pane>
    </el-tabs>
    <product-sp :screenHeight="windowHeight" :visible="activeTab==='1'" v-show="activeTab==='1'"></product-sp>
    <product-star :screenHeight="windowHeight" :visible="activeTab==='2'" v-show="activeTab==='2'"></product-star>
    <product-elo :pop="eloPop" @closePop="eloPop=false" :screenHeight="windowHeight" :visible="activeTab==='3'" v-show="activeTab==='3'"></product-elo>
  </div>
</template>

<script>
import ProductSp from './Component/ProductSp'
import ProductStar from './Component/ProductStar'
import ProductElo from './Component/ProductElo'
import { mapState } from 'vuex'
export default {
  name: 'statisticsProduct',
  data () {
    return {
      activeTab: '1',
      eloPop: false
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  components: {
    ProductSp,
    ProductStar,
    ProductElo
  }
}
</script>
