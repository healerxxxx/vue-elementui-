<template>
  <div class="red-rank">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="tools">
        <el-button type="primary" size="small" @click="redRankPop()">新建红人榜</el-button>
      </div>
    </div>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="celebrityListId"
        label="ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题"
        min-width="140">
      </el-table-column>
      <el-table-column
        label="有效时段"
        min-width="120">
        <template slot-scope="scope">
          {{[scope.row.startDateTime, 'yyyy-MM-dd hh:mm'] | dateFormat}} ~ {{[scope.row.endDateTime, 'yyyy-MM-dd hh:mm'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="推送范围"
        width="120">
        <template slot-scope="scope">
          {{scope.row.appType === 0 ? '红彩' : scope.row.appType === 1 ? '精准比分' : ''}}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template slot-scope="scope">
          {{scope.row.status ? '上线' : '下线'}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="180">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="redRankPop(scope.row)"></el-button>
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="1"
            :inactive-value="0"
            @click.native="switchStatus(scope.row)">
          </el-switch>
          <el-button type="primary" size="mini" :loading='scope.row.loading' @click="redRankPreview(scope.row)">预览</el-button>
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
    <el-dialog :title="form.celebrityListId?'修改红人榜':'新增红人榜'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="600px" center>
      <el-form :model="form" :disabled="updateLoading" label-width="110px" size="small" ref="form">
        <el-form-item label="推送范围">
          <el-select v-model="form.pushType" placeholder="请选择">
            <el-option label="弹框&Banner" value="2"></el-option>
            <el-option label="仅弹框" value="0"></el-option>
            <el-option label="仅Banner" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.pushType!=='1'" label="弹框图片" prop="imageUrl" :rules="[{required: form.pushType!=='1', message: '弹框图片必须添加', trigger: ['blur', 'change']}]">
          <el-upload
            class="single-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadSingleImg"
            :before-upload="beforeImgUpload">
            <img v-if="form.imageUrl" :src="form.imageUrl + '?imageView&thumbnail=98y98&quality=85'" class="single-img">
            <i v-else class="el-icon-plus single-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="弹框频率" v-show="form.pushType!=='1'">
          <el-select v-model="form.popupTimes" placeholder="请选择">
            <el-option v-for="item in popupTimesList" :key="item.value" :label="item.text" :value="item.value"></el-option>
            <!-- <el-option label="不弹" value="0"></el-option>
            <el-option label="弹一次" value="1"></el-option>
            <el-option label="弹两次" value="2"></el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.pushType!=='0'" label="Banner图片" prop="bannerImageUrl" :rules="[{required: form.pushType!=='0', message: 'Banner图片必须添加', trigger: ['blur', 'change']}]">
          <el-upload
            class="single-uploader"
            accept=".jpeg,.jpg,.png,.gif"
            :show-file-list="false"
            :http-request="uploadBannerImg"
            :before-upload="beforeImgUpload">
            <img v-if="form.bannerImageUrl" :src="form.bannerImageUrl + '?imageView&thumbnail=98y98&quality=85'" class="single-img">
            <i v-else class="el-icon-plus single-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item
          label="展示时间"
          prop="startDateTime"
          :rules="[{validator: dateRule, trigger: ['blur', 'change']}]">
          <el-date-picker
            v-model="form.startDateTime"
            type="datetime"
            style="width:200px"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.endDateTime).getTime() !== 0 && time.getTime() > new Date(form.endDateTime).getTime())
            }}">
          </el-date-picker>
          ~
          <el-date-picker
            ref="endTime"
            v-model="form.endDateTime"
            type="datetime"
            style="width:200px"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="{disabledDate(time) {
              return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || (new Date(form.startDateTime).getTime() !== 0 && time.getTime() < new Date(form.startDateTime).getTime())
            }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="简介"
          prop="title"
          :rules="[{required: true, message: '必填', trigger: ['blur', 'change']},
          {max: 60, message: '最多60字', trigger: ['blur', 'change']}]">
          <el-input type="textarea" :rows="2" placeholder="请填写简介" v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item
          label="足球红人榜"
          prop="footballWeight"
          :rules="[{required: true, message: '权重必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,1}$/, message: '整数且1-99', trigger: ['blur', 'change']}]">
          <el-checkbox v-model="form.footballDisplay"></el-checkbox>
          <el-input
            v-model.number="form.footballWeight"
            placeholder="1-99"
            :disabled="!form.footballDisplay"
            style="width:60px">
          </el-input>
          <span class="text-red">*示例：163,10中2</span>
        </el-form-item>
        <el-form-item>
          <el-input
            style="width:100px"
            :class="{'error': item.err}"
            v-for="(item, index) in form.footballArr"
            :key="index"
            v-model="item.value"
            :disabled="!form.footballDisplay"
            @blur="queryExpertInfo(0, index)">
          </el-input>
          <span v-if="form.footballDisplay" class="el-icon-circle-plus" style="font-size:24px;cursor: pointer;" @click="addInput(0)"></span>
        </el-form-item>
        <el-form-item
          label="篮球红人榜"
          prop="basketballWeight"
          :rules="[{required: true, message: '权重必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,1}$/, message: '整数且1-99', trigger: ['blur', 'change']}]">
          <el-checkbox v-model="form.basketballDisplay"></el-checkbox>
          <el-input
            v-model.number="form.basketballWeight"
            placeholder="1-99"
            :disabled="!form.basketballDisplay"
            style="width:60px">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            style="width:100px"
            :class="{'error': item.err}"
            v-for="(item, index) in form.basketballArr"
            :key="index"
            v-model="item.value"
            :disabled="!form.basketballDisplay"
            @blur="queryExpertInfo(1, index)">
          </el-input>
          <span v-if="form.basketballDisplay" class="el-icon-circle-plus" style="font-size:24px;cursor: pointer;" @click="addInput(1)"></span>
        </el-form-item>
        <el-form-item
          label="胜负彩红人榜"
          prop="winningColoursWeight"
          :rules="[{required: true, message: '权重必填', trigger: ['blur', 'change']},
          {pattern: /^[1-9]\d{0,1}$/, message: '整数且1-99', trigger: ['blur', 'change']}]">
          <el-checkbox v-model="form.winningColoursDisplay"></el-checkbox>
          <el-input
            v-model.number="form.winningColoursWeight"
            placeholder="1-99"
            :disabled="!form.winningColoursDisplay"
            style="width:60px">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            style="width:100px"
            :class="{'error': item.err}"
            v-for="(item, index) in form.winningColoursArr"
            :key="index"
            v-model="item.value"
            :disabled="!form.winningColoursDisplay"
            @blur="queryExpertInfo(2, index)">
          </el-input>
          <span v-if="form.winningColoursDisplay" class="el-icon-circle-plus" style="font-size:24px;cursor: pointer;" @click="addInput(2)"></span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" :loading="updateLoading" @click="submitForm('form')">保存</el-button>
        <el-button size="small" type="danger" :loading="updateLoading" v-if="!form.status" @click="submitForm('form', true)">保存并上线</el-button>
        <el-button size="small" @click="redRankPreview()">预览</el-button>
      </div>
    </el-dialog>
    <el-dialog title="预览" :visible.sync="previewVisible" width="500px" center>
      <h2 v-if="previewData" style="font-size:18px;color:#333;margin-bottom:15px;">{{previewData.title}}</h2>
      <h3 v-if="previewData" style="font-weight:normal;color:#666;margin-bottom:15px;">网易红彩 <span v-if="previewData.dateFormat">{{previewData.dateFormat}}</span><span v-else>{{[new Date(), 'MM-dd hh:mm'] | dateFormat}}</span></h3>
      <el-form label-width="140px" size="small" v-if="previewData">
        <el-form-item
          :label="item.listName"
          v-for="(item, index) in previewData.celebrityListElement"
          :key="index">
          <p v-for="(_item, _index) in item.celebrityListExpert" :key="_index">
            <img v-if="_item.avatar" :src="_item.avatar + '?imageView&thumbnail=40y40&quality=85'">
            <span>{{_item.nickname}}</span>
            <span class="text-red">{{_item.bAllRate}}</span>
          </p>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { HeadRedRank } from '../../../util/api'
