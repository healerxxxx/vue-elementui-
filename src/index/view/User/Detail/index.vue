<template>
  <div class="user-detail">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ patd: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: fromRouter.fullPath }" v-if="fromRouter">{{fromRouter.meta.title}}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentRouter">{{currentRouter.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <table-scroll>
      <table v-if="userInfo" class="detail-table" style="min-width:660px;">
        <colgroup>
          <col width="10%">
          <col width="20%">
          <col width="10%">
          <col width="20%">
          <col width="10%">
          <col width="30%">
        </colgroup>
        <tr>
          <td>账号</td>
          <td>{{userInfo.account || '-'}}</td>
          <td>昵称</td>
          <td>{{userInfo.nickname || '-'}}</td>
          <!-- <td>手机号</td>
          <td>{{userInfo.phone || '-'}}</td> -->
          <td>注册时间</td>
          <td>{{userInfo.registerTime || '-'}}</td>
        </tr>
        <tr>
          <td>活动范围</td>
          <td>{{userInfo.location || '-'}}</td>
          <td>账号余额</td>
          <td>{{userInfo.redCurrency || '-'}}</td>
          <td>消费总额</td>
          <td>{{userInfo.costCount || '-'}}</td>
        </tr>
        <tr>
          <td>首次消费日期</td>
          <td>{{userInfo.firstDate || '-'}}</td>
          <td>首次消费时长</td>
          <td>{{userInfo.firstTime?userInfo.firstTime+'天':'-'}}</td>
          <td>最后一次消费时间</td>
          <td>{{userInfo.lastTime?userInfo.lastTime+'天前':'-'}}</td>
        </tr>
        <tr>
          <td>用户等级</td>
          <td>{{userInfo.level | vipLevel2CH}}</td>
          <td>是否VIP</td>
          <td>{{userInfo.vipStatus || '否'}}</td>
          <td>生日</td>
          <td>
            <span v-if="!birthdayEditor && userInfo.birthday">{{[userInfo.birthday, 'yyyy-MM-dd'] | dateFormat}}</span>
            <el-date-picker
              size="mini"
              v-show="birthdayEditor"
              v-model="birthdayTemp"
              type="date"
              style="width:130px"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
            <el-button v-if="userInfo.birthday" type="primary" size="mini" @click="birthdayEditorClick">{{birthdayEditor ? '确定' : '修改'}}</el-button>
            <el-button v-if="birthdayEditor" type="danger" size="mini" @click="birthdayEditor = false">取消</el-button></td>
        </tr>
      </table>
    </table-scroll>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="`充值订单 ${userInfo?userInfo.rechargeListCount:''}`" name="0"></el-tab-pane>
      <el-tab-pane :label="`消费订单 ${userInfo?userInfo.consumerListCount:''}`" name="1"></el-tab-pane>
      <el-tab-pane :label="`购买专家 ${userInfo?userInfo.buyExpertListCount:''}`" name="2"></el-tab-pane>
      <el-tab-pane :label="`购买文章 ${userInfo?userInfo.buyThreadListCount:''}`" name="3"></el-tab-pane>
      <el-tab-pane :label="`购买赛事 ${userInfo?userInfo.buyMatchListCount:''}`" name="4"></el-tab-pane>
    </el-tabs>
    <tab-recharge :visible="activeTab==='0'" :userId="userId"></tab-recharge>
    <tab-consumer :visible="activeTab==='1'" :userId="userId"></tab-consumer>
    <tab-expert :visible="activeTab==='2'" :userId="userId"></tab-expert>
    <tab-thread :visible="activeTab==='3'" :userId="userId"></tab-thread>
    <tab-match :visible="activeTab==='4'" :userId="userId"></tab-match>
  </div>
</template>

<script>
import { UserDetail } from '../../../util/api'
import TableScroll from '../../../component/TableScroll'
import TabRecharge from './compontents/TabRecharge'
import TabConsumer from './compontents/TabConsumer'
import TabExpert from './compontents/TabExpert'
import TabThread from './compontents/TabThread'
import TabMatch from './compontents/TabMatch'
export default {
  data () {
    return {
      fromRouter: null,
      currentRouter: null,
      activeTab: '0',
      userId: null,
      userInfo: null,
      birthdayEditor: false,
      birthdayTemp: '',
      birthdayLoading: false
    }
  },
  created () {
    this.userId = this.$route.params.id
    this.getuserInfo().then(res => {
      this.userInfo = res.data
    })
  },
  components: {
    TableScroll,
    TabRecharge,
    TabConsumer,
    TabExpert,
    TabThread,
    TabMatch
  },
  methods: {
    getuserInfo () {
      return new Promise((resolve, reject) => {
        this.$service(UserDetail[0]['info'], {
          urlParams: {
            userId: this.userId
          }
        }).then(res => {
          if (res.code === 200 && res.data) {
            resolve(res)
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      })
    },
    birthdayEditorClick () {
      if (this.birthdayEditor) {
        if (!this.birthdayTemp) {
          this.$message.warning('请填写生日日期')
        } else {
          if (this.birthdayLoading) return
          this.birthdayLoading = true
          this.$service(UserDetail[0].updateBirthday, {
            method: 'post',
            data: {
              userId: this.userId,
              birthday: this.birthdayTemp
            }
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('更新成功')
              this.birthdayEditor = false
              this.userInfo.birthday = this.birthdayTemp
              this.birthdayTemp = ''
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
            this.birthdayLoading = false
          }).catch(err => {
            if (err) {
              this.birthdayLoading = false
              this.$message.error(JSON.stringify(err))
            }
          })
        }
      } else {
        this.birthdayEditor = true
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.userId = to.params.id
    this.getuserInfo().then(res => {
      this.userInfo = res.data
    })
    next()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.fromRouter = from && from.name ? from : null
      vm.currentRouter = to
    })
  }
}
</script>
