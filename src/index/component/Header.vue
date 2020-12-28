<template>
  <div class="manager-header">
    <div class="logo">
      <span v-if="$store.state.windowWidth >= 1280">网易红彩运营平台</span>
      <span v-else class="menu-icon" :class="{'open': !$store.state.menuOpen, 'close': $store.state.menuOpen}"
        @click="$store.state.menuOpen=!$store.state.menuOpen"></span>
    </div>
    <div class="user-info" v-if="$store.state.userInfo">
      <el-button class="myLink" type="danger" size="mini"><a href="/im.html" target="_blank">专属客服</a></el-button>
      <!-- <a class="oldLink" href="/old.html">旧版>></a> -->
      <span>你好，{{$store.state.userInfo.userName}}</span>
      <el-button type="danger" size="mini" @click="userLogout()">退出</el-button>
    </div>
  </div>
</template>

<script>
import { loginApi } from '../util/api'
import service from '../util/service'
export default {
  name: 'Header',
  methods: {
    userLogout () {
      service(loginApi.logout).then(res => {
        if (res.code === 200) {
          window.location.href = window.location.origin + loginApi.login
        } else {
          this.$message.error('接口异常，退出失败！')
        }
      }, err => {
        if (err) {
          this.$message.error('接口异常，退出失败！')
        }
      })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.manager-header {
  height: 100%;
  display: flex;
  align-items: center;
  color: #fff;
  justify-content: space-between;
  font-size: 16px;
  line-height: 1;
  .logo {
    span {
      display: inline-block;
      font-size: 18px;
      font-weight: bold;
    }
    .menu-icon {
      width: 30px;
      height: 30px;
      background-repeat: no-repeat;
      background-size: contain;
      -webkit-transition: all 0.3s;
      transition: all 0.3s;
      cursor: pointer;
      &.open {
        background-image: url("../assets/images/menu-open.svg");
      }
      &.close {
        background-image: url("../assets/images/menu-close.svg");
      }
    }
  }
  .oldLink {
    color: #fff;
    margin-right: 15px;
    &:hover {
      text-decoration: underline;
    }
  }
  .myLink {
    margin-right: 15px;
    a {
      color: #fff;
    }
  }
}
</style>
