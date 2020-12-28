<template>
  <div class="match-list">
    <div class="nav-tools">
      <div class="nav">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in $route.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-row :gutter="10" style="margin-bottom:10px;font-size:16px;text-align:center;">
      <el-col span="12">旧数据商(sportsDT)</el-col>
      <el-col span="12">新数据商(纳米)</el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col span="12" :style="`border-right: ${index===0 ? 1 : 0}px solid #ccc`" v-for="(item, index) in dataObj" :key="index">
        <el-form
          :inline="true"
          :model="item.form"
          size="mini"
          :disabled="item.loading">
          <el-form-item label="类型">
            <el-select style="width: 90px;" @change="getLeagueList(index)" v-model="item.form.sportType">
              <el-option label="足球" value="1"></el-option>
              <el-option label="篮球" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-select style="width: 90px;" @change="getLeagueList(index)" v-model="item.form.jcType">
              <el-option label="全部" value="0">全部</el-option>
              <el-option label="竞彩" value="1"></el-option>
              <el-option label="北单" value="2"></el-option>
              <el-option label="其他" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="匹配">
            <el-select style="width: 90px;" @change="getLeagueList(index)" v-model="item.form.mapStatus">
              <el-option label="未匹配" value="0"></el-option>
              <el-option label="匹配" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="联赛">
            <el-select v-model="item.form.leagueMatchId">
              <el-option label="全部" value="0">全部</el-option>
              <el-option
                v-for="_item in item.league"
                :label="_item.leagueMatchName"
                :value="_item.leagueMatchId"
                :key="_item.leagueMatchId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-date-picker
              v-model="item.form.matchTime"
              type="datetime"
              editable="false"
              placeholder="选择日期时间"
              style="width: 190px;"
              value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" @click="getMatchList(index)">筛选</el-button>
          </el-form-item>
        </el-form>
        <el-table
          :ref="'table' + index"
          :data="item.list"
          v-loading="item.loading"
          stripe
          :max-height="item.height < 400 ? 400 : item.height">
          <el-table-column
            prop="id"
            label="赛事id"
            width="80">
          </el-table-column>
          <el-table-column
            label="赛事对阵"
            min-width="140">
            <template slot-scope="scope">
              <p>{{item.filter.sportType === '1' ? scope.row.homeTeam.nameZh + ' VS ' + scope.row.awayTeam.nameZh : scope.row.awayTeam.nameZh + ' vs ' + scope.row.homeTeam.nameZh}}</p>
              <p>{{item.filter.sportType === '1' ? scope.row.homeTeam.nameEn + ' VS ' + scope.row.awayTeam.nameEn : scope.row.awayTeam.nameEn + ' vs ' + scope.row.homeTeam.nameEn}}</p>
            </template>
          </el-table-column>
          <el-table-column
            prop="matchTime"
            label="时间">
            <template slot-scope="scope">
              {{[scope.row.matchTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column
            prop="leagueMatchName"
            label="联赛"
            min-width="120"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="jcStatus"
            label="类型"
            width="60">
            <template slot-scope="scope">
              {{{1: '竞猜', 2: '北单', 3: '其他'}[scope.row.jcStatus] || '-'}}
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            :label="index === 0 ? '新ID匹配' : '匹配情况'">
            <template slot-scope="scope">
              <p v-if="index === 0 && !scope.row.mapId">
                <el-input
                  v-model="scope.row.input"
                  placeholder="填写新ID"
                  size="mini">
                </el-input>
              </p>
              <p v-if="index === 0 && scope.row.mapId">
                {{scope.row.mapId}}
              </p>
              <p v-if="index === 0">
                <el-button
                  v-if="!scope.row.mapId"
                  type="primary"
                  size="mini"
                  @click="bindingMatch(scope.row)">
                  匹配
                </el-button>
                <el-button
                  v-if="scope.row.mapId"
                  type="primary"
                  size="mini"
                  @click="unbindingMatch(scope.row)">
                  解绑
                </el-button>
              </p>
              <p v-if="index === 1">{{!scope.row.mapId ? '未匹配' : `已匹配(${scope.row.mapId})`}}</p>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          size="mini"
          layout="prev, pager, next"
          @current-change="item.pageChange"
          :current-page.sync="Math.floor(offset[index] / limit) + 1"
          :total="item.total"
          :page-size="limit"
          class="page-bar-reset">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { MatchBinding } from '../../../util/api'
import { mapState } from 'vuex'
export default {
  name: 'MatchBinding',
  data () {
    return {
      dataObj: [
        {
          loading: false,
          filter: {
            sportType: '1'
          },
          form: {
            sportType: '1',
            jcType: '0',
            mapStatus: '0',
            leagueMatchId: '0',
            matchTime: ''
          },
          league: [],
          list: [],
          height: null,
          total: 1,
          pageChange: this.oldPage
        },
        {
          loading: false,
          filter: {
            sportType: '1'
          },
          form: {
            sportType: '1',
            jcType: '0',
            mapStatus: '0',
            leagueMatchId: '0',
            matchTime: ''
          },
          league: [],
          list: [],
          height: null,
          total: 1,
          pageChange: this.newPage
        }
      ],
      limit: 25,
      offset: {
        0: 0,
        1: 0
      }
    }
  },
  computed: {
    ...mapState(['windowHeight'])
  },
  mounted () {
    this.setHeight()
    this.getLeagueList(0)
    this.getLeagueList(1)
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.dataObj[0].height = this.windowHeight - this.getOffsetTop(this.$refs.table0[0].$el) - 63
        this.dataObj[1].height = this.windowHeight - this.getOffsetTop(this.$refs.table1[0].$el) - 63
      })
    },
    getOffsetTop (el) {
      let $elem = el
      let top = $elem.offsetTop
      while (($elem = $elem.offsetParent)) {
        top += $elem.offsetTop
        top -= $elem.scrollTop
      }
      return top
    },
    /**
     * @description: 获取赛事列表
     * @param {String} type 0 为旧数据商， 1 为新数据商
     */
    getMatchList (type, page) {
      let _data = Object.assign({}, this.dataObj[type].form)
      Object.keys(_data).forEach(key => {
        if (!_data[key]) {
          delete _data[key]
        }
      })
      if (this.dataObj[type].loading) return
      this.dataObj[type].loading = true
      this.dataObj[type].filter = _data
      this.offset[type] = page ? (page - 1) * this.limit : 0
      this.$service(type ? MatchBinding.newList : MatchBinding.oldList, {
        params: Object.assign(_data, {
          offset: this.offset[type],
          limit: this.limit
        })
      }).then(res => {
        if (res.code === 200) {
          this.dataObj[type].list = res.data.data || []
          this.dataObj[type].total = res.data.total || 1
          this.$refs['table' + type][0].bodyWrapper.scrollTop = 0
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        this.dataObj[type].loading = false
      }).catch(err => {
        if (err) {
          this.dataObj[type].loading = false
          err && this.$message.error(JSON.stringify(err))
        }
      })
    },
    getLeagueList (type) {
      const _data = {
        sportType: this.dataObj[type].form.sportType,
        jcType: this.dataObj[type].form.jcType,
        mapStatus: this.dataObj[type].form.mapStatus
      }
      this.$service(type ? MatchBinding.newLeagueList : MatchBinding.oldLeagueList, {
        params: _data
      }).then(res => {
        if (res.code === 200) {
          this.dataObj[type].league = res.data || []
        }
      })
    },
    oldPage (page) {
      this.getMatchList(0, page)
    },
    newPage (page) {
      this.getMatchList(1, page)
    },
    bindingMatch (data) {
      const newId = data.input
      if (!newId) return this.$message.error('新赛事ID不为空')
      if (!/^\d+$/.test(newId)) return this.$message.error('新赛事ID必须全部为数字')
      if (data.loading) return
      this.$set(data, 'loading', false)
      this.$service(MatchBinding.bindById, {
        params: {
          matchInfoId: data.id,
          nanoMatchId: newId
        }
      }).then(res => {
        if (res.code === 200) {
          data.mapId = newId
          this.$message.success('绑定成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        data.loading = false
      }).catch(err => {
        if (err) {
          data.loading = false
          err && this.$message.error(JSON.stringify(err))
        }
      })
    },
    unbindingMatch (data) {
      if (data.loading) return
      this.$set(data, 'loading', false)
      this.$service(MatchBinding.unbindById, {
        params: {
          nanoMatchId: data.mapId
        }
      }).then(res => {
        if (res.code === 200) {
          data.mapId = null
          this.$message.success('解绑成功')
        } else {
          this.$message.error(res.code + ':' + res.message)
        }
        data.loading = false
      }).catch(err => {
        if (err) {
          data.loading = false
          err && this.$message.error(JSON.stringify(err))
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
