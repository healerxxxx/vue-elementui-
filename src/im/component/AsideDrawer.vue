<template>
  <div class="aside-drawer" v-if="$store.state.userInfo" :class="{'open': $store.state.menuOpen}">
    <div class="mask" @click="$store.state.menuOpen=false"></div>
    <el-aside width="180px" class="aside-fixed">
      <el-scrollbar wrap-class="scrollbar-wrapper" style="position:absolute;top:0;bottom:0;width:100%;">
        <MenuNav />
      </el-scrollbar>
    </el-aside>
  </div>
</template>

<script>
import MenuNav from './MenuNav'
export default {
  name: 'AsideDrawer',
  components: {
    MenuNav
  }
}
</script>

<style lang="scss" scoped>
  .aside-drawer {
    position: fixed;
    left: 0;
    top: 48px;
    bottom: 0;
    width: 0;
    z-index: 9999;
    -webkit-transition: width .0s cubic-bezier(.9, 0, .3, .7);
    transition: width .0s cubic-bezier(.9, 0, .3, .7);
    .mask {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 0;
      background-color: rgba(0,0,0,.75);
      opacity: 0;
      -webkit-transition: all .3s cubic-bezier(.9, 0, .3, .7);
      transition: all .3s cubic-bezier(.9, 0, .3, .7);
    }
    .aside-fixed {
      width: 180px;
      position: absolute;
      top: 0;
      left: -180px;
      bottom: 0;
      z-index: 10;
      height: auto!important;
      -webkit-box-shadow: none;
      box-shadow: none;
      -webkit-transition: left .3s cubic-bezier(.9, 0, .3, .7), box-shadow .3s cubic-bezier(.9, 0, .3, .7);
      transition: left .3s cubic-bezier(.9, 0, .3, .7), box-shadow .3s cubic-bezier(.9, 0, .3, .7);
    }
    &.open {
      width: 100%;
      .mask {
        opacity: .2;
      }
      .aside-fixed {
        left: 0;
        -webkit-box-shadow: 2px 0 8px rgba(0,0,0,0.15);
        box-shadow: 2px 0 8px rgba(0,0,0,0.15);
      }
    }
  }
</style>
