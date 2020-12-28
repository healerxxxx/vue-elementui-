<template>
  <div class="slideshow">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="slideshowPop()" v-if="activeTab==='1'">新建短链</el-button>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
      <el-tab-pane label="红彩" name="0"></el-tab-pane>
      <el-tab-pane label="精准比分" name="1"></el-tab-pane>
    </el-tabs>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="location"
        label="权重"
        width="50">
      </el-table-column>
      <el-table-column
        prop="group"
        label="分组"
        width="60">
        <template slot-scope="scope">
          {{scope.row.group | group2CH}}
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="跳转类型"
        width="100">
        <template slot-scope="scope">
          {{scope.row.type | typeToCh}}
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="标题"
        min-width="130">
      </el-table-column>
      <el-table-column
        prop="redirectUrl"
        label="跳转链接"
        min-width="150">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="60">
        <template slot-scope="scope">
          {{scope.row.status | statusToCh}}
        </template>
      </el-table-column>
      <el-table-column
        prop="imgUrl"
        label="图片"
        width="180">
        <template slot-scope="scope">
          <img :src="scope.row.imgUrl + '?imageView&thumbnail=150y62&quality=85'" alt="">
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="small" @click="slideshowPop(scope.row)"></el-button>
          <el-popover
            placement="left"
            v-model="scope.row.delPop"
            v-if="activeTab==='1'">
            <p>确定删除？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope.row.delPop=false">取消</el-button>
              <el-button type="primary" size="mini" :loading="scope.row.loading" @click="slideshowDel(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="small"></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="form.hId?'修改头图':'新增头图'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form :model="form" :rules="formRules" :disabled="updateLoading" label-width="80px" size="small" ref="slideshowForm">
        <el-form-item label="推荐">
          <el-checkbox v-model="form.status">{{form.status?'是':'否'}}</el-checkbox>
        </el-form-item>
        <el-form-item label="权重" prop="location">
          <el-input type="age" v-model="form.location" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="标题" prop="description">
          <el-input v-model="form.description" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="跳转类型" prop="type">
          <el-select v-model="form.type" :disabled="form.type==='celebrity'" placeholder="请选择">
            <el-option
              v-for="(item, key, index) in typeList"
              :key="index"
              :label="item"
              :value="key"
              :disabled="form.type!=='celebrity'&&key==='celebrity'">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="'跳转' + (!form.type?'链接':form.type==='url'?'URL':'ID')" prop="redirectUrl">
          <el-input v-model="form.redirectUrl" autocomplete="off" @change="previewID" :suffix-icon="previewLoading ? 'el-icon-loading' : ''"></el-input>
        </el-form-item>
        <el-form-item v-if="redirectPreview">
          <span>{{redirectPreview}}</span>
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="form.group" placeholder="请选择" disabled="disabled">
            <option value="1">主包</option>
          </el-select>
        </el-form-item>
        <el-form-item label="图片" prop="imgUrl">
          <el-upload
            class="single-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadSingleImg"
            :before-upload="beforeImgUpload">
            <img v-if="form.imgUrl" :src="form.imgUrl + '?imageView&thumbnail=98y98&quality=85'" class="single-img">
            <i v-else class="el-icon-plus single-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateLoading" @click="submitForm('slideshowForm')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { HeadSlideshow } from '../../../util/api'
