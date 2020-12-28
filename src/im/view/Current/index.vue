<template>
  <div class="current">
    <div class="current__list" v-if="sessionList.length > 0">
      <el-tabs v-model="activeName" stretch='true'>
        <el-tab-pane name="1">
          <span slot="label" class="item-1">
            <el-badge :value="noReadLen" v-if="noReadLen>0">
            </el-badge>
            {{`我的客户(${noReadLen}/${currentList.length})`}}
          </span>
        </el-tab-pane>
        <el-tab-pane name="2">
          <span slot="label" class="item-2">
            <el-badge :value="otherNoReadLen" v-if="otherNoReadLen>0">
            </el-badge>
            {{`其他客户(${otherNoReadLen}/${otherList.length})`}}
          </span>
        </el-tab-pane>
      </el-tabs>
      <ul>
        <li v-for="item in list" :key="item.messageUserId" @click="chooseUser(item)"
          :class="{'is-active' :  item.messageUserId === currentSession.messageUserId}">
          <img :src="item.avatar || avatar +'?imageView&thumbnail=40y40&quality=85'" @error.once="errorImg" />
          <div class="message">
            <div class="name">{{item.userNickname}}</div>
            <div class="nickname" v-show="item.adminNickname && activeName == '2'">{{item.adminNickname}}</div>
            <div class="content">
              <span>
                <i class="un-read"
                  v-if="item.notReadNum > 0 && item.messageUserId !== currentSession.messageUserId">[{{item.notReadNum}}条]</i>
                <i v-if="item.messageType === 2">[图片]</i>
                <i v-if="item.messageType === 1"> {{item.messageContent | content2Text}}</i>
              </span>
            </div>
            <div class="date" v-if="item.messageContent">{{item.createTime | dateFormat}}</div>
            <el-badge :value="item.notReadNum" class="noread"
              v-if=" item.notReadNum > 0 && item.messageUserId !== currentSession.messageUserId "
              :class="{'my-noread':activeName == '1'}">
            </el-badge>
          </div>
        </li>
      </ul>
    </div>
    <div class="current__main" v-if="currentSession.messageUserId">
      <session-ui ref="sessionContent" class="current__session-ui" type="im" :userInfo="currentSession" />
      <im-editor ref="editor" :shortcutKey="shortcutKey"
        @send="(type, data) => $refs.sessionContent.send(type, data)" />
    </div>
    <div class="current__detail" v-if="currentSession.messageUserId">
      <UserDetail :userCurrentInfo="currentSession" />
    </div>
    <div class="current__no-data" v-if="sessionList.length <= 0">
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
import UserDetail from '../../component/UserDetail'
import SessionUi from '../../component/im/SessionUi'
import ImEditor from '../../component/im/Editor'
import { mapState, mapMutations } from 'vuex'
import { formatDate } from '../../util/tool'
export default {
  name: 'Current',
  data () {
    return {
      activeName: '1',
      userId: 0,
      nickname: '',
      currentId: 0,
      avatar: 'https://relottery.ws.126.net/thread/20191115/oWbNQe.png'
    }
  },
  computed: {
    ...mapState(['userInfo', 'sessionList', 'currentSession']),
    shortcutKey () {
      if (this.userInfo) {
        return this.userInfo.shortcutKey
      }
      return null
    },
    currentList () {
      return this.sessionList.filter(item => item.sessionType === 1)
    },
    otherList () {
      return this.sessionList.filter(item => item.sessionType === 2)
    },
    list () {
      return this.activeName === '1' ? this.currentList : this.otherList
    },
    noReadLen () {
      return this.currentList.filter(item => item.notReadNum > 0).length
    },
    otherNoReadLen () {
      return this.otherList.filter(item => item.notReadNum > 0).length
    }
  },
  components: {
    UserDetail,
    SessionUi,
    ImEditor
  },
  filters: {
    content2Text (val) {
      const div = document.createElement('div')
      div.innerHTML = val
      div.style.display = 'none'
      return div.textContent || div.innerText
    },
    dateFormat (val) {
      const time = formatDate(val, 'yyyy-MM-dd')
      const today = formatDate(new Date(), 'yyyy-MM-dd')
      if (today === time) {
        return formatDate(val, 'hh:mm:ss')
      }
      return formatDate(val, 'MM-dd hh:mm')
    }
  },
  activated () {
    if (this.$route.query.type) {
      this.activeName = this.$route.query.type.toString()
    }
  },
  watch: {
    sessionList: {
      deep: true,
      handler (val) {
        const obj = val.find(item => item.messageUserId === this.currentSession.messageUserId)
        if (obj) {
          this.setCurrentSession({ ...this.currentSession, ...obj, ...{ notReadNum: 0 } })
        }
      }
    }
  },
  methods: {
    ...mapMutations(['setCurrentSession']),
    errorImg (e) {
      e.target.src = 'https://relottery.ws.126.net/thread/20191115/oWbNQe.png'
    },
    chooseUser (data) {
      this.setCurrentSession({ ...data, ...{ notReadNum: 0 } })
      if (this.$refs.editor) {
        this.$refs.editor.clear()
      }
    }
  }
}
</script>

