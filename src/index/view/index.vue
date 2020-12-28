<template>
  <keep-alive :include="[...keepAliveRoutes]">
    <router-view />
  </keep-alive>
</template>

<script>
import { getAliveRoute } from '../util/tool'
export default {
  name: 'view', // 用于子路由视图跳转
  computed: {
    keepAliveRoutes () {
      return getAliveRoute()
    }
  }
}
</script>
