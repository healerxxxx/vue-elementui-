<template>
  <div class="user-detail">
    <div class="tools">
      <h1>用户详情</h1>
      <el-tag size="small" class="user-status" v-if="!noData">{{ details.status | status2CH }}</el-tag>
    </div>
    <div class="content" v-if="!noData">
      <div class="personal-details">
        <h2>个人信息</h2>
        <ul>
          <li>
            <label>昵称：</label>
            <span>{{details.nickname}}</span>
          </li>
          <li>
            <label>用户ID：</label>
            <span>{{details.userId}}</span>
          </li>
          <li>
            <label>专属客服：</label>
            <span>{{details.adminName}}</span>
          </li>
        </ul>
        <ul>
          <li>
            <label>最后消费时间：</label>
            <span>{{details.lastDay}}天前</span>
          </li>
          <li>
            <label>消费总金额：</label>
            <span>{{details.consumerNum}}元</span>
          </li>
          <li>
            <label>当季用户等级：</label>
            <span>{{details.level | level2CH}}</span>
          </li>
          <li>
            <label>上季用户等级：</label>
            <span>{{details.levelPre | level2CH}}</span>
          </li>
          <li>
            <label>是否VIP：</label>
            <span v-if="details.status === 2">是</span>
            <span v-if="details.status !== 2 && !details.vipExpirationDay">否</span>
            <span
              v-if="details.status !== 2 && details.vipExpirationDay">过期{{Math.abs(details.vipExpirationDay)}}天</span>
          </li>
        </ul>
        <ul v-if="deviceList">
          <li v-for="(item, i) in deviceList" :key="i">
            <label>{{i === 0 ? '版本：' : ''}}</label>
            <span>{{item.terminal | terminal2CH}}({{item.appVersion}})</span>
          </li>
        </ul>
      </div>
      <div class="user-tag">
        <h2>用户标签</h2>
        <li v-for="(item,index) in details.labelList" :key="index">
          <span class="tag" @dblclick="dblclick(item)" v-show="!item.isEdit">
            {{item.labelTemp}}
          </span>
          <el-input size="small" style="width:90px" v-show="item.isEdit" v-model="item.label"
            @keyup.enter.native="upLabel(item)" @blur="upLabel(item)" ref="upTagInput">
          </el-input>
        </li>
        <el-input class="input-new-tag" v-show="inputVisible" v-model="label" ref="saveTagInput" size="small"
          @keyup.enter.native="addLabel">
        </el-input>
        <el-button class="button-new-tag" size="small" @click="showInput"
          v-show="(userInfo.adminNickname === details.adminName) && !inputVisible">+标签</el-button>
        <div style="padding:10px;font-size:15px"
          v-show="userInfo.adminNickname !== details.adminName && (!details.labelList || details.labelList.length <= 0)">
          暂无标签
        </div>
      </div>
      <div class="remark">
        <h2>添加备注</h2>
        <div v-show="details.remark && remarkShow" @click="showTextarea" class="remark-show">
          {{details.remark}}
        </div>
        <el-button class="button-new-tag" size="small" @click="showTextarea" v-show="!details.remark && !showTag">+备注
        </el-button>
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请添加备注" v-model="details.remark"
          @keyup.enter.native="upRemark" v-show="showTag" ref="textarea" style="font-size:15px">
        </el-input>
      </div>
    </div>
    <div class="no-data" v-if='noData'>暂无数据</div>
  </div>
</template>

