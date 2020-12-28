<template>
  <div class="menu-wrap">
    <el-submenu :index="navIndex"  v-if="routerData.children">
      <template slot="title">{{routerData.meta.title}}</template>
      <MenuNavItem v-for="(item, index) in routerData.children" :key="index" v-if="item.meta.navShow&&routerData.children&&checkAuth(item.meta.roles, $store.state.userInfo.roleList)" :routerData="item" :navIndex="navIndex + '-' + (index + 1)" :basePath='resolvePath(routerData.path)'/>
    </el-submenu>
    <router-link :to="resolvePath(routerData.path)" v-else>
      <el-menu-item :index="resolvePath(routerData.path)">
        <span slot="title">{{routerData.meta.title}}</span>
      </el-menu-item>
    </router-link>
  </div>
</template>

<script>
import { arraySome } from '../util/tool.js'
import path from 'path'
export default {
  name: 'MenuNavItem',
  props: ['routerData', 'navIndex', 'basePath'],
  methods: {
    /**
     * @description 获取完整路由完整链接, 基于basePath拼接，用于高亮导航显示
     * @param {String} routerPath 路由路径
     * @return {String} 完整路径
     */
    resolvePath (routerPath) {
      return path.resolve(this.basePath, routerPath)
    },
    /**
     * @description 判断权限
     * @param {Array} userRoles 路由路径
     * @param {Array} routerRoles 路由路径
     * @return {Boolean}
     */
    checkAuth (userRoles, routerRoles) {
      return arraySome(userRoles, routerRoles)
    }
  }
}
</script>
