<template>
  <div class="settings-personal">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools" v-if="isAdmin">
        <el-button type="primary" @click="addPop()">新增客服</el-button>
      </div>
    </div>
    <el-form size="medium" label-width="100px">
      <el-form-item label="昵称">
        <el-input v-model="adminNicknameTemp" @change="upNickname" style="width:110px" :disabled="isAdmin">
        </el-input>
        <span v-if="isAdmin">*昵称仅超管可修改</span>
      </el-form-item>
      <el-form-item label="头像">
        <el-upload class="single-uploader" accept=".jpeg,.jpg,.png,.gif" :show-file-list="false"
          :http-request="uploadAvatarImg" :before-upload="beforeImgUpload">
          <img v-if="userInfo.avatar" :src="userInfo.avatar + '?imageView&thumbnail=98y98&quality=85'"
            class="single-img">
          <i v-else class="el-icon-plus single-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="会话设置">
        <p>
          <el-radio v-model="userInfo.shortcutKey" :label="0" @change="upInfo('shortCut')">enter发送, Ctrl+enter换行
          </el-radio>
        </p>
        <p>
          <el-radio v-model="userInfo.shortcutKey" :label="1" @change="upInfo('shortCut')">Ctrl+enter发送, enter换行
          </el-radio>
        </p>
      </el-form-item>
    </el-form>
    <el-dialog title="新增客服" :visible.sync="customerShow" width="600px" v-show="customerShow"
      :close-on-click-modal="false" center>
      <el-form :model="form" :disabled="updateLoading" label-width="150px" size="small" ref="addForm">
        <el-form-item label="corp邮箱" prop="loginName"
          :rules="[{required: true, message: '客服昵称不为空', trigger: ['blur', 'change']}]">
          <el-input placeholder="输入corp邮箱" v-model="form.loginName">
            <template slot="append">@corp.netease.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="adminName"
          :rules="[{required: true, message: '真实姓名不为空', trigger: ['blur', 'change']}]">
          <el-input v-model="form.adminName">
          </el-input>
        </el-form-item>
        <el-form-item label="客服昵称" prop="adminNickname"
          :rules="[{required: true, message: '客服昵称不为空', trigger: ['blur', 'change']}]">
          <el-input v-model="form.adminNickname">
          </el-input>
        </el-form-item>
        <el-form-item label="客服身份" prop="adminType"
          :rules="[{required: true, message: '客服身份必选', trigger: ['blur', 'change']}]">
          <el-select v-model="form.adminType" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="customerShow = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('addForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '../../../util/service'
import { uploadImg } from '../../../util/commonQuery'
import { personalSettings } from '../../../util/api/settings'
import { mapState } from 'vuex'
const options = [{ value: 0, label: '运营' }, { value: 1, label: '值班客服' }, { value: 2, label: '客服管理员' }]
export default {
  name: 'SettingsPersonal',
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 1,
      loading: false,
      tableHeight: null,
      customerShow: false,
      adminNicknameTemp: '',
      updateLoading: false,
      options: options,
      form: {
        loginName: '',
        adminName: '',
        adminNickname: '',
        adminType: 1
      }
    }
  },
  computed: {
    ...mapState(['userInfo']),
    isAdmin () {
      return this.userInfo.adminType === 2
    }
  },
  created () {
    if (this.userInfo.adminNickname) {
      this.adminNicknameTemp = this.userInfo.adminNickname
    }
  },
  methods: {
    upNickname () {
      if (this.adminNicknameTemp) {
        service(personalSettings.upNickname, {
          method: 'post',
          data: { nickname: this.adminNicknameTemp }
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('更新成功！')
            this.$store.dispatch('getUserInfo')
          } else {
            this.$message.error(res.code + ':' + res.message)
          }
        }, err => {
          this.$message.error(JSON.stringify(err))
        })
      } else {
        this.$message.error('昵称不能为空！')
        this.adminNicknameTemp = this.userInfo.adminNickname
      }
    },
    upInfo (type) {
      let _data = null
      let url = null
      if (type === 'shortCut') {
        _data = { shortcutKey: this.userInfo.shortcutKey }
        url = personalSettings.upShortCut
      }
      if (type === 'avatar') {
        _data = { avatar: this.userInfo.avatar }
        url = personalSettings.upAvatar
      }
      service(url, {
        method: 'post',
        data: _data
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('更新成功！')
          this.$store.dispatch('getUserInfo')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    },
    uploadAvatarImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.$store.state.userInfo.avatar = res
        this.upInfo('avatar')
      }, err => {
        if (err) this.$message.error('上传头像失败，请稍后再传！')
      })
    },
    beforeImgUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    addPop (data) {
      this.form = Object.assign({
        loginName: '',
        adminName: '',
        adminNickname: '',
        adminType: 1
      }, data || {})
      this.$nextTick(() => {
        this.$refs.addForm.clearValidate()
      })
      this.customerShow = true
    },
    submitForm (from) {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const _data = { ...this.form }
          _data.loginName = _data.loginName + '@corp.netease.com'
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(personalSettings.addCustomer, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.customerShow = false
              this.$message.success('添加成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    }
  }
}

</script>

<style lang="scss">
.settings-personal {
  .el-form-item__label {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
}
</style>