<style lang='scss'>
.current {
  display: flex;
  height: calc(100vh - 88px);
  justify-content: space-between;
  &__list {
    width: 300px;
    padding-right: 10px;
    flex-shrink: 0;
    border-right: 1px solid #e6e6e6;
    position: relative;
    ul {
      max-height: calc(100vh - 142px);
      overflow: auto;
      li {
        padding: 12px 5px 6px;
        position: relative;
        vertical-align: middle;
        border-bottom: 1px solid #e6e6e6;
        cursor: pointer;
        margin-right: 4px;
        &:hover {
          background-color: #f2f2f2;
        }
        .el-badge__content.is-fixed.is-dot {
          right: 9px;
          top: 3px;
        }
        img {
          width: 36px;
          height: 36px;
          display: inline-block;
          border-radius: 100%;
          border: 1px solid #cccccc;
        }
        .message {
          position: absolute;
          left: 48px;
          right: 5px;
          top: 8px;
          .date {
            font-size: 12px;
            color: #949494;
            position: absolute;
            right: 0;
            bottom: 0;
            line-height: 21px;
          }
          .noread {
            position: absolute;
            top: -3px;
            left: 160px;
          }
          .my-noread {
            left: 208px !important;
          }
          .name {
            padding-right: 35px;
            line-height: 20px;
            color: #666666;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .nickname {
            top: 0;
            right: 10px;
            overflow: hidden;
            font-size: 13px;
            color: #333333;
            position: absolute;
            width: 40px;
            height: 16px;
            padding: 0 5px;
            line-height: 16px;
            text-align: center;
            background: #62b074;
            display: inline-block;
            border-radius: 4px;
          }
          .content {
            padding-right: 70px;
            line-height: 25px;
            span {
              font-size: 13px;
              display: block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          i {
            font-style: normal;
            &.un-read {
              color: #f56c6c;
            }
          }
        }
      }
      .is-active {
        background-color: #bee9be;
        &:hover {
          background-color: #bee9be;
        }
      }
    }
    .el-tabs__item {
      font-size: 16px;
    }
    .item-1,
    .item-2 {
      position: relative;
      .el-badge {
        right: -18px;
        position: absolute;
        top: -20px;
        .el-badge__content {
          background: #ff9933;
        }
      }
    }
  }
  &__detail {
    width: 320px;
    padding-left: 10px;
    flex-shrink: 0;
  }
  &__main {
    // max-width: 600px;
    min-width: 320px;
    flex: auto;
  }
  &__session-ui {
    height: calc(100% - 250px) !important;
    border-bottom: 0 !important;
  }
  &__no-data {
    width: 100%;
    text-align: center;
    &:before {
      content: "";
      width: 0;
      height: 100%;
      display: inline-block;
      vertical-align: middle;
    }
    span {
      display: inline-block;
      vertical-align: middle;
      font-size: 16px;
    }
  }
}
</style>
