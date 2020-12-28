<template>
  <div class="menu-wrap">
    <el-submenu :index="navIndex" v-if="routerData.children">
      <template slot="title">
        {{routerData.meta.title}}
        <refresh-icon v-if="routerData.name === 'Current'" />
      </template>
      <MenuNavItem v-for=" (item, index) in routerData.children" :key="index"
        v-show="item.meta.navShow&&routerData.children" :routerData="item" :navIndex="navIndex + '-' + (index + 1)"
        :basePath='resolvePath(routerData.path)' />
    </el-submenu>
    <router-link :to="resolvePath(routerData.path)" v-else>
      <el-menu-item :index="resolvePath(routerData.path)">
        <span slot="title">
          {{routerData.meta.title}}
          <refresh-icon v-if="routerData.name === 'Current'" />
        </span>
      </el-menu-item>
    </router-link>
  </div>
</template>

<script>
// import { arraySome } from '../util/tool.js'
import path from 'path'
export default {
  name: 'MenuNavItem',
  props: ['routerData', 'navIndex', 'basePath'],
  components: {
    refreshIcon: {
      data () {
        return {
          animateShow: false
        }
      },
      methods: {
        animateClick () {
          this.animateShow = true
          this.$store.dispatch('getSessionList')
          setTimeout(() => {
            this.animateShow = false
          }, 1500)
        }
      },
      render () {
        const styleObj = { color: 'rgb(98,176,116)', fontWeight: 'bold', marginLeft: '20px' }
        if (this.animateShow) {
          styleObj.animation = 'circleRotate 1s infinite linear'
        }
        return (
          <i
            class={`el-icon-refresh ${this.animateShow ? 'animate' : ''}`}
            onClick={this.animateClick}
            style={styleObj}>
          </i>
        )
      }
    }
  },
  methods: {
    /**
     * @description 获取完整路由完整链接, 基于basePath拼接，用于高亮导航显示
     * @param {String} routerPath 路由路径
     * @return {String} 完整路径
     */
    resolvePath (routerPath) {
      return path.resolve(this.basePath, routerPath)
    }
    // /**
    //  * @description 判断权限
    //  * @param {Array} userRoles 路由路径
    //  * @param {Array} routerRoles 路由路径
    //  * @return {Boolean}
    //  */
    // checkAuth (userRoles, routerRoles) {
    //   return arraySome(userRoles, routerRoles)
    // }
  }
}
</script>
