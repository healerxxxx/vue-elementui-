<template>
  <el-aside width="180px" class="aside-fixed" v-if="$store.state.userInfo">
    <el-scrollbar wrap-class="scrollbar-wrapper" style="position:absolute;top:0;bottom:0;width:100%;">
      <MenuNav />
    </el-scrollbar>
  </el-aside>
</template>

<script>
import MenuNav from './MenuNav'
export default {
  name: 'AsideFixed',
  components: {
    MenuNav
  }
}
</script>

<style lang="scss" scoped>
  .aside-fixed {
    width: 180px;
    position: fixed;
    top: 48px;
    left: 0;
    bottom: 0;
    z-index: 10;
    height: auto!important;
  }
</style>
