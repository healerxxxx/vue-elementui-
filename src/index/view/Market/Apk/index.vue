<template>
  <div class="apk">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools"
           style="position:relative;overflow:hidden;">
        <el-button size="small" type="primary">点击上传</el-button>
        <input type="file"
          multiple="multiple"
          accept=".apk"
          ref="ApkFiles"
          @change="apkUpload($event)"
          :style="apkUpStyle">
        <div slot="tip" class="el-upload__tip">只能上传APK文件</div>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-table ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column prop="fileName"
        label="文件名"
        min-width="120">
      </el-table-column>
      <el-table-column prop="url"
        label="链接"
        min-width="200">
      </el-table-column>
      <el-table-column prop="fileSize"
        label="大小"
        width="80">
      </el-table-column>
      <el-table-column prop="fileType"
        label="类型"
        width="60">
      </el-table-column>
      <el-table-column prop="lastModifyTime"
        label="最近修改"
        width="160">
      </el-table-column>
    </el-table>
    <el-dialog :title="uploadEnd?'上传完成':'上传中'"
      :visible.sync="fileList.length"
      width="500px"
      center
      :show-close="!uploadEnd"
      :close-on-click-modal="!uploadEnd">
      <el-table :data="fileList"
        style="width: 100%"
        max-height="450"
        :show-header="false">
        <el-table-column prop="name" label="文件名">
          <template slot-scope="scope">
            {{scope.row.file.name}}
          </template>
        </el-table-column>
        <el-table-column prop="status"
          label="状态"
          width="80">
          <template slot-scope="scope">
            {{filesStatus2CH[scope.row.status] || '未开始'}}
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="uploadEnd" @click="fileList = []">知道了</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="coverFileObj"
      width="500px"
      center
      :show-close="false"
      :close-on-click-modal="false">
      <div class="cover-file-pop-item">
        {{coverFileObj}}
      </div>
      <div class="cover-file-pop-item">
        <el-checkbox v-model="isRemind">总是执行相同操作</el-checkbox>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="overwrite">覆盖</el-button>
        <el-button type="success" @click="skip">跳过</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MarketApk } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'Apk',
  data () {
    return {
      activeTab: 0,
      list: [],
      loading: false,
      tableHeight: null,
      fileList: [],
      filesStatus2CH: {
        0: '未开始',
        1: '上传中',
        2: '已完成',
        3: '失败',
        4: '跳过',
        5: '上传中断',
        6: '请一分钟后再上传'
      },
      isRemind: false,
      isOverwrite: false,
      isSkip: false,
      uploadEnd: false,
      apkIndex: 0,
      coverFileObj: null,
      apkUpStyle: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        opacity: 0
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getApkList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    handleClickTabs () {
      this.list = []
      this.getApkList()
    },
    getApkList () {
      if (this.loading) return
      this.loading = true
      this.$service(MarketApk[this.activeTab].apkList).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        this.loading = false
        this.$message.error(JSON.stringify(err))
      })
    },
    apkUpload (event) {
      var files = event.target.files || event.dataTransfer.files
      this.fileList = []
      for (let i = 0, n = files.length; i < n; i++) {
        this.fileList.push({ 'status': 0, file: files[i] })
      }
      event.target.value = ''
      this.isRemind = false
      this.isOverwrite = false
      this.isSkip = false
      this.apkIndex = 0
      this.uploadEnd = false
      this.apkFileUpload()
    },
    apkUploadRequest (data, validateRepeat) {
      let _data = new FormData()
      _data.append('file', data)
      _data.append('validateRepeat', validateRepeat)
      return this.$service(MarketApk[this.activeTab].apkAdd, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: _data
      }).then(res => {
        return Promise.resolve(res)
      }, err => {
        return Promise.reject(err)
      })
    },
    apkFileUpload (overwrite) {
      if (this.uploadEnd) return
      if (this.apkIndex >= this.fileList.length) {
        this.uploadEnd = true
        return
      }
      let _overwrite = true
      if (overwrite === false || this.isOverwrite) {
        _overwrite = false
      }
      let _data = this.fileList[this.apkIndex].file
      this.fileList[this.apkIndex].status = 1
      this.apkUploadRequest(_data, _overwrite).then(res => {
        if (res.code === 200) {
          this.fileList[this.apkIndex].status = 2
          this.apkIndex++
          this.apkFileUpload()
        } else if (res.code === 9100000 || res.code === 301001) {
          if (this.isSkip) {
            this.fileList[this.apkIndex].status = 4
            this.apkIndex++
            this.apkFileUpload()
          } else {
            this.coverFileObj = this.fileList[this.apkIndex].file.name
          }
        } else if (res.code === 9100005 || res.code === 207006) {
          this.fileList[this.apkIndex].status = 6
          this.apkIndex++
          this.apkFileUpload()
        } else {
          this.fileList[this.apkIndex].status = 3
          this.apkIndex++
          this.apkFileUpload()
        }
      }, () => {
        this.fileList[this.apkIndex].status = 3
        this.apkIndex++
        this.apkFileUpload()
      })
    },
    overwrite () {
      this.isOverwrite = true
      this.apkFileUpload(false)
      this.coverFileObj = null
    },
    skip () {
      this.isSkip = true
      this.fileList[this.apkIndex].status = 4
      this.apkIndex++
      this.apkFileUpload()
      this.coverFileObj = null
    },
    cancel () {
      this.fileList[this.apkIndex].status = 5
      this.uploadEnd = true
      this.coverFileObj = null
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
.cover-file-pop-item {
  display: flex;
  justify-content: center;
  margin: 15px 0 0;
}
</style>
