<template>
  <el-menu :default-active="$route.path">
    <MenuNavItem v-for="(item, index) in routerMap" :key="index" :routerData="item" :navIndex="index+1" :basePath='item.path' v-show="item.meta.navShow" />
  </el-menu>
</template>

<script>
import { arraySome } from '../util/tool.js'
import MenuNavItem from './MenuNavItem'
import { routerMap } from '../router'
export default {
  name: 'menuNav',
  data () {
    return {
      routerMap: routerMap
    }
  },
  components: {
    MenuNavItem
  },
  methods: {
    /**
     * @description 判断权限
     * @param {Array} userRoles 路由角色
     * @param {Array} routerRoles 路由角色
     * @return {Boolean}
     */
    checkAuth (userRoles, routerRoles) {
      return arraySome(userRoles, routerRoles)
    }
  }
}
</script>

<style lang="scss">
.el-menu {
  border: 0
}
</style>
