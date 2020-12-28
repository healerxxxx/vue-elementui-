<template>
  <div id="app">
    <el-container style="min-height: 100vh;">
      <el-header style="background-color:#e62121;position:fixed;left:0;top:0;right:0;z-index:999;" height="48px">
        <Header></Header>
      </el-header>
      <AsideFixed v-if="$store.state.windowWidth >= 1280" />
      <AsideDrawer v-else />
      <el-main :style="{'margin': '48px 0 0 ' + ($store.state.windowWidth >= 1280 ? 180 : 0) + 'px', 'min-width': '768px'}">
        <keep-alive :include="[...keepAliveRoutes]">
          <router-view />
        </keep-alive>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Header from './component/Header'
import AsideFixed from './component/AsideFixed'
import AsideDrawer from './component/AsideDrawer'
import { getAliveRoute } from './util/tool'
import { mapState } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapState(['userInfo']),
    keepAliveRoutes () {
      return getAliveRoute()
    }
  },
  created () {
    window.onresize = () => {
      this.$store.state.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.$store.state.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    }
  },
  components: {
    Header,
    AsideFixed,
    AsideDrawer
  },
  watch: {
    userInfo (val) {
      if (val) {
        window.WaterMark.mark({text: val.loginName})
      }
    },
    $route () {
      if (this.$store.state.menuOpen) {
        this.$store.state.menuOpen = false
        window.scrollTo(0, 0)
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
@import "./assets/styles/reset.css";
@import "./assets/styles/commen.scss";
.aside-fixed {
  position: relative;
  height: 800px;
  box-shadow: 1px 0 0 #e6e6e6;
}
</style>
