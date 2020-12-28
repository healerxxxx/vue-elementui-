import Vue from 'vue'
import Vuex from 'vuex'
import service from '../util/service'
import { loginApi } from '../util/api'
Vue.use(Vuex)

const state = {
  userInfo: null,
  windowHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  windowWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
  menuOpen: false
}

const mutations = {
  setUserInfo (state, userInfo) {
    state.userInfo = userInfo
  }
}

const actions = {
  getUserInfo ({commit}) {
    return new Promise((resolve, reject) => {
      service(loginApi.login, {
        headers: process.env.NODE_ENV === 'development' ? null : {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }).then(res => {
        if (res.code === 40110) {
          service(loginApi.userInfo).then(res => {
            if (res.code === 200) {
              commit('setUserInfo', res.data)
              resolve(res)
            } else {
              reject(res)
            }
          }, err => {
            reject(err)
          })
        } else {
          reject(res)
        }
      }, err => {
        reject(err)
      })
    })
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
