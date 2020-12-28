<template>
  <div class="manager-header">
    <div class="logo">
      <span v-if="$store.state.windowWidth >= 1280">红彩专属客服后台</span>
      <span v-else class="menu-icon" :class="{'open': !$store.state.menuOpen, 'close': $store.state.menuOpen}"
        @click="$store.state.menuOpen=!$store.state.menuOpen"></span>
    </div>
    <div class="user-info" v-if="userInfo">
      <el-switch v-model="userInfo.needNotice" :active-value="1" :inactive-value="0" active-color="#F56C6C"
        @click.native="changeNotice()">
      </el-switch>
      <span>{{userInfo.needNotice ? '开启手机邮箱通知' : '关闭手机邮箱通知'}}</span>
      <a class="oldLink" href="/index.html" target="_blank">运营后台>></a>
      <span>你好，{{userInfo.adminName}}</span>
      <el-select v-model="userInfo.loginStatus" placeholder="请选择" style="width:110px" size="mini"
        @change="submitStatus">
        <el-option label="今天我在班" :value="1"></el-option>
        <el-option label="下班" :value="0"></el-option>
      </el-select>
      <el-button size="mini" @click="userLogout()">退出</el-button>
    </div>
  </div>
</template>

<script>
import { login, logout } from '../util/api/login'
import { upLogin, needNotice } from '../util/api/common'
import service from '../util/service'
import { mapState } from 'vuex'
export default {
  name: 'Header',
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    userLogout () {
      service(logout).then(res => {
        if (res.code === 200) {
          window.location.href = window.location.origin + login
        } else {
          this.$message.error('接口异常，退出失败！')
        }
      }, err => {
        if (err) {
          this.$message.error('接口异常，退出失败！')
        }
      })
    },
    submitStatus (value) {
      service(upLogin.upLoginStatus, {
        method: 'post',
        params: {
          loginStatus: value
        }
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('更新成功！')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    changeNotice () {
      service(needNotice, {
        method: 'post',
        params: {
          needNotice: this.userInfo.needNotice
        }
      }).then(res => {
        if (res.code === 200) {
          if (this.userInfo.needNotice === 1) {
            this.$message.success('开启手机邮箱通知！')
          } else {
            this.$message.success('关闭手机邮箱通知！')
          }
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
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
  .el-switch__label * {
    color: #fff;
    font-size: 16px;
    margin-right: 10px;
  }
}
</style>
