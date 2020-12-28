<template>
  <div class="relate-card-dialog">
    <el-dialog
      title="关联点卡"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="700px"
      center>
      <el-form :model="form" :disabled="updateLoading" label-width="80px" ref="form" size="small">
        <el-form-item label="选择点卡" prop="cardIds" :rules="{type: 'array', required: true, message: '点卡必须选', trigger: 'change'}">
          <el-select
            v-model="form.cardIds"
            multiple placeholder="请选择"
            @change="changeSelect">
            <el-option
              v-for="(item, key) in cardList"
              :key="key"
              :label="item.shortName"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="(item, key) in form.relateList"
          :label="item.shortName"
          :key="key"
          :prop="key + ''"
          :rules="{validator: relateRule, trigger: ['blur', 'change']}">
          <el-input v-model.number="item.probability" :ref="'probability' + key" placeholder="0-100" style="width:70px"></el-input> %概率，每人每周最多抢
          <el-input v-model.number="item.personWeekLottery" :ref="'personWeekLottery' + key" placeholder="0-99" style="width:70px"></el-input> 次，每人最多可抢
          <el-input v-model.number="item.personLottery" :ref="'personLottery' + key" placeholder="0-9999" style="width:80px"></el-input> 次
          <el-button type="primary" icon="el-icon-delete" circle size="small" @click="removeCard(key)"></el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="visible = false">取 消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('form')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { PriceProductPointCardUserLevel } from '../../../../util/api'
export default {
  name: 'relateCardDialog',
  props: {
    data: {
      type: 'Object',
      default () {
        return {}
      }
    },
    cardList: {
      type: 'Object',
      default () {
        return {}
      }
    },
    type: {
      type: 'Number',
      default: 0
    },
    visible: {
      type: 'Boolean',
      default: false
    },
    appTab: {
      default: 0
    }
  },
  data () {
    return {
      form: {
        cardIds: [],
        relateList: {}
      },
      updateLoading: false
    }
  },
  computed: {
    queryApi () {
      return PriceProductPointCardUserLevel[this.appTab]
    }
  },
  methods: {
    relateRule (rule, value, callback) {
      let _id = rule.field
      let _probability = this.$refs['probability' + _id][0].value
      let _personWeekLottery = this.$refs['personWeekLottery' + _id][0].value
      let _personLottery = this.$refs['personLottery' + _id][0].value
      if (!_probability) {
        callback(new Error('概率不为空'))
      } else {
        if (!/^\d+$/.test(_probability)) {
          callback(new Error('概率必须为正整数'))
        } else {
          if (_probability >= 0 && _probability <= 100) {
            if (!_personWeekLottery) {
              callback(new Error('每人每周数值不为空'))
            } else {
              if (!/^\d+$/.test(_personWeekLottery)) {
                callback(new Error('每人每周数值必须为正整数'))
              } else {
                if (_personWeekLottery >= 0 && _personWeekLottery < 100) {
                  if (!_personLottery) {
                    callback(new Error('每人最多数值不为空'))
                  } else {
                    if (!/^\d+$/.test(_personLottery)) {
                      callback(new Error('每人最多数值必须为正整数'))
                    } else {
                      if (_personLottery >= 0 && _personLottery < 10000) {
                        callback()
                      } else {
                        callback(new Error('每人最多数值为0-99'))
                      }
                    }
                  }
                } else {
                  callback(new Error('每人每周数值为0-99'))
                }
              }
            }
          } else {
            callback(new Error('概率为0-100'))
          }
        }
      }
    },
    changeSelect () {
      let _obj = {}
      this.form.cardIds.forEach(item => {
        if (this.form.relateList[item]) {
          _obj[item] = this.form.relateList[item]
        } else {
          _obj[item] = {
            personLottery: '',
            personWeekLottery: '',
            pointCardId: item,
            probability: '',
            shortName: this.cardList[item].shortName
          }
        }
      })
      this.form.relateList = _obj
    },
    removeCard (id) {
      this.form.cardIds.splice(this.form.cardIds.indexOf(id), 1)
      delete this.form.relateList[id]
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.updateLoading = true
          let _data = {
            appPackageType: this.type,
            relateCardList: [],
            userLevelId: this.data.userLevelId
          }
          Object.keys(this.form.relateList).forEach(item => {
            _data.relateCardList.push({
              personLottery: this.form.relateList[item].personLottery,
              personWeekLottery: this.form.relateList[item].personWeekLottery,
              pointCardId: this.form.relateList[item].pointCardId,
              probability: this.form.relateList[item].probability / 100
            })
          })
          _data.relateCardList = JSON.stringify(_data.relateCardList)
          this.$service(this.data.packageRelateLotteryCardVos && this.data.packageRelateLotteryCardVos.length > 0 ? this.queryApi.addCardUpdate : this.queryApi.addCard, {
            method: 'post',
            urlParams: {
              userLevelId: this.data.userLevelId
            },
            data: _data
          }).then(res => {
            if (res.code === 200) {
              this.updateLoading = false
              this.$message.success('关联点卡成功')
              this.$emit('closeDialog')
              this.$emit('success')
            } else {
              this.updateLoading = false
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      } else {
        this.$emit('closeDialog')
      }
    },
    data (val) {
      this.form = {
        cardIds: [],
        relateList: {}
      }
      if (val.packageRelateLotteryCardVos && val.packageRelateLotteryCardVos.length > 0) {
        val.packageRelateLotteryCardVos.forEach(item => {
          if (parseInt(item.appPackageType) === parseInt(this.type)) {
            item.relateLotteryCardList.forEach(_item => {
              this.form.cardIds.push(_item.pointCardId + '')
              _item.probability = Math.round(_item.probability * 100)
              this.form.relateList[_item.pointCardId] = _item
            })
          }
        })
      }
    }
  }
}
</script>