import { formatDate, objSort } from '../../../util/tool'
import { uploadImg, queryExpertDetailbyId } from '../../../util/commonQuery'
import { mapState } from 'vuex'
export default {
  name: 'HeadRedRankList',
  data () {
    return {
      loading: false,
      list: [],
      pageIndex: 1,
      pageSize: 25,
      pageCount: 1,
      tableHeight: null,
      dialogFormVisible: false,
      form: {},
      updateLoading: false,
      previewData: null,
      previewVisible: false,
      popupTimesList: [
        {
          text: '不弹',
          value: 0
        },
        {
          text: '弹1次',
          value: 1
        },
        {
          text: '弹2次',
          value: 2
        }
      ]
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  created () {
    this.getList()
    this.setHeight()
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.windowHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    dateRule (rule, value, callback) {
      let _endTime = this.$refs.endTime.value
      if (!value) {
        callback(new Error('开始时间不为空'))
      } else if (!_endTime) {
        callback(new Error('结束时间不为空'))
      } else {
        callback()
      }
    },
    getList (page) {
      if (this.loading) return
      this.pageIndex = page || 1
      this.loading = true
      this.$service(HeadRedRank.list, {
        params: {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.records || []
          this.pageCount = res.data.page && res.data.page.pageCount ? res.data.page.pageCount : 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
      }, err => {
        if (err) {
          this.loading = false
          this.$message.error(JSON.stringify(err))
        }
      })
    },
    beforeImgUpload (file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error('上传图片大小不能超过 5MB!')
        return false
      }
    },
    uploadSingleImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.$set(this.form, 'imageUrl', res)
      }, err => {
        if (err) this.$message.error('上传弹窗图片失败，请稍后再传！')
      })
    },
    uploadBannerImg (data) {
      uploadImg(data.file, 'thread').then(res => {
        this.$set(this.form, 'bannerImageUrl', res)
      }, err => {
        if (err) this.$message.error('上传Banner图片失败，请稍后再传！')
      })
    },
    switchStatus (data) {
      this.$set(data, 'statusLoading', true)
      let _data = {
        celebrityListId: data.celebrityListId,
        status: data.status
      }
      this.$service(HeadRedRank.updateStatus, {
        method: 'post',
        data: _data
      }).then(res => {
        data.statusLoading = false
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$set(data, 'status', data.status ? 0 : 1)
          this.$message.error(res.message)
        }
      }, err => {
        data.statusLoading = false
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(JSON.stringify(err))
      })
    },
    redRankPop (data) {
      this.form = {
        popupTimes: 0,
        pushType: '2',
        footballDisplay: true,
        footballWeight: 60,
        footballArr: [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
        basketballDisplay: true,
        basketballWeight: 60,
        basketballArr: [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
        winningColoursDisplay: true,
        winningColoursWeight: 60,
        winningColoursArr: [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}]
      }
      if (data) {
        this.getPreview(data.celebrityListId).then(res => {
          this.form = Object.assign({}, data)
          if (!this.form.pushType) {
            this.form.pushType = '0'
          } else {
            this.form.pushType = this.form.pushType + ''
          }
          let footballArr = []
          let basketballArr = []
          let winningColoursArr = []
          res.celebrityListElement.forEach(item => {
            if (item.listType === 0) {
              item.celebrityListExpert.forEach(_item => {
                footballArr.push({
                  avatar: _item.avatar,
                  nickname: _item.nickname,
                  value: _item.userId + ',' + _item.bAllRate
                })
              })
            }
            if (item.listType === 1) {
              item.celebrityListExpert.forEach(_item => {
                basketballArr.push({
                  avatar: _item.avatar,
                  nickname: _item.nickname,
                  value: _item.userId + ',' + _item.bAllRate
                })
              })
            }
            if (item.listType === 2) {
              item.celebrityListExpert.forEach(_item => {
                winningColoursArr.push({
                  avatar: _item.avatar,
                  nickname: _item.nickname,
                  value: _item.userId + ',' + _item.bAllRate
                })
              })
            }
          })
          this.$set(this.form, 'footballArr', footballArr.length > 3 ? footballArr : [].concat(footballArr, [{value: ''}, {value: ''}, {value: ''}, {value: ''}].slice(0, 4 - footballArr.length)))
          this.$set(this.form, 'basketballArr', basketballArr.length > 3 ? basketballArr : [].concat(basketballArr, [{value: ''}, {value: ''}, {value: ''}, {value: ''}].slice(0, 4 - basketballArr.length)))
          this.$set(this.form, 'winningColoursArr', winningColoursArr.length > 3 ? winningColoursArr : [].concat(winningColoursArr, [{value: ''}, {value: ''}, {value: ''}, {value: ''}].slice(0, 4 - winningColoursArr.length)))
          this.form.footballDisplay = !!this.form.footballDisplay
          this.form.basketballDisplay = !!this.form.basketballDisplay
          this.form.winningColoursDisplay = !!this.form.winningColoursDisplay
          this.form.startDateTime = formatDate(this.form.startDateTime, 'yyyy-MM-dd hh:mm:ss')
          this.form.endDateTime = formatDate(this.form.endDateTime, 'yyyy-MM-dd hh:mm:ss')
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs.form.clearValidate()
          })
        })
      } else {
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    addInput (type) {
      switch (type) {
        case 0:
          for (let i = 0; i < 4; i++) {
            this.form.footballArr.push({value: ''})
          }
          break
        case 1:
          for (let i = 0; i < 4; i++) {
            this.form.basketballArr.push({value: ''})
          }
          break
        case 2:
          for (let i = 0; i < 4; i++) {
            this.form.winningColoursArr.push({value: ''})
          }
          break
      }
    },
    queryExpertInfo (type, i) {
      switch (type) {
        case 0:
          this.form.footballArr[i].value = this.form.footballArr[i].value.replace(/,|，/g, ',')
          if (!this.form.footballArr[i].value) {
            this.$set(this.form.footballArr[i], 'err', false)
            return
          }
          if (!/^\d+$/.test(this.form.footballArr[i].value.split(',')[0])) {
            this.$set(this.form.footballArr[i], 'err', true)
            return this.$message.error('专家格式不对')
          }
          this.$set(this.form.footballArr[i], 'err', false)
          queryExpertDetailbyId(this.form.footballArr[i].value.split(',')[0]).then(res => {
            this.$set(this.form.footballArr[i], 'nickname', res.nickname)
            this.$set(this.form.footballArr[i], 'avatar', res.avatar)
          }).catch(err => {
            if (err) {
              this.$set(this.form.footballArr[i], 'err', true)
              return this.$message.error(err)
            }
          })
          break
        case 1:
          this.form.basketballArr[i].value = this.form.basketballArr[i].value.replace(/,|，/g, ',')
          if (!this.form.basketballArr[i].value) {
            this.$set(this.form.basketballArr[i], 'err', false)
            return
          }
          if (!/^\d+$/.test(this.form.basketballArr[i].value.split(',')[0])) {
            this.$set(this.form.basketballArr[i], 'err', true)
            return this.$message.error('专家格式不对')
          }
          this.$set(this.form.basketballArr[i], 'err', false)
          queryExpertDetailbyId(this.form.basketballArr[i].value.split(',')[0]).then(res => {
            this.$set(this.form.basketballArr[i], 'nickname', res.nickname)
            this.$set(this.form.basketballArr[i], 'avatar', res.avatar)
          }).catch(err => {
            if (err) {
              this.$set(this.form.footballArr[i], 'err', true)
              return this.$message.error(err)
            }
          })
          break
        case 2:
          this.form.winningColoursArr[i].value = this.form.winningColoursArr[i].value.replace(/,|，/g, ',')
          if (!this.form.winningColoursArr[i].value) {
            this.$set(this.form.winningColoursArr[i], 'err', false)
          }
          if (!/^\d+$/.test(this.form.winningColoursArr[i].value.split(',')[0])) {
            this.$set(this.form.winningColoursArr[i], 'err', true)
            return this.$message.error('专家格式不对')
          }
          this.$set(this.form.winningColoursArr[i], 'err', false)
          queryExpertDetailbyId(this.form.winningColoursArr[i].value.split(',')[0]).then(res => {
            this.$set(this.form.winningColoursArr[i], 'nickname', res.nickname)
            this.$set(this.form.winningColoursArr[i], 'avatar', res.avatar)
          }).catch(err => {
            if (err) {
              this.$set(this.form.footballArr[i], 'err', true)
              return this.$message.error(err)
            }
          })
          break
      }
    },
    submitForm (form, type) {
      this.$refs[form].validate(valid => {
        if (valid) {
          let footballArr = []
          let basketballArr = []
          let winningColoursArr = []
          if (this.form.footballDisplay) {
            this.form.footballArr.forEach(item => {
              if (item.value) footballArr.push(item.value)
            })
          }
          if (this.form.basketballDisplay) {
            this.form.basketballArr.forEach(item => {
              if (item.value) basketballArr.push(item.value)
            })
          }
          if (this.form.winningColoursDisplay) {
            this.form.winningColoursArr.forEach(item => {
              if (item.value) winningColoursArr.push(item.value)
            })
          }
          let _data = {
            football: footballArr.join(';'),
            footballDisplay: this.form.footballDisplay ? 1 : 0,
            footballWeight: this.form.footballWeight,
            basketball: basketballArr.join(';'),
            basketballDisplay: this.form.basketballDisplay ? 1 : 0,
            basketballWeight: this.form.basketballWeight,
            winningColours: winningColoursArr.join(';'),
            winningColoursDisplay: this.form.winningColoursDisplay ? 1 : 0,
            winningColoursWeight: this.form.winningColoursWeight,
            endDateTime: this.form.endDateTime,
            startDateTime: this.form.startDateTime,
            title: this.form.title,
            status: type || this.form.status ? 1 : 0,
            pushType: this.form.pushType,
            popupTimes: this.form.popupTimes
          }
          if (this.form.imageUrl) {
            _data['imageUrl'] = this.form.imageUrl
          }
          if (this.form.bannerImageUrl) {
            _data['bannerImageUrl'] = this.form.bannerImageUrl
          }
          if (this.form.celebrityListId) {
            _data['celebrityListId'] = this.form.celebrityListId
          }
          if (this.updateLoading) return
          this.updateLoading = true
          this.$service(this.form.celebrityListId ? HeadRedRank.update : HeadRedRank.add, {
            method: 'post',
            data: _data
          }).then(res => {
            this.updateLoading = false
            if (res.code === 200) {
              this.dialogFormVisible = false
              if (!this.form.celebrityListId) this.pageIndex = 1
              this.$message.success(this.form.celebrityListId ? '更新成功' : '新增成功')
              this.getList(this.pageIndex)
            } else {
              this.$message.error(res.code === 2100010 ? '该弹框展示时间段与已上线弹框时间段冲突，请重新调整。可以先保存本次配置，修改已上线弹框后再进行上线' : res.message)
            }
          }, err => {
            if (err) {
              this.updateLoading = false
              this.$message.error(JSON.stringify(err))
            }
          })
        }
      })
    },
    redRankPreview (data) {
      if (data) {
        if (data.loading) return
        this.$set(data, 'loading', true)
        this.getPreview(data.celebrityListId).then(res => {
          data.loading = false
          this.previewData = res
          this.previewVisible = true
        }, err => {
          data.loading = false
          this.$message.error(err)
        })
      } else {
        this.previewData = {
          title: this.form.title,
          dateFormat: formatDate(this.form.updateTime || new Date(), 'MM-dd hh:mm'),
          celebrityListElement: []
        }
        let weightType = [
          {
            type: 1,
            weight: this.form.footballWeight,
            data: this.form.footballArr,
            name: '足球红人榜',
            show: this.form.footballDisplay
          },
          {
            type: 2,
            weight: this.form.basketballWeight,
            data: this.form.basketballArr,
            name: '篮球红人榜',
            show: this.form.basketballDisplay
          },
          {
            type: 3,
            weight: this.form.winningColoursWeight,
            data: this.form.winningColoursArr,
            name: '胜负彩红人榜',
            show: this.form.winningColoursDisplay
          }
        ]
        weightType.sort(objSort('weight', true))
        weightType.forEach(item => {
          if (item.show) {
            let _arr = []
            item.data.forEach(_item => {
              if (_item.value) {
                _arr.push({
                  avatar: _item.avatar,
                  nickname: _item.nickname,
                  bAllRate: _item.value.split(',')[1]
                })
              }
            })
            if (_arr.length > 0) {
              this.previewData.celebrityListElement.push({
                listName: item.name,
                celebrityListExpert: _arr
              })
            }
          }
        })
        this.previewVisible = true
      }
    },
    getPreview (id) {
      return this.$service(HeadRedRank.preview, {
        params: {
          celebrityListId: id
        }
      }).then(res => {
        if (res.code === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      }, err => {
        if (err) {
          return Promise.reject(JSON.stringify(err))
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

<style lang="scss">
.error input.el-input__inner {
  border: 1px solid #e62121;
}
</style>
