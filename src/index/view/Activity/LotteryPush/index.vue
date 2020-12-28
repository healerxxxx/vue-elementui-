<template>
  <div class="push-hands">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="mini" @click="shopPop()">新增店铺</el-button>
      </div>
    </div>
    <el-table ref="elTable" :data="list" v-loading="loading" stripe :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="pushHandsUserId" label="序号" width="80">
      </el-table-column>
      <el-table-column prop="realName" label="姓名" min-width="120">
      </el-table-column>
      <el-table-column prop="account" label="账号" min-width="120">
      </el-table-column>
      <el-table-column prop="inviteCode" label="邀请码" min-width="80">
      </el-table-column>
      <el-table-column prop="createTime" label="建立时间" min-width="145">
        <template slot-scope="scope">
          {{[scope.row.createTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column prop="serviceStatus" label="协议状态" min-width="80">
        <template slot-scope="scope">
          {{scope.row.serviceStatus | serviceStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column prop="" label="生成活动图片" min-width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" :loading="scope.row.loading" @click="canvasImg (scope.row)">下载店铺图片
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="eStatus" label="店铺状态" min-width="80">
        <template slot-scope="scope">
          {{scope.row.eStatus ? '下线' :'上线'}}
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作" min-width="100">
        <template slot-scope="scope">
          <el-popover placement="left" v-model="scope.row.popover" v-if="scope.row.eStatus === 0 ">
            <p>确定下线？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.popover = false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="submitStatusForm(scope.row)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" size="small">下线</el-button>
          </el-popover>
          <el-popover placement="left" v-model=" scope.row.popover" v-if="scope.row.eStatus === 1 ">
            <p>确定上线？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.popover = false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="submitStatusForm(scope.row)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="primary" size="small">上线</el-button>
          </el-popover>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="shopPop(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" @current-change="getList" :current-page="pageIndex"
      :page-count="pageCount" class="page-bar-reset">
    </el-pagination>
    <el-dialog :title="form.pushHandsUserId?'修改地推店铺':'新增地推店铺'" :visible.sync="dialogFormVisible" width="560px"
      :close-on-click-modal="false" center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" size="small" ref="form">
        <el-form-item label="店铺账号" prop="account"
          :rules="[{required: true, message: '店铺账号不为空', trigger: ['blur', 'change']}]">
          <el-input v-model="form.account" :disabled="form.pushHandsUserId">
          </el-input>
        </el-form-item>
        <el-form-item label="查看码" prop="loginCode"
          :rules="[{required: true, message: '查看码不为空', trigger: ['blur', 'change']},
          {pattern: /^(?=(?:.*?[0-9]){5})(?=(?:.*?[!@#$%^*()]){1})(?!.*\s)[0-9!@#$%*^()]*$/, message: '查看码必须为5位数字和1位特殊字符！@ # $ % ^ * ()', trigger: ['blur', 'change']}]">
          <el-input v-model="form.loginCode">
          </el-input>
        </el-form-item>
        <el-form-item label="邀请码" prop="inviteCode"
          :rules="[{required: true, message: '邀请码不为空且为5位', trigger: ['blur', 'change']},
          {pattern: /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{5}$/, message: '邀请码只能为大写字母+数字的5位字符组合', trigger: ['blur', 'change']}]">
          <el-input v-model="form.inviteCode" :disabled="form.pushHandsUserId">
          </el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName" :rules="[{required: true, message: '真实姓名不为空', trigger: ['blur', 'change']},
          {max: 99, message: '姓名最多99个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.realName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard" :rules="[ {required: true, message: '身份证号不为空', trigger: ['blur', 'change']},
          {max: 50, message: '身份证号最多50个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.idCard" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" :rules="[ {required: true, message: '手机号不为空', trigger: ['blur', 'change']},
          {pattern: /^(?:(?:\+|00)86)?1\d{10}$/, message: '手机号填写不正确', trigger: ['blur', 'change']},
          {max: 30, message: '手机号最多30个字符', trigger: ['blur', 'change']}]">
          <el-input v-model="form.phone" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item label="执照" prop="license" :rules="[{required: true, message: '必填', trigger: ['blur', 'change']}]">
          <ul class="avatar-image">
            <li v-for="(item,index) in form.license" :key="index">
              <el-image style="width: 100px; height: 100px; " :src="item" :preview-src-list="form.license">
              </el-image>
              <lable class="icon" @click="removeImg(index)"><i class="el-icon-delete"></i></lable>
            </li>
          </ul>
          <el-upload class="avatar-uploader" accept=".jpeg,.jpg,.png,.gif" :show-file-list="false"
            :http-request="uploadLicense" :before-upload="beforeLicenseUpload" v-if="form.license.length < 3">
            <i class="el-icon-plus avatar-uploader-icon" v-if="form.license.length < 3"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="协议" prop="divideRate" :rules="[{validator: divideRule, trigger: ['blur', 'change']}]">
          <table class="expert-form-table">
            <colgroup>
              <col width="25%">
              <col width="25%">
              <col width="25%">
              <col width="25%">
            </colgroup>
            <tr>
              <td>状态</td>
              <td>分成比例</td>
              <td>开始时间</td>
              <td>结束时间</td>
            </tr>
            <tr v-for="item in protocolList" :key="item.protocolId">
              <td>{{item.protocolStatus | protocolStatus2CH}}</td>
              <td>
                <p>{{item.divideRate * 1000/10}}%</p>
              </td>
              <td>{{item.startTime}}</td>
              <td>{{item.endTime}}</td>
            </tr>
            <tr v-if="form.showAddProtocol || !form.pushHandsUserId">
              <td>待确认</td>
              <td>
                <el-input style="width:60px;" v-model="form.divideRate"></el-input>%
              </td>
              <td>
                <el-date-picker ref="startTime" v-model="form.startTime" type="date" style="width:130px"
                  value-format="yyyy.MM.dd" placeholder="选择日期" :picker-options="{disabledDate(time) {
                  return new Date(form.endTime).getTime() !== 0 && time.getTime() > new Date(form.endTime).getTime()
                }}">
                </el-date-picker>
              </td>
              <td>
                <el-date-picker ref="endTime" v-model="form.endTime" type="date" style="width:130px"
                  value-format="yyyy.MM.dd" placeholder="选择日期" :picker-options="{disabledDate(time) {
                  return new Date(form.startTime).getTime() !== 0 && time.getTime() < new Date(form.startTime).getTime()
                }}">
                </el-date-picker>
              </td>
            </tr>
          </table>
        </el-form-item>
        <el-form-item v-if="form.pushHandsUserId">
          <el-button size="mini" type="primary" @click="protocolButton()">{{form.showAddProtocol?'取消协议':'增加协议'}}
          </el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('form')">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ActivityLotteryPush, ExpertDetail } from '../../../util/api'
import { uploadImg } from '../../../util/commonQuery'
import { mapState } from 'vuex'
import { formatDate, getImageObject, imageDownLoad } from '../../../util/tool'

export default {
  name: 'LotteryPush',
  data () {
    return {
      loading: false,
      pageIndex: 0,
      pageSize: 25,
      pageCount: 1,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {
        license: []
      },
      updateLoading: false,
      statusLoading: false,
      protocolList: [],
      canvasBg: 'https://relottery.ws.126.net/thread/20200714/msGEOG.jpg',
      defaultDownloadPage: 'https://hongcai.163.com/html/downloadapp.html'
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getList()
    this.setHeight()
  },
  filters: {
    serviceStatus2CH (code) {
      let dict = {
        '-1': '待确认',
        '1': '正常',
        '0': '终止或待确认'
      }
      return dict[code] || '-'
    },
    protocolStatus2CH (code) {
      let dict = {
        '-1': '待确认',
        '1': '正常',
        '0': '终止'
      }
      return dict[code] || '-'
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    dateFormat (date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(ActivityLotteryPush.list, {
        params: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize || 25
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          !noScroll && (this.$refs.elTable.bodyWrapper.scrollTop = 0)
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    // 获得协议列表
    getProtocolList (id) {
      return this.$service(ExpertDetail.protocolList, {
        urlParams: {
          userId: id
        },
        params: {
          protocolUserType: 1
        }
      }).then(res => {
        if (res.code === 200) {
          this.protocolList = res.data || []
          let len = res.data.length
          for (let i = 0; i < len; i++) {
            this.protocolList[i].divideRateNumber = (this.protocolList[i].divideRate * 100).toFixed(0)
          }
          return Promise.resolve(res.data)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    protocolButton () {
      this.$set(this.form, 'showAddProtocol', !this.form['showAddProtocol'])
      this.$refs.form.clearValidate()
    },
    shopPop (data) {
      this.form = Object.assign({ license: [] }, data)
      if (data) {
        const license = data.license
        this.form.license = license.split(',')
        this.getProtocolList(data.pushHandsUserId).then(() => {
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs.form.clearValidate()
          })
        })
      } else {
        // this.form = {}
        this.protocolList = []
        // this.form.license = []
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    removeImg (index) {
      this.form.license.splice(index, 1)
    },
    beforeLicenseUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    uploadLicense (data) {
      uploadImg(data.file, 'thread', true).then(res => {
        this.form.license.push(res)
      }, err => {
        if (err) this.$message.error('上传头像失败，请稍后再传！')
      })
    },

    divideRule (rule, value, callback) {
      if (this.form.pushHandsUserId && !this.form.showAddProtocol) {
        callback()
      } else {
        let _startTime = this.$refs.startTime.value
        let _endTime = this.$refs.endTime.value
        if (value) {
          if (!/^\d+$/.test(value)) {
            callback(new Error('分成比例必须为整数'))
          } else if (value < 0 || value > 99) {
            callback(new Error('分成比例0-99'))
          } else {
            if (!_startTime) {
              callback(new Error('协议开始时间不为空'))
            } else if (!_endTime) {
              callback(new Error('协议结束时间不为空'))
            } else if (!this.isMonthLastDay(_endTime)) {
              callback(new Error('协议结束时间必须为当月最后一天'))
            } else {
              callback()
            }
          }
        } else {
          callback(new Error('分成比例不为空'))
        }
      }
    },
    isMonthLastDay (date) {
      date = date.replace(/\.|\//g, '-')
      let _date = new Date(date + ' 00:00:00')
      let month = _date.getMonth() === 11 ? 0 : _date.getMonth() + 1
      let year = _date.getMonth() === 11 ? _date.getFullYear() + 1 : _date.getFullYear()
      let lastDay = new Date(new Date(year, month, 1).getTime() - 1000 * 60 * 60 * 24).getTime()
      return _date.getTime() === lastDay
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _arr = []
          this.form.license.forEach(item => {
            _arr.push(item)
          })
          const data = {
            'realName': this.form.realName,
            'loginCode': this.form.loginCode,
            'idCard': this.form.idCard,
            'license': _arr.join(','),
            'phone': this.form.phone
          }
          if (this.form.account) { data.account = this.form.account }
          if (this.form.inviteCode) { data.inviteCode = this.form.inviteCode }
          if (this.form.inviteCode) { data.inviteCode = this.form.inviteCode }
          if (this.form.startTime) {
            data.startTime = this.form.startTime
          }
          if (this.form.endTime) {
            data.endTime = this.form.endTime
          }
          if (this.form.divideRate) {
            data.divideRate = this.form.divideRate * 0.01
          }
          this.$service(this.form.pushHandsUserId ? ActivityLotteryPush.update : ActivityLotteryPush.add, {
            method: 'post',
            urlParams: this.form.pushHandsUserId ? { pushHandsUserId: this.form.pushHandsUserId } : null,
            data: data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.pushHandsUserId ? '修改' : '添加') + '成功。')
              this.getList(this.form.pushHandsUserId ? this.pageIndex : 1, true)
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
          if (this.form.pushHandsUserId) {
            let len = this.protocolList.length
            for (let i = 0; i < len; i++) {
              let rate = this.protocolList[i].divideRateNumber / 100
              if (this.protocolList[i].protocolStatus !== 0 && rate !== this.protocolList[i].divideRate) {
                this.updateDivideRate(this.protocolList[i].protocolId, rate)
              }
            }
          }
        }
      })
    },
    canvasImg (info) {
      const downLoading = this.$loading({
        lock: true,
        text: '正在生成图片...',
        background: 'rgba(255, 255, 255, 0.5)'
      })
      const { inviteCode, realName } = info
      const canvas = document.createElement('canvas')
      canvas.width = 750
      canvas.height = 1334
      const ctx = canvas.getContext('2d')
      getImageObject(this.canvasBg, 750, 1334).then(res => {
        // 绘制背景图
        ctx.drawImage(res, 0, 0)
        // 绘制邀请码开始
        ctx.save()
        ctx.font = 'bolder 55px Arail,sans-serif'
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'Middle'
        ctx.fillText(inviteCode[0], 180, 615)
        ctx.fillText(inviteCode[1], 280, 615)
        ctx.fillText(inviteCode[2], 375, 615)
        ctx.fillText(inviteCode[3], 475, 615)
        ctx.fillText(inviteCode[4], 570, 615)
        ctx.restore()
        try {
          const _src = canvas.toDataURL('image/jpeg')
          imageDownLoad(_src, `${realName}`, 'jpg')
          downLoading.close()
        } catch (err) {
          err && downLoading.close() && this.$message('无法下载图片，请使用最新版Chrome浏览器再试')
        }
      }).catch(err => {
        err && downLoading.close() && this.$message('生成无法生成图片，请使用最新版Chrome浏览器再试')
      })
    },
    submitStatusForm (form) {
      form.eStatus ? (form.eStatus = 0) : (form.eStatus = 1)
      this.$service(ActivityLotteryPush.statusUpdate, {
        method: 'post',
        urlParams: {
          pushHandsUserId: form.pushHandsUserId
        },
        data: {
          eStatus: form.eStatus
        }
      }).then(res => {
        this.statusLoading = false
        if (res.code === 200) {
          form.popover = false
          this.$message.success('更新状态成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.statusLoading = false
        err && this.$message.error(JSON.stringify(err))
      })
    }
  },
  watch: {
    windowHeight () {
      this.setHeight()
    }
  }
}
</script>
<style lang="scss">
.avatar-image {
  display: inline-block;
  li {
    margin: 0 10px 10px 0;
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100px;
    float: left;
    .icon {
      position: absolute;
      left: 74px;
      top: -6px;
      width: 40px;
      height: 24px;
      background: #13ce66;
      text-align: center;
      transform: rotate(45deg);
      box-shadow: 0 0 1pc 1px rgba(0, 0, 0, 0.2);
      .el-icon-delete {
        color: #fff;
      }
    }
  }
}
.avatar-uploader {
  display: inline-block;
  vertical-align: top;
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .el-upload:hover {
    border-color: #e62121;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 98px;
    height: 98px;
    line-height: 98px;
    text-align: center;
  }
}
.expert-form-table {
  width: 100%;
  td {
    padding: 5px 10px;
    border: 1px solid #dcdfe6;
  }
}
.el-image-viewer__close {
  color: #fff;
}
</style>
