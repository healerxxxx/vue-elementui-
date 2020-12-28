// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'

import App from './App'
import router from './router'
import store from './store'
import * as filter from './util/filter' // global filters
import service from './util/service'

import './assets/styles/element-variables.scss'

Vue.config.productionTip = false
Object.keys(filter).forEach(key => {
  Vue.filter(key, filter[key])
})
Vue.use(ElementUI, { size: 'mini' })
Vue.prototype.$service = service

const EventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  $bus: {
    get: function () {
      return EventBus
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
