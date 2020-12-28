<template>
  <el-drawer class="conversation" :visible.sync="drawer" :with-header="false" size="75%">
    <div class="conversation__session" v-if="drawer">
      <session-ui ref="sessionContent" class="conversation__session-ui" :userInfo="userInfo" />
      <div class="start" @click="toCurrent">
        发起会话
      </div>
    </div>
    <div class="conversation__detail" v-if="drawer">
      <UserDetail :userCurrentInfo="userInfo" @updateInfo="res => userDetailInfo = res" />
    </div>
  </el-drawer>
</template>

<script>
import UserDetail from './UserDetail'
import SessionUi from './im/SessionUi'
import { sessionOpen } from '../util/api/session'
import { mapMutations } from 'vuex'
export default {
  name: 'Conversation',
  props: {
    userInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  date () {
    return {
      messageInfo: {},
      userDetailInfo: null
    }
  },
  computed: {
    drawer: {
      get () {
        return this.value
      },
      set (val) {
        return this.$emit('input', val)
      }
    }
  },
  components: {
    UserDetail,
    SessionUi
  },
  methods: {
    ...mapMutations(['setCurrentSession']),
    toCurrent () {
      if (this.userDetailInfo.status !== 0) {
        this.$service(sessionOpen, {
          params: {
            messageUserId: this.userInfo.messageUserId }
        }).then(res => {
          if (res.code === 200) {
            this.$emit('input', false)
            this.messageInfo = res.data || {}
            this.$router.push({ name: 'Current', query: { type: this.messageInfo.sessionType } })
            this.setCurrentSession({ ...this.messageInfo, ...{ notReadNum: 0, userNickname: this.userDetailInfo.nickname } })
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          if (err) {
            this.$message.error(JSON.stringify(err))
          }
        })
      } else {
        this.$message.error('该用户已失效，不能发起会话')
      }
    }
  }
}
</script>

<style lang="scss" >
.conversation {
  &__session {
    width: 60%;
    height: calc(100vh - 92px);
    float: left;
    .start {
      height: 60px;
      background-color: #62B074;
      line-height: 60px;
      text-align: center;
      font-size: 20px;
      color: #fff;
    }
  }
  &__detail {
    float: right;
    width: 38%;
    height: 100%;
  }
  .el-drawer__body {
    padding: 20px 20px 10px;
  }
  .content {
    max-height: calc(100vh - 64px);
  }
}
</style>
