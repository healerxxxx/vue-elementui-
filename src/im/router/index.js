import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import { login } from '../util/api/login'
import { Loading } from 'element-ui'
// import { arraySome } from '../util/tool'
/**
 * 组件import命名规则，其实是为了避免命名纠结
 * 大驼峰规则，根据文件夹深度进行串联命名
 */
import View from '../view' // 控制子路由跳转
import Error from '../view/Error'
import Forbidden from '../view/Forbidden'
import Current from '../view/Current'
import Message from '../view/Message'
import History from '../view/History'
import MyCustomer from '../view/MyCustomer'
import SettingsPersonal from '../view/Settings/Personal'
import SettingsQuickReply from '../view/Settings/QuickReply'
import Statistics from '../view/StatisticsFeedback/Statistics'
import Feedback from '../view/StatisticsFeedback/Feedback'

Vue.use(Router)
/**
 * @description 公共路由表，整个权限管理以及导航均在这里设置
 * @param {String} path 路径
 * @param {String} name 组件名称
 * @param {Function} component 组件
 * @param {Object} meta 辅助信息
 * @param {Array} children 子路由
 * @param {String} title 用于导航名字
 * @param {Boolean} navShow 是否在导航中显示
 * @param {Array} roles 权限数组
 */
export const routerMap = [
  {
    path: '*',
    name: 'Error',
    component: Error,
    meta: {
      title: '404',
      navShow: false
    }
  },
  {
    path: '/401',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      title: '401',
      navShow: false
    }
  },
  {
    path: '/',
    name: 'home',
    redirect: '/current',
    meta: {
      title: '首页',
      navShow: false
    }
  },
  {
    path: '/current',
    name: 'Current',
    component: Current,
    meta: {
      title: '当前会话',
      navShow: true
    }
  },
  {
    path: '/message',
    name: 'Message',
    component: Message,
    meta: {
      title: '留言记录',
      navShow: true
    }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: {
      title: '历史会话',
      navShow: true
    }
  },
  {
    path: '/mycustomer',
    name: 'MyCustomer',
    component: MyCustomer,
    meta: {
      title: '我的客户',
      navShow: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: View,
    redirect: '/settings/personal',
    meta: {
      title: '客服设置',
      navShow: true
    },
    children: [
      {
        path: 'personal',
        name: 'SettingsPersonal',
        component: SettingsPersonal,
        meta: {
          title: '个人设置',
          navShow: true
        }
      },
      {
        path: 'quickreply',
        name: 'SettingsQuickReply',
        component: SettingsQuickReply,
        meta: {
          title: '快捷回复',
          navShow: true
        }
      }
    ]
  },
  {
    path: '/statisticsfeedback',
    name: 'StatisticsFeedback',
    component: View,
    redirect: '/staticsfeedback/statistics',
    meta: {
      title: '统计与反馈',
      navShow: true
    },
    children: [
      {
        path: 'statistics',
        name: 'Statistics',
        component: Statistics,
        meta: {
          title: '会话统计',
          navShow: true
        }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: Feedback,
        meta: {
          title: '用户反馈',
          navShow: true
        }
      }
    ]
  }
]

const router = new Router({
  routes: routerMap
})

router.beforeEach((to, from, next) => {
  if (store.state.userInfo) {
    // if (!to.meta.roles) {
    next()
    // } else {
    //   if (arraySome(to.meta.roles, store.state.userInfo.roleList)) {
    //     next()
    //   } else {
    //     next({
    //       path: '/401'
    //     })
    //   }
    // }
  } else {
    const userInfoLoading = Loading.service() // 整个页面的Loading
    store.dispatch('getUserInfo').then(
      () => {
        // if (arraySome(to.meta.roles, store.state.userInfo.roleList)) {
        next()
        // } else {
        //   next({
        //     path: '/401'
        //   })
        // }
        userInfoLoading.close()
      },
      () => {
        userInfoLoading.close()
        window.location.href = window.location.origin + login
      }
    )
  }
})

// 导出实例化
export default router
