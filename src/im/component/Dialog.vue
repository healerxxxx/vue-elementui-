<template>
  <el-dialog
    title="在班状态"
    :visible.sync="centerDialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="30%">
    <span> {{question ? '今日是否在班？': '是否下班？'}}</span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="submitStatus(1)">在班</el-button>
      <el-button type="primary" @click="submitStatus(0)">下班</el-button>
    </span>
  </el-dialog>

</template>

<script>
import { upLogin } from '../util/api/common'
import service from '../util/service'
export default {
  name: 'Dialog',
  data () {
    return {
      centerDialogVisible: false,
      question: false,
      beforeUnload_time: 0,
      gap_time: 0
    }
  },
  mounted () {
    // window.addEventListener('beforeunload', e => {
    //   console.log(e)
    //   e = e || window.event
    //   if (e) {
    //     e.returnValue = '关闭提示'
    //   }
    //   return '关闭提示'
    //   // this.question = false
    //   // this.centerDialogVisible = true
    // })
    if (window.performance.navigation.type !== 1) {
      this.centerDialogVisible = true
      this.question = true
    }
  },
  methods: {
    submitStatus (value) {
      this.centerDialogVisible = false
      this.$store.state.userInfo.loginStatus = value
      service(upLogin.upLoginStatus, {
        method: 'post',
        params: {
          loginStatus: value
        }
      }).then(res => {
        if (res.code === 200) {
          this.status = value
          this.$message.success('更新成功！')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.$message.error(JSON.stringify(err))
      })
    }
  }
}
</script>
