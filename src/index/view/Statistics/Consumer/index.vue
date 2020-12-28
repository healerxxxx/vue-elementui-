<template>
  <div class="statistics-consumer">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-tabs v-model="appTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="消费统计" name="1"></el-tab-pane>
      <el-tab-pane label="各价位消费统计" name="2"></el-tab-pane>
      <el-tab-pane label="新增用户数" name="3"></el-tab-pane>
      <el-tab-pane label="用户购买统计" name="4" v-if="appTab==='0'"></el-tab-pane>
      <el-tab-pane label="CPS订单导出" name="5" v-if="appTab==='0'"></el-tab-pane>
      <el-tab-pane label="彩票店地推统计" name="6" v-if="appTab==='0'"></el-tab-pane>
    </el-tabs>
    <!-- 红彩 消费统计 -->
    <consumer-by-day :screenHeight="windowHeight" appTab="0" :visible="appTab==='0'&&activeTab==='1'">
    </consumer-by-day>
    <!-- 精准比分 消费统计 -->
    <consumer-by-day :screenHeight="windowHeight" appTab="1" :visible="appTab==='1'&&activeTab==='1'">
    </consumer-by-day>
    <!-- 红彩 各价位消费统计 -->
    <consumer-by-price :screenHeight="windowHeight" appTab="0" :visible="appTab==='0'&&activeTab==='2'">
    </consumer-by-price>
    <!-- 精准比分 各价位消费统计 -->
    <consumer-by-price :screenHeight="windowHeight" appTab="1" :visible="appTab==='1'&&activeTab==='2'">
    </consumer-by-price>
    <!-- 红彩 新增用户数 -->
    <new-user-by-day :screenHeight="windowHeight" appTab="0" v-show="appTab==='0'&&activeTab==='3'">
    </new-user-by-day>
    <!-- 精准比分 新增用户数 -->
    <new-user-by-day :screenHeight="windowHeight" appTab="1" v-show="appTab==='1'&&activeTab==='3'">
    </new-user-by-day>
    <!-- 红彩 用户购买统计 -->
    <user-buy-thread :screenHeight="windowHeight" v-show="appTab==='0'&&activeTab==='4'">
    </user-buy-thread>
    <!-- 红彩 彩票店地推 -->
    <lottery-push :screenHeight="windowHeight" v-show="appTab==='0'&&activeTab==='6'">
    </lottery-push>
    <cps-order-export v-show="appTab==='0'&&activeTab==='5'"></cps-order-export>
  </div>
</template>

<script>
import ConsumerByDay from './Component/ConsumerByDay'
import ConsumerByPrice from './Component/ConsumerByPrice'
import NewUserByDay from './Component/NewUserByDay'
import UserBuyThread from './Component/UserBuyThread'
import LotteryPush from './Component/LotteryPush'
import CpsOrderExport from './Component/CpsOrderExport'
import { mapState } from 'vuex'
export default {
  name: 'statisticsConsumer',
  data () {
    return {
      appTab: '0',
      activeTab: '1'
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  components: {
    ConsumerByDay,
    ConsumerByPrice,
    NewUserByDay,
    UserBuyThread,
    CpsOrderExport,
    LotteryPush
  },
  methods: {
    handleClickTabs () {
      if (this.appTab === '1') {
        if (this.activeTab === '4') {
          this.activeTab = '1'
        }
      }
    }
  }
}
</script>
