<template>
  <el-dialog :title="form.userId ? '修改专家' : '新增专家'" :visible.sync="visible" :close-on-click-modal="false" width="600px"
    center>
    <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="100px" ref="expertForm"
      size="small">
      <el-form-item label=" " prop="eType">
        <el-radio v-model="form.eType" label="0">正式专家</el-radio>
        <el-radio v-model="form.eType" label="1">预选专家</el-radio>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-upload class="avatar-uploader" accept=".jpeg,.jpg,.png,.gif" :show-file-list="false"
          :http-request="uploadAvatar" :before-upload="beforeAvatarUpload">
          <img v-if="form.avatar" :src="form.avatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="账号" prop="account">
        <el-input v-model="form.account" autocomplete="off" :disabled="form.userId"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="认证" prop="slogan">
        <el-input v-model="form.slogan" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="彩种" prop="lotteryCategorys">
        <el-checkbox-group v-model="form.lotteryCategorys">
          <el-checkbox v-for="item in lotteryList" :label="item.cId" :key="item.cId">{{item.cName}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="地区" prop="region">
        <el-radio v-model="form.region" label="0">中国</el-radio>
        <el-radio v-model="form.region" label="1">外国</el-radio>
        <el-radio v-model="form.region" label="2">外国人中国卡</el-radio>
        <el-radio v-model="form.region" label="3">机构</el-radio>
      </el-form-item>
      <el-form-item label="分类" prop="accountType">
        <el-radio v-model="form.accountType" label="1">个人</el-radio>
        <el-radio v-model="form.accountType" label="2">机构</el-radio>
      </el-form-item>
      <el-form-item label="足篮价格" prop="selectedPrice">
        <el-select v-model="form.selectedPrice" multiple placeholder="请选择">
          <el-option v-for="(value, key) in priceList" :key="key" :label="value" :value="key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="胜负彩价格" prop="winningColoursPrice" v-show="form.lotteryCategorys.indexOf(3) > -1">
        <el-select v-model="form.winningColoursPrice" multiple placeholder="请选择">
          <el-option v-for="(value, key) in priceList" :key="key" :label="value" :value="key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数字彩价格" prop="numLotteryPrice" v-show="form.lotteryCategorys.indexOf(100) > -1">
        <el-select v-model="form.numLotteryPrice" multiple placeholder="请选择">
          <el-option v-for="(value, key) in priceList" :key="key" :label="value" :value="key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="任九价格" prop="optionalNinePrice" v-show="form.lotteryCategorys.indexOf(4) > -1">
        <el-select v-model="form.optionalNinePrice" multiple placeholder="请选择">
          <el-option v-for="(value, key) in priceList" :key="key" :label="value" :value="key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="非临场发文" prop="postLimit" :rules="[{required: form.isLimit, message: '限制发文数不为空', trigger: ['blur', 'change']},
        {validator: postLimitRule, trigger: ['blur', 'change']}]">
        <el-checkbox v-model="form.isLimit">限制非临场发文数</el-checkbox>
        <el-input v-show="form.isLimit" style="width:100px;" v-model="form.postLimit" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="临场发文" prop="spotThreadLimit" :rules="[{required: form.isSpotThreadLimit, message: '限制发临场文数不为空', trigger: ['blur', 'change']},
        {validator: spotThreadLimitRule, trigger: ['blur', 'change']}]">
        <el-checkbox v-model="form.isSpotThreadLimit">限制临场发文数</el-checkbox>
        <el-input v-show="form.isSpotThreadLimit" style="width:100px;" v-model="form.spotThreadLimit"
          autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        + <el-input @keyup.native="handlerAreaCode" v-model="form.areaCode" style="width:70px;" :disabled="!idCardAuth">
        </el-input>
        <el-input v-model="form.phone" style="width:300px;" autocomplete="off" :disabled="!idCardAuth">
        </el-input>
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="form.idCard" autocomplete="off" :disabled="!idCardAuth"></el-input>
      </el-form-item>
      <el-form-item label="简介URL" prop="descLink">
        <el-input v-model="form.descLink" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="description">
        <el-input type="textarea" :rows="2" placeholder="请填写简介" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item label="协议" prop="divideRate" :rules="[{validator: divideRule, trigger: ['blur', 'change']}]"
        v-if="form.eType === '0'">
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
              <p v-if="item.protocolStatus === 0">{{item.divideRate | toPercent}}</p>
              <el-input v-else style="width:60px;" v-model="item.divideRateNumber"></el-input>%
            </td>
            <td>{{item.startTime}}</td>
            <td>{{item.endTime}}</td>
          </tr>
          <tr v-if="form.showAddProtocol || !form.userId">
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
      <el-form-item v-if="form.userId && form.eType === '0'">
        <el-button size="mini" type="primary" @click="protocolButton()">{{form.showAddProtocol?'取消协议':'增加协议'}}
        </el-button>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="visible = false">取 消</el-button>
      <el-button size="mini" type="primary" :loading="updateLoading" @click="submitExpert('expertForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { CommonApi, PriceProductArticle, ExpertList, ExpertDetail } from '../../../util/api'