import { validate } from '../../../util/tool'
import { uploadImg, queryQuizDetailbyId, queryExpertDetailbyId, queryMatchDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'HeadSlideShow',
  data () {
    return {
      activeTab: 0,
      loading: false,
      list: [],
      tableHeight: null,
      dialogFormVisible: false,
      typeList: {
        'expert': '专家',
        'match': '比赛',
        'thread': '文章',
        'url': 'URL',
        'celebrity': '红人榜'
      },
      dataTemp: null,
      redirectPreview: '',
      previewLoading: false,
      updateLoading: false,
      form: {
        status: false,
        location: '',
        type: '',
        description: '',
        redirectUrl: '',
        imgUrl: '',
        group: '1'
      },
      formRules: {
        location: [
          {validator (rule, value, callback) {
            if (!value) {
              callback(new Error('权重必填'))
            } else if (!/^[1-9][0-9]{0,1}$/.test(value)) {
              callback(new Error('权重必须为正数，且1-99'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']}
        ],
        type: [
          {required: true, message: '跳转类型不为空', trigger: ['blur', 'change']}
        ],
        description: [
          {required: true, message: '请输入标题', trigger: ['blur', 'change']},
          {max: 24, message: '长度不多于24个字符', trigger: ['blur', 'change']}
        ],
        redirectUrl: [
          {validator: this.urlRules, trigger: ['blur', 'change']}
        ],
        imgUrl: [
          {required: true, message: '图片不为空', trigger: ['blur', 'change']}
        ]
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  filters: {
    group2CH (val) {
      let dict = {
        1: '主包',
        2: '马甲包'
      }
      return dict[val] || ''
    },
    typeToCh (val) {
      let dict = {
        'expert': '专家',
        'match': '比赛',
        'thread': '文章',
        'url': 'URL',
        'celebrity': '红人榜',
        '1': '专家',
        '2': '比赛',
        '3': '文章',
        '4': 'URL',
        '5': '红人榜'
      }
      return dict[val] || ''
    },
    statusToCh (val) {
      let dict = {
        '1': '上线',
        '2': '下线',
        'online': '上线',
        'offline': '下线'
      }
      return dict[val] || ''
    }
  },
  created () {
    this.getSlideshowList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    urlRules (rule, value, callback) {
      if (!value) {
        callback(new Error('跳转链接不为空'))
      } else if (this.form.type !== 'url') {
        if (!/^\d+$/.test(value) && this.activeTab !== '1') {
          callback(new Error('ID必须为数字'))
        } else {
          callback()
        }
      } else {
        if (!validate.url.test(value)) {
          callback(new Error('URL不合法'))
        } else {
          callback()
        }
      }
    },
    handleClickTabs () {
      this.list = []
      this.getSlideshowList()
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - this.$refs.elTable.$el.offsetTop - 20
      })
    },
    getSlideshowList () {
      if (this.loading) return
      this.loading = true
      this.$service(HeadSlideshow[this.activeTab].list).then(res => {
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
    beforeImgUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return false
      }
    },
    uploadSingleImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.form.imgUrl = res
      }, err => {
        if (err) this.$message.error('上传图片失败，请稍后再传！')
      })
    },
    slideshowPop (data) {
      this.form = Object.assign({}, data || {status: false,
        location: '',
        type: '',
        description: '',
        redirectUrl: '',
        imgUrl: '',
        group: '1'})
      switch (this.form.type) {
        case 1:
          this.form.type = 'expert'
          break
        case 2:
          this.form.type = 'match'
          break
        case 3:
          this.form.type = 'thread'
          break
        case 4:
          this.form.type = 'url'
          break
      }
      switch (this.form.status) {
        case 1:
          this.form.status = 'online'
          break
        case 2:
          this.form.status = 'offline'
          break
      }
      this.form.status = this.form.status === 'online'
      this.form.group = this.form.group + ''
      this.dataTemp = Object.assign({}, this.form)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.slideshowForm.clearValidate()
      })
    },
    dataFixToNum (data) {
      let _data = Object.assign({}, data)
      switch (_data.headImageType) {
        case 'expert':
          _data.headImageType = 1
          break
        case 'match':
          _data.headImageType = 2
          break
        case 'thread':
          _data.headImageType = 3
          break
        case 'url':
          _data.headImageType = 4
          break
      }
      switch (_data.headImageStatus) {
        case 'online':
          _data.headImageStatus = 1
          break
        case 'offline':
          _data.headImageStatus = 2
          break
      }
      return _data
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (this.updateLoading) return
          let pcUrlMatch = this.form.redirectUrl.match(/^(http|https):\/\/(hongcai|sports)\.163\.com(\/article)?\/\d{2}\/\d{4}\/\d{2}\/([a-zA-Z0-9]{16})\.html$/)
          let pcUrl = ''
          if (pcUrlMatch) {
            pcUrl = 'https://c.m.163.com/nc/qa/3g-expand/hc-article.html?docid=' + pcUrlMatch[4] + '#pcarticle=' + this.form.redirectUrl
          }
          let newData = {
            description: this.form.description,
            headImageType: this.form.type,
            headImageStatus: this.form.status ? 'online' : 'offline',
            headImgLocation: this.form.location,
            imgUrl: this.form.imgUrl,
            redirectUrl: pcUrl || this.form.redirectUrl,
            headImgGroup: this.form.group
          }
          if (this.form.hId) {
            newData['headImgId'] = this.form.hId
          }
          this.updateLoading = true
          this.$service(this.form.hId ? HeadSlideshow[this.activeTab].update : HeadSlideshow[this.activeTab].add, {
            method: 'post',
            data: this.activeTab !== '1' ? newData : this.dataFixToNum(newData)
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.getSlideshowList()
              this.$message.success((this.form.hId ? '更新' : '添加') + '成功')
            } else {
              this.$message.error(res.code + ':' + res.message)
            }
          }, err => {
            this.updateLoading = false
            this.$message.error(JSON.stringify(err))
          })
          if (parseInt(this.activeTab) === 0) {
            if (parseInt(this.dataTemp.location) !== parseInt(newData.headImgLocation) || this.dataTemp.type !== newData.headImageType || this.dataTemp.group !== newData.headImgGroup || this.dataTemp.description !== newData.description || this.dataTemp.redirectUrl !== newData.redirectUrl || this.dataTemp.imgUrl !== newData.imgUrl) {
              this.syncSlideshow(this.dataFixToNum(newData))
            }
          }
        }
      })
    },
    syncSlideshow (data) {
      this.$service(HeadSlideshow[1].sync, {
        method: 'post',
        data: data
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('头图同步马甲包成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, function (err) {
        this.$message.error(JSON.stringify(err))
      })
    },
    previewID () {
      this.redirectPreview = ''
      if (this.activeTab === '1' || !this.form.type || this.form.type === 'url' || !/^\d+$/.test(this.form.redirectUrl) || this.previewLoading) return
      const id = this.form.redirectUrl
      this.previewLoading = true
      switch (this.form.type) {
        case 'thread':
          queryQuizDetailbyId(id).then(res => {
            this.redirectPreview = '提示：对应跳转文章[' + res.title + ']'
            this.previewLoading = false
          }).catch(err => {
            if (err) {
              this.previewLoading = false
              this.redirectPreview = '提示：无对应跳转文章'
            }
          })
          break
        case 'match':
          queryMatchDetailbyId(id).then(res => {
            this.redirectPreview = '提示：对应跳转赛事[' + res.homeMatchTeam.teamName + 'VS' + res.guestMatchTeam.teamName + ']'
            this.previewLoading = false
          }).catch(err => {
            if (err) {
              this.previewLoading = false
              this.redirectPreview = '提示：无对应跳转赛事'
            }
          })
          break
        case 'expert':
          queryExpertDetailbyId(id).then(res => {
            this.redirectPreview = '提示：对应跳转专家[' + res.nickname + ']'
            this.previewLoading = false
          }).catch(err => {
            if (err) {
              this.previewLoading = false
              this.redirectPreview = '提示：无对应跳转专家'
            }
          })
          break
      }
    },
    slideshowDel (data) {
      this.$set(data, 'loading', true)
      this.$service(HeadSlideshow[this.activeTab].del, {
        method: 'post',
        data: {
          headImgId: data.hId
        }
      }).then(res => {
        data.loading = false
        if (res.code === 200) {
          data.delPop = false
          this.$message.success('删除成功')
          this.getSlideshowList()
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        data.loading = false
        this.$message.error(JSON.stringify(err))
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
