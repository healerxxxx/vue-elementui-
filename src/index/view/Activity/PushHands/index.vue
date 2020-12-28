<template>
  <div class="push-hands">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <span style="margin-right: 10px;" v-if="statusInfo"><b>活动状态：</b>{{statusInfo.openStatus ? '上线' : '下线'}}</span>
        <el-button type="danger" size="mini" @click="switchStatus">更新状态</el-button>
        <el-button type="primary" size="mini" @click="pushHandsPop()">新建推手</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="pushHandsId"
        label="ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="nickname"
        label="昵称"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="userId"
        label="用户ID"
        min-width="80">
      </el-table-column>
      <el-table-column
        prop="channelName"
        label="渠道号"
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="专家参与活动时间"
        width="165">
      </el-table-column>
      <el-table-column
        prop=""
        label="活动生成图片"
        min-width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" :loading="scope.row.loading" @click="getExpertInfo(scope.row, scope.row.userId, 'list')">下载推手图片</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            v-model="scope.row.delPop">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="pushHandsDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="pushHandsPop(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page="pageIndex"
      :page-count="pageCount"
      class="page-bar-reset">
    </el-pagination>
    <el-dialog
      :title="form.pushHandsId?'修改推手':'新建推手'"
      :visible.sync="dialogFormVisible"
      width="360px"
      :close-on-click-modal="false"
      center>
      <el-form
        :model="form"
        :disabled="updateLoading"
        label-width="80px"
        size="small"
        ref="form">
        <el-form-item
          label="专家ID"
          prop="userId"
          :rules="[{required: true, message: '专家ID不为空', trigger: ['blur', 'change']},
          {pattern: /^\d+$/, message: '必须为数字', trigger: ['blur', 'change']}]">
          <el-input
            v-model="form.userId"
            @change="getExpertInfo(expertInfo, form.userId, 'form')"
            :suffix-icon="expertInfo.loading ? 'el-icon-loading' : ''"
            :disabled="form.pushHandsId"
            autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item
          v-if="expertInfo.nickname"
          label="专家昵称">
          <p>{{expertInfo.nickname}}</p>
        </el-form-item>
        <el-form-item
          label="渠道号"
          prop="channelName"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {pattern: /^[A-Za-z0-9_-]{1,}$/, message: '只支持输入大小字母数字及-_', trigger: ['blur', 'change']}]">
          <el-input v-model="form.channelName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="updateLoading" @click="submitForm('form')">保存并下载推手图片</el-button>
      </div>
    </el-dialog>
    <!-- 修改活动状态 -->
    <el-dialog
      title="修改活动状态"
      :close-on-click-modal="false"
      :visible.sync="dialogStatusFormVisible"
      width="400px"
      center>
      <el-form
        :model="statusForm"
        :disabled="statusLoading"
        label-width="80px"
        size="mini"
        ref="statusForm">
        <el-form-item label="状态">
          <el-radio v-model="statusForm.openStatus" :label="true">上线</el-radio>
          <el-radio v-model="statusForm.openStatus" :label="false">下线</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogStatusFormVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="statusLoading" @click="submitStatusForm('statusForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ActivityPushHands } from '../../../util/api'
import { queryExpertDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
import { getImageObject, qrcode, strokeRoundRect, fillRoundRect, drawRoundRectPath, canvasDrawText, imageDownLoad } from '../../../util/tool'
export default {
  name: 'PushHands',
  data () {
    return {
      statusInfo: {
        openStatus: true
      },
      loading: false,
      pageIndex: 0,
      pageSize: 25,
      pageCount: 1,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      updateLoading: false,
      dialogStatusFormVisible: false,
      statusLoading: false,
      statusForm: {},
      expertInfo: {
        loading: false
      },
      canvasBg: 'https://cms-bucket.ws.126.net/2019/08/07/3ec72ed39e8c474585e04f4099f349a8.jpeg',
      defaultDownloadPage: 'https://hongcai.163.com/html/downloadapp.html'
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getSwitchStatus()
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (page, noScroll) {
      if (this.loading) return
      this.loading = true
      this.pageIndex = page || 1
      this.$service(ActivityPushHands.list, {
        urlParams: {
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
    pushHandsPop (data) {
      this.expertInfo = {
        loading: false
      }
      data = data || {}
      this.form = Object.assign({}, data)
      if (this.form.pushHandsId && this.form.userId) {
        this.getExpertInfo(this.expertInfo, this.form.userId, 'form')
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          if (!this.expertInfo.nickname) {
            return this.$message.error('找不到对应的专家，请输入正确的专家ID')
          }
          this.updateLoading = true
          this.$service(this.form.pushHandsId ? ActivityPushHands.update : ActivityPushHands.add, {
            method: 'post',
            urlParams: this.form.pushHandsId ? {pushHandsId: this.form.pushHandsId} : null,
            data: this.form
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success((this.form.pushHandsId ? '修改' : '添加') + '成功。')
              this.canvasImg(this.expertInfo, this.form.channelName)
              this.getList(this.form.pushHandsId ? this.pageIndex : 1, true)
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
        }
      })
    },
    getExpertInfo (data, id, type) {
      if (data.loading || !/^\d+$/.test(id)) return
      type === 'form' && this.$set(data, 'nickname', '')
      this.$set(data, 'loading', true)
      this.$set(data, 'avatar', '')
      this.$set(data, 'desc', '')
      queryExpertDetailbyId(id).then(res => {
        if (res.nickname) {
          type === 'form' && (data.nickname = res.nickname)
          data.avatar = res.avatar
          data.desc = res.description
          if (type === 'list') {
            this.canvasImg(data)
          }
        } else {
          this.$message.error('获取专家信息失败，请稍后再试')
        }
        data.loading = false
      }).catch(err => {
        if (err) {
          data.loading = false
          this.$message.error('获取专家信息失败，请稍后再试')
        }
      })
    },
    canvasImg (info, channelName) {
      const downLoading = this.$loading({
        lock: true,
        text: '正在生成图片...',
        background: 'rgba(255, 255, 255, 0.5)'
      })
      const { nickname, avatar, desc } = info
      channelName = channelName || info.channelName
      const downloadQrcode = qrcode({
        text: `${this.defaultDownloadPage}?from=${channelName}`,
        width: 196,
        height: 196
      })
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')
      getImageObject(this.canvasBg, 1080, 1920).then(res => {
        // 绘制背景图
        ctx.drawImage(res, 0, 0)
        getImageObject(avatar, 250, 250).then(_res => {
          // 绘制头像开始
          ctx.save()
          ctx.arc(253, 768, 125, 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(_res, 128, 643, 250, 250)
          ctx.restore()
          // 绘制头像结束
          strokeRoundRect(ctx, 728.5, 1616.5, 230, 230, 6, 1, '#dedede') // 绘制二维码白色背景外边框
          fillRoundRect(ctx, 728.5, 1616.5, 230, 230, 6, '#fff') // 绘制二维码白色背景
          ctx.drawImage(downloadQrcode, 744, 1632, 196, 196) // 绘制二维码
          fillRoundRect(ctx, 818, 1706, 50, 50, 4, '#fff') // 填充二维码上头像白色背景
          // 绘制二维码上头像开始
          ctx.save()
          ctx.translate(820, 1708)
          drawRoundRectPath(ctx, 46, 46, 4)
          ctx.clip()
          ctx.drawImage(_res, 0, 0, 46, 46)
          ctx.restore()
          // 绘制二维码上头像结束
          // 绘制专家名称开始
          ctx.save()
          ctx.font = 'bolder 46px PingFangSC-Medui,sans-serif'
          ctx.fillStyle = '#000'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(nickname, 440, 655)
          ctx.restore()
          // 绘制专家名称结束
          // 绘制专家简介开始
          ctx.save()
          ctx.font = 'lighter 30px Microsoft Yahei,sans-serif'
          ctx.fillStyle = '#666'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          canvasDrawText(ctx, desc, 440, 734, 515, 46)
          ctx.restore()
          // 绘制专家简介结束
          try {
            const _src = canvas.toDataURL('image/jpeg')
            imageDownLoad(_src, `${nickname}_${channelName}`, 'jpg')
            downLoading.close()
          } catch (err) {
            err && downLoading.close() && this.$message('无法下载图片，请使用最新版Chrome浏览器再试')
          }
        }).catch(err => {
          err && downLoading.close() && this.$message('生成无法生成图片，请使用最新版Chrome浏览器再试')
        })
      }).catch(err => {
        err && downLoading.close() && this.$message('生成无法生成图片，请使用最新版Chrome浏览器再试')
      })
    },
    pushHandsDel (data) {
      if (data.loading) return
      this.$set(data, 'loading', true)
      this.$service(ActivityPushHands.del, {
        method: 'post',
        urlParams: {
          pushHandsId: data.pushHandsId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getList(this.pageIndex, true)
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    getSwitchStatus () {
      this.$service(ActivityPushHands.status).then(res => {
        if (res.code === 200) {
          this.statusInfo = {
            openStatus: !res.data || (res.data && typeof res.data.openStatus === 'undefined') ? false : res.data.openStatus
          }
        }
      })
    },
    switchStatus () {
      this.statusForm = Object.assign({}, this.statusInfo)
      this.dialogStatusFormVisible = true
      this.$nextTick(() => {
        this.$refs.statusForm.clearValidate()
      })
    },
    submitStatusForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.statusLoading) return
          this.statusLoading = true
          this.$service(ActivityPushHands.statusUpdate, {
            method: 'post',
            data: {
              openStatus: this.statusForm.openStatus ? 1 : 0
            }
          }).then(res => {
            this.statusLoading = false
            if (res.code === 200) {
              this.dialogStatusFormVisible = false
              this.getSwitchStatus()
              this.$message.success('更新状态成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.statusLoading = false
            err && this.$message.error(JSON.stringify(err))
          })
        }
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