import { objSort, arraySome } from '../../../util/tool'
import { uploadImg } from '../../../util/commonQuery'
export default {
  name: 'ExpertDialog',
  props: {
    expertInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    protocolList: {
      type: Array,
      default () {
        return []
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: {
        eType: '',
        avatar: '',
        account: '',
        nickname: '',
        slogan: '',
        lotteryCategorys: [],
        region: '',
        accountType: '',
        selectedPrice: [],
        optionalNinePrice: [],
        winningColoursPrice: [],
        numLotteryPrice: [],
        isLimit: false,
        postLimit: '',
        isSpotThreadLimit: false,
        spotThreadLimit: '',
        realName: '',
        areaCode: '86',
        phone: '',
        idCard: '',
        descLink: '',
        description: '',
        divideRate: '',
        startTime: '',
        endTime: ''
      },
      formRules: {
        eType: [{ required: true, message: '必填', trigger: 'blur' }],
        avatar: [{ required: true, message: '头像不为空', trigger: 'blur' }],
        account: [
          { required: true, message: '账号不为空', trigger: ['blur', 'change'] },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        nickname: [
          { required: true, message: '昵称不为空', trigger: ['blur', 'change'] },
          { max: 10, message: '昵称最多10个字符', trigger: ['blur', 'change'] }
        ],
        slogan: [
          { required: true, message: '认证不为空', trigger: ['blur', 'change'] },
          { max: 10, message: '认证最多5个字符', trigger: ['blur', 'change'] }
        ],
        lotteryCategorys: [
          { validator: (rule, value, callback) => {
            if (value.length < 1) {
              callback(new Error('彩种至少选择1种'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change'] }
        ],
        region: [
          { required: true, message: '地区必选', trigger: ['blur', 'change'] }
        ],
        accountType: [
          { required: true, message: '分类必选', trigger: ['blur', 'change'] }
        ],
        selectedPrice: [
          { validator: (rule, value, callback) => {
            if (value.length < 1 && (this.form.lotteryCategorys.indexOf(1) > -1 || this.form.lotteryCategorys.indexOf(2) > -1)) {
              callback(new Error('足篮价格至少选择一项'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change'] }
        ],
        optionalNinePrice: [
          { validator: (rule, value, callback) => {
            if (value.length < 1 && this.form.lotteryCategorys.indexOf(4) > -1) {
              callback(new Error('任九价格至少选择一项'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change'] }
        ],
        winningColoursPrice: [
          { validator: (rule, value, callback) => {
            if (value.length < 1 && this.form.lotteryCategorys.indexOf(3) > -1) {
              callback(new Error('胜负彩价格至少选择一项'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change'] }
        ],
        numLotteryPrice: [
          { validator: (rule, value, callback) => {
            if (value.length < 1 && this.form.lotteryCategorys.indexOf(100) > -1) {
              callback(new Error('数字彩价格至少选择一项'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change'] }
        ],
        realName: [
          { required: true, message: '姓名不为空', trigger: ['blur', 'change'] },
          { max: 99, message: '姓名最多99个字符', trigger: ['blur', 'change'] }
        ],
        phone: [
          { required: true, message: '手机号不为空', trigger: ['blur', 'change'] },
          { pattern: /^\d+$/, message: '手机号必须全为数字', trigger: ['blur', 'change'] },
          { max: 30, message: '手机号最多30个字符', trigger: ['blur', 'change'] }
        ],
        idCard: [
          { required: true, message: '身份证号不为空', trigger: ['blur', 'change'] },
          { max: 50, message: '身份证号最多50个字符', trigger: ['blur', 'change'] }
        ],
        descLink: [
          { type: 'url', message: '请输入正确的URL', trigger: ['blur', 'change'] }
        ],
        description: [
          { required: true, message: '简介不为空', trigger: ['blur', 'change'] },
          { max: 75, message: '简介最多75个字符', trigger: ['blur', 'change'] }
        ]
      },
      postLimitRule (rule, value, callback) {
        if (value && value !== -1 && !/^\d{1,2}$/.test(value)) {
          callback(new Error('限制文章数为0-99整数'))
        } else {
          callback()
        }
      },
      spotThreadLimitRule (rule, value, callback) {
        if (value && value !== -1 && !/^\d{1,2}$/.test(value)) {
          callback(new Error('限制文章数为0-99整数'))
        } else {
          callback()
        }
      },
      priceList: {},
      updateLoading: false,
      lotteryList: []
    }
  },
  computed: {
    idCardAuth () {
      return !this.form.userId || arraySome([33, 34], this.$store.state.userInfo.roleList)
    }
  },
  filters: {
    protocolStatus2CH (code) {
      let dict = {
        '-1': '待确认',
        '1': '正常',
        '0': '终止'
      }
      return dict[code] || '-'
    }
  },
  mounted () {
    this.getLottery()
    this.getPriceList()
  },
  methods: {
    divideRule (rule, value, callback) {
      if (this.form.userId && !this.form.showAddProtocol) {
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
    handlerAreaCode () {
      this.form.areaCode = this.form.areaCode.replace(/[^0-9]/g, '')
    },
    isMonthLastDay (date) {
      date = date.replace(/\.|\//g, '-')
      let _date = new Date(date + ' 00:00:00')
      let month = _date.getMonth() === 11 ? 0 : _date.getMonth() + 1
      let year = _date.getMonth() === 11 ? _date.getFullYear() + 1 : _date.getFullYear()
      let lastDay = new Date(new Date(year, month, 1).getTime() - 1000 * 60 * 60 * 24).getTime()
      return _date.getTime() === lastDay
    },
    /**
     * @description: 获取彩种信息
     */
    getLottery () {
      this.$service(CommonApi.lotteryCategory).then(res => {
        if (res.code === 200) {
          this.lotteryList = res.data.sort(objSort('cId'))
        }
      })
    },
    /**
     * @description: 获取方案价格列表，需要通过价格status=0判断可用的价格
     */
    getPriceList () {
      this.$service(PriceProductArticle[0].list).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            if (item.status === 0) {
              this.priceList[item.threadPriceId] = item.redCurrency + '豆'
            }
          })
        }
      })
    },
    beforeAvatarUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    uploadAvatar (data) {
      uploadImg(data.file, 'user').then(res => {
        this.form.avatar = res
      }, err => {
        if (err) this.$message.error('上传头像失败，请稍后再传！')
      })
    },
    protocolButton () {
      this.$set(this.form, 'showAddProtocol', !this.form['showAddProtocol'])
      this.$refs.expertForm.clearValidate()
    },
    /**
     * @description: 将详情传过来的对象挂载到form对象上
     * @param: {Object} 格式化的目标对象
     * @return: {Object} 格式化后的对象
     */
    dataToForm (val) {
      let _data = {
        userId: val.userId,
        eType: val.eType + '',
        avatar: val.avatar,
        account: val.account,
        nickname: val.nickname,
        slogan: val.slogan,
        lotteryCategorys: [],
        region: val.region + '',
        accountType: val.accountType + '',
        selectedPrice: [],
        optionalNinePrice: [],
        winningColoursPrice: [],
        numLotteryPrice: [],
        isLimit: val.postLimit !== -1,
        postLimit: val.postLimit === -1 ? '' : val.postLimit,
        isSpotThreadLimit: val.spotThreadLimit !== -1,
        spotThreadLimit: val.spotThreadLimit !== -1 ? val.spotThreadLimit : '',
        realName: val.realName,
        areaCode: val.areaCode ? val.areaCode + '' : '86',
        phone: val.phone,
        idCard: val.idCard,
        descLink: val.descLink,
        description: val.description
      }
      let _lotteryCategorys = []
      let _selectedPrice = []
      let _optionalNinePrice = []
      let _winningColoursPrice = []
      let _numLotteryPrice = []

      if (val.lotteryCategoryList && val.lotteryCategoryList.length > 0) {
        val.lotteryCategoryList.forEach(item => {
          _lotteryCategorys.push(item.lotteryCategoryId)
        })
      }
      if (val.expertThreadPriceVoList && val.expertThreadPriceVoList.length > 0) {
        val.expertThreadPriceVoList.forEach(item => {
          if (item.selected) _selectedPrice.push(item.threadPriceId + '')
        })
      }
      if (val.optionalNinePriceList && val.optionalNinePriceList.length > 0) {
        val.optionalNinePriceList.forEach(item => {
          if (item.selected) _optionalNinePrice.push(item.threadPriceId + '')
        })
      }
      if (val.winningColoursPriceList && val.winningColoursPriceList.length > 0) {
        val.winningColoursPriceList.forEach(item => {
          if (item.selected) _winningColoursPrice.push(item.threadPriceId + '')
        })
      }
      if (val.numLotteryPriceList && val.numLotteryPriceList.length > 0) {
        val.numLotteryPriceList.forEach(item => {
          if (item.selected) _numLotteryPrice.push(item.threadPriceId + '')
        })
      }
      _data.lotteryCategorys = _lotteryCategorys
      _data.selectedPrice = _selectedPrice
      _data.optionalNinePrice = _optionalNinePrice
      _data.winningColoursPrice = _winningColoursPrice
      _data.numLotteryPrice = _numLotteryPrice
      return _data
    },
    submitExpert (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let _data = {
            eType: this.form.eType,
            avatar: this.form.avatar,
            nickname: this.form.nickname,
            slogan: this.form.slogan,
            'lotteryCategoryId[]': this.form.lotteryCategorys.join(','),
            region: parseInt(this.form.region),
            accountType: parseInt(this.form.accountType),
            'threadPriceId[]': this.form.selectedPrice.join(','),
            'optionalNinePriceId[]': this.form.optionalNinePrice.join(','),
            'winningColoursPriceId[]': this.form.winningColoursPrice.join(','),
            'numLotteryPriceId[]': this.form.numLotteryPrice.join(','),
            postLimit: this.form.isLimit ? this.form.postLimit : -1,
            descLink: this.form.descLink,
            description: this.form.description,
            realName: this.form.realName,
            spotThreadLimit: this.form.isSpotThreadLimit ? this.form.spotThreadLimit : -1
          }
          if (!this.form.userId) {
            _data['account'] = this.form.account
          }
          if ((!this.form.userId || this.form.showAddProtocol) && this.form.eType === '0') {
            _data['divideRate'] = parseInt(this.form.divideRate) / 100
            _data['startTime'] = this.form.startTime
            _data['endTime'] = this.form.endTime
          }
          if (this.idCardAuth) {
            _data['areaCode'] = this.form.areaCode || '86'
            _data['phone'] = this.form.phone
            _data['idCard'] = this.form.idCard
          }
          this.updateLoading = true
          this.$service(this.form.userId ? ExpertDetail.update : ExpertList.add, {
            method: 'post',
            urlParams: this.form.userId ? { userId: this.form.userId } : null,
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$emit('closeExpertDialog')
              this.$emit('success')
            } else {
              this.updateLoading = false
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
          if (this.form.userId) {
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
    // 修改分成比例
    updateDivideRate (protocolId, divideRate) {
      this.$service(ExpertDetail.updateDivideRate, {
        method: 'post',
        urlParams: { protocolId: protocolId },
        data: { divideRate: divideRate }
      }).then(res => {
        if (res.code === 200) {
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.form = Object.assign({}, this.expertInfo.userId ? this.dataToForm(this.expertInfo) : {
          eType: '',
          avatar: '',
          account: '',
          nickname: '',
          slogan: '',
          lotteryCategorys: [],
          region: '',
          accountType: '',
          selectedPrice: [],
          optionalNinePrice: [],
          winningColoursPrice: [],
          numLotteryPrice: [],
          isLimit: false,
          postLimit: '',
          realName: '',
          areaCode: '86',
          phone: '',
          idCard: '',
          descLink: '',
          description: '',
          divideRate: '',
          startTime: '',
          endTime: ''
        })
        this.$nextTick(() => {
          this.$refs.expertForm.clearValidate()
        })
      } else {
        /**
         * @description: 通知父组件关闭弹窗
         */
        this.$emit('closeExpertDialog')
      }
    }
  }
}
</script>

<style lang="scss">
.avatar-uploader {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    float: left;
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
  .avatar {
    width: 98px;
    height: 98px;
    display: block;
  }
}
.expert-form-table {
  width: 100%;
  td {
    padding: 5px 10px;
    border: 1px solid #dcdfe6;
  }
}
</style>
