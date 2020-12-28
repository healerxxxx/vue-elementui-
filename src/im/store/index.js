import Vue from 'vue'
import Vuex from 'vuex'
import service from '../util/service'
import { login, userInfo } from '../util/api/login'
import { sessionList } from '../util/api/session'
Vue.use(Vuex)

const state = {
  userInfo: null,
  windowHeight:
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight,
  windowWidth:
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth,
  menuOpen: false,
  sessionList: [],
  currentSession: {},
  ws: null,
  wsStatus: null
}

const getters = {}

const mutations = {
  setUserInfo (state, userInfo) {
    state.userInfo = userInfo
  },
  setSessionList (state, list) {
    state.sessionList = list
  },
  setCurrentSession (state, obj) {
    state.currentSession = obj
  },
  setWs (state, val) {
    state.ws = val
  },
  setWsStatus (state, val) {
    state.wsStatus = val
  }
}

const actions = {
  getUserInfo ({ commit }) {
    return new Promise((resolve, reject) => {
      service(login, {
        headers:
          process.env.NODE_ENV === 'development'
            ? null
            : {
              'X-Requested-With': 'XMLHttpRequest'
            }
      }).then(
        res => {
          if (res.code === 40110) {
            service(userInfo).then(
              res => {
                if (res.code === 200) {
                  commit('setUserInfo', res.data)
                  resolve(res)
                } else {
                  reject(res)
                }
              },
              err => {
                reject(err)
              }
            )
          } else {
            reject(res)
          }
        },
        err => {
          reject(err)
        }
      )
    })
  },
  getSessionList ({commit}) {
    return service(sessionList).then(res => {
      if (res.code === 200) {
        commit('setSessionList', res.data)
        return Promise.resolve(res)
      } else {
        return Promise.reject(res.message)
      }
    }, err => {
      return Promise.reject(JSON.stringify(err))
    })
  }
}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