<script>
import { userCountInfo } from '../util/api/current'
import { mapState } from 'vuex'
export default {
  name: 'UserDetail',
  props: {
    userCurrentInfo: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  filters: {
    status2CH (val) {
      const dict = {
        0: '失效客户',
        1: '过期客户',
        2: '有效客户'
      }
      return dict[val] || ''
    },
    level2CH (val) {
      const dict = {
        0: '小白',
        1: '银卡',
        2: '金卡',
        3: '钻石卡',
        4: '至尊VIP'
      }
      return dict[val] || ''
    },
    terminal2CH (val) {
      const dict = {
        1: 'Android',
        2: 'iOS'
      }
      return dict[val] || ''
    }
  },
  data () {
    return {
      inputVisible: false,
      label: '',
      loading: false,
      textarea: [],
      details: [],
      noData: false,
      remarkShow: true,
      showTag: false
    }
  },
  created () {
    this.getUserCountInfo()
  },
  computed: {
    ...mapState(['userInfo']),
    deviceList () {
      const { userDeviceInfoList } = this.details
      if (userDeviceInfoList && userDeviceInfoList.length > 0) {
        return userDeviceInfoList
      }
      return null
    }
  },
  watch: {
    userCurrentInfo: {
      deep: true,
      handler (newVal, oldVal) {
        if (newVal.messageUserId !== oldVal.messageUserId) {
          this.getUserCountInfo()
        }
      }
    }
  },
  methods: {
    showInput () {
      this.label = ''
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
        this.$refs.saveTagInput.$refs.input.addEventListener('blur', this.addLabel)
      })
    },
    dblclick (item) {
      if (this.userInfo.adminNickname === this.details.adminName) {
        item.isEdit = true
        this.$nextTick(_ => {
          this.$refs.upTagInput[0].$refs.input.focus()
        })
      }
    },
    showTextarea () {
      this.remarkShow = false
      this.showTag = true
      this.$nextTick(_ => {
        this.$refs.textarea.$refs.textarea.focus()
        this.$refs.textarea.$refs.textarea.addEventListener('blur', this.upRemark)
      })
    },
    addLabel () {
      if (this.label.length <= 16) {
        if (this.label.replace(/\s*/g, '')) {
          this.$service(userCountInfo.addLabel, {
            method: 'post',
            data: {
              messageUserId: this.userCurrentInfo.messageUserId,
              label: this.label
            }
          }).then(res => {
            if (res.code === 200) {
              this.details.labelList.push({ 'labelTemp': this.label, 'userLabelId': res.data })
              this.$message.success('添加成功')
              this.$refs.saveTagInput.$refs.input.removeEventListener('blur', this.addLabel)
              this.inputVisible = false
            } else {
              this.$message.error(res.code + ':' + res.message)
              this.inputVisible = false
            }
          }, err => {
            if (err) {
              this.$message.error(JSON.stringify(err))
              this.inputVisible = false
            }
          })
        } else {
          this.$message.error('标签不能为空')
          this.inputVisible = false
        }
      } else {
        this.$message.error('标签的最大长度为16个字符')
      }
    },
    upLabel (item) {
      if (item.label !== item.labelTemp) {
        if (item.label.length <= 16) {
          if (item.label.replace(/\s*/g, '')) {
            item.labelTemp = item.label
            this.$service(userCountInfo.upLabel, {
              method: 'post',
              data: {
                userLabelId: item.userLabelId,
                label: item.label
              }
            }).then(res => {
              if (res.code === 200) {
                this.$message.success('修改成功')
                item.labelTemp = item.label
                item.isEdit = false
              } else {
                this.$message.error(res.code + ':' + res.message)
                item.isEdit = false
              }
            }, err => {
              if (err) {
                this.$message.error(JSON.stringify(err))
                item.isEdit = false
              }
            })
          } else {
            this.$message.error('标签不能为空')
            item.label = item.labelTemp
            item.isEdit = false
          }
        } else {
          this.$message.error('标签的最大长度为16个字符')
          item.label = item.labelTemp
          item.isEdit = false
        }
      }
    },
    upRemark () {
      if (this.details.remark.length <= 100) {
        if (this.details.remark.replace(/\s*/g, '')) {
          this.$service(userCountInfo.upRemark, {
            method: 'post',
            data: {
              messageUserId: this.userCurrentInfo.messageUserId,
              remark: this.details.remark
            }
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('添加备注成功')
              this.remarkShow = true
              this.showTag = false
              this.$refs.textarea.$refs.textarea.removeEventListener('blur', this.upRemark)
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            if (err) {
              this.$message.error(JSON.stringify(err))
            }
          })
        } else {
          this.showTag = false
          this.details.remark = ''
        }
      } else {
        this.$message.error('备注的最大程度为100个字符')
      }
    },
    getUserCountInfo () {
      this.$service(userCountInfo.userCountInfo, {
        params: {
          messageUserId: this.userCurrentInfo.messageUserId
        }
      }).then(res => {
        if (res.code === 200) {
          res.data.labelList.forEach(item => {
            item.isEdit = false
            item.labelTemp = item.label
          })
          this.details = res.data
          this.$emit('updateInfo', res.data)
        } else {
          this.noData = this.details < 1
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.noData = this.details < 1
          this.$message.error(JSON.stringify(err))
        }
      })
    }
  }
}
</script>

<style lang="scss">
.user-detail {
  font-size: 15px;
  h1 {
    font-size: 20px;
    display: inline-block;
  }
  h2 {
    font-size: 16px;
    background-color: rgba(242, 242, 242, 1);
    padding: 3px 10px;
    margin-bottom: 10px;
  }
  .tools {
    padding-bottom: 5px;
    .user-status {
      float: right;
      background: rgb(204, 204, 204);
      color: #333333;
    }
  }
  .content {
    max-height: calc(100vh - 124px);
    overflow: auto;
    ul + ul {
      border-top: 1px solid #e6e6e6;
    }
  }
  .personal-details,
  .user-tag,
  .remark {
    padding-top: 5px;
    border-top: 1px solid #e6e6e6;
  }
  .remark-show {
    border: 1px solid #62b074;
    word-break: break-all;
    overflow-wrap: break-word;
    min-height: 42px;
    padding: 5px 15px;
    border-radius: 4px;
  }
  .personal-details {
    .tools {
      padding-bottom: 10px;
      border-bottom: 1px solid #e6e6e6;
    }
    li {
      position: relative;
      height: 30px;
      line-height: 30px;
      label {
        width: 115px;
        display: inline-block;
      }
    }
  }
  .user-tag {
    padding-bottom: 5px;
    font-size: 12px;
    li {
      margin: 0 8px 8px 0;
      display: inline-block;
      .input-new-tag {
        width: 80px;
      }
    }
  }
  .button-new-tag {
    background-color: #62b074;
    color: #ffffff;
  }
  .tag {
    color: #333333;
    border-color: #62b074;
    cursor: default;
    background-color: #e6f6ea;
    display: inline-block;
    height: 32px;
    padding: 0 10px;
    line-height: 30px;
    font-size: 12px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
  }
  .no-data {
    height: calc(100vh - 120px);
    line-height: calc(100vh - 120px);
    color: #909399;
    text-align: center;
  }
}
</style>
