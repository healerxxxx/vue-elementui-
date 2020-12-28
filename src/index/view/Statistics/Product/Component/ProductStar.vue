<template>
  <div class="product-star">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.startTime"
          type="date"
          editable="false"
          min-width="100"
          placeholder="开始日期"
          value-format="yyyy-MM-dd 00:00:00"
          @change="getFilterList"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.endTime).getTime() !== 0 && time.getTime() > new Date(filter.endTime).getTime())
          }}">
        </el-date-picker>
        ~
        <el-date-picker
          v-model="filter.endTime"
          type="date"
          editable="false"
          placeholder="结束日期"
          value-format="yyyy-MM-dd 23:59:59"
          @change="getFilterList"
          style="width:135px"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now() || (new Date(filter.startTime).getTime() !== 0 && time.getTime() < new Date(filter.startTime).getTime())
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getList(),getCount()">查询</el-button>
      </el-form-item>
      <el-form-item label="" v-if="count">
        总命中率：<b>{{count.totalHit?count.totalHit+'%':'-'}}</b>；
        总盈利率：<b>{{count.totalEarningsRate | toPercent}}</b>；
        近3天：<b>{{count.threeDayHitStr || '-'}}</b>；
        近5天：<b>{{count.fiveDayHitStr || '-'}}</b>；
        近7天：<b>{{count.sevenDayHitStr || '-'}}</b>
      </el-form-item>
    </el-form>
    <el-table
      ref="elTable"
      :data="list"
      v-loading="loading"
      stripe
      style="width: 100%"
      :max-height="tableHeight<400?400:tableHeight">
      <el-table-column
        prop="matchInfoId"
        label="比赛ID"
        min-width="140">
      </el-table-column>
      <el-table-column
        prop="leagueMatch"
        label="联赛"
        min-width="130">
      </el-table-column>
      <el-table-column
        label="对阵"
        min-width="150">
        <template slot-scope="scope">
          {{scope.row.homeName+' VS '+scope.row.guestName}}
        </template>
      </el-table-column>
      <el-table-column
        label="信心"
        min-width="170">
        <template slot-scope="scope">
          {{'★★★★★☆☆☆☆☆'.slice(5-scope.row.star, 10-scope.row.star)}}
        </template>
      </el-table-column>
      <el-table-column
        label="比赛时间"
        min-width="120">
        <template slot-scope="scope">
          {{scope.row.matchTime}}
        </template>
      </el-table-column>
      <el-table-column
        prop="matchStatus"
        label="状态"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.matchStatus | matchStatus2CH}}
        </template>
      </el-table-column>
      <el-table-column
        label="比分"
        min-width="70">
        <template slot-scope="scope">
          {{scope.row.matchStatus===2||scope.row.matchStatus===3?scope.row.homeScore+' - '+scope.row.guestScore:'-'}}
        </template>
      </el-table-column>
      <el-table-column
        label="推荐"
        min-width="80">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            width="300"
            trigger="click">
            <div class="starInfo" v-loading="starLoading">
              <div class="item" v-for="(item,index) in starInfo" :key="index">
                <h2>{{item.name}}<span>{{item.date}}</span></h2>
                <div class="item-odds" v-for="(_item, _index) in item.handicapInfoList" :key="_index">
                  <li class="area">
                    {{_item.area===1?'亚盘':'欧赔'}}
                    <span class="red" v-if="_item.hitStatus===1">已中</span>
                    <span class="blue" v-if="_item.hitStatus===3">走盘</span>
                    <span class="black" v-if="_item.hitStatus===2">未中</span>
                  </li>
                  <li :class="{'check':_item.modelRecommend & 1, 'hit': _item.hits & 1}">
                    <span>主赔</span><span>{{_item.winsOdds}}</span>
                  </li>
                  <li v-if="_item.area===1">让 {{_item.concede}}</li>
                  <li v-if="_item.area===2" :class="{'check':_item.modelRecommend & 2, 'hit': _item.hits & 2}">
                    <span>平</span><span>{{_item.drawsOdds}}</span>
                  </li>
                  <li :class="{'check':_item.modelRecommend & 4, 'hit': _item.hits & 4}">
                    <span>客赔</span><span>{{_item.lossesOdds}}</span>
                  </li>
                </div>
              </div>
              <div v-if="!starLoading&&starInfo.length===0">没有数据</div>
            </div>
            <el-button slot="reference" type="text" @click.native="getStarById(scope.row.matchInfoId)">详情>></el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="结果"
        min-width="70">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.matchStatus===3" :color="scope.row.isWin===1?'#e62121':'#333'" style="color:#fff">&nbsp;&nbsp;&nbsp;</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="getList"
      :current-page.sync="Math.floor(offset/limit) + 1"
      :total="total"
      :page-size="limit"
      class="page-bar-reset">
    </el-pagination>
  </div>
</template>

<script>
import { StatisticsProduct } from '../../../../util/api'
export default {
  name: 'productStar',
  props: {
    visible: {
      type: 'Boolean',
      default: false
    },
    screenHeight: {
      type: 'Number'
    }
  },
  data () {
    return {
      filter: {
        startTime: '',
        endTime: ''
      },
      list: [],
      offset: 1,
      limit: 25,
      total: 1,
      loading: false,
      tableHeight: null,
      count: null,
      starInfo: [],
      starLoading: false

    }
  },
  mounted () {
    if (this.visible) {
      this.getList()
      this.setHeight()
      this.getCount()
    }
  },
  methods: {
    setHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.screenHeight - this.$refs.elTable.$el.offsetTop - 63
      })
    },
    getList (page) {
      if (this.loading) return
      this.loading = true
      this.offset = page ? (page - 1) * this.limit : 0
      let _data = {}
      if (this.filter.startTime) {
        _data['startTime'] = this.filter.startTime
      }
      if (this.filter.endTime) {
        _data['endTime'] = this.filter.endTime
      }
      this.$service(StatisticsProduct.starList, {
        urlParams: {
          offset: this.offset,
          limit: this.limit
        },
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data.data || []
          this.total = res.data.total || 1
          this.$refs.elTable.bodyWrapper.scrollTop = 0
          this.setHeight()
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
    getCount () {
      let _data = {}
      if (this.filter.startTime) {
        _data['startTime'] = this.filter.startTime
      }
      if (this.filter.endTime) {
        _data['endTime'] = this.filter.endTime
      }
      this.$service(StatisticsProduct.starCount, {
        params: _data
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.count = res.data
        }
      })
    },
    getStarById (id) {
      this.starInfo = []
      this.starLoading = true
      this.$service(StatisticsProduct.starById, {
        urlParams: {
          matchInfoId: id
        }
      }).then(res => {
        this.starLoading = false
        if (res.code === 200) {
          this.starInfo = res.data
        }
      }, err => {
        if (err) {
          this.starLoading = false
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val && this.list.length === 0) {
        this.getList()
        this.setHeight()
        this.getCount()
      }
    },
    screenHeight (val) {
      if (val) this.setHeight()
    }
  }
}
</script>

<style lang="scss">
.starInfo {
  .item{
    h2{
      font-weight:normal;
      line-height: 2.5;
      span{
        float: right;
      }
    }
  }
  .item-odds{
    margin-bottom:10px;
    overflow: hidden;
    li{
      width: 70px;
      float: left;
      list-style:none;
      padding: 6px 0;
      text-align: center;
      line-height: 40px;
      position: relative;
      overflow: hidden;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      border: 1px solid #d9d9d9;
      border-right: none;
      .red,.blue,.black{
        display: block;
        position: absolute;
        right: -24px;
        top:-24px;
        width: 48px;
        padding-top:32px;
        text-align: center;
        content: '';
        color: #fff;
        line-height: 16px;
        font-size:12px;
        z-index: 1;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
      .red{
        background: #e62121;
      }
      .blue{
        background: #02a2de;
      }
      .black{
        background: #000;
      }
      &:last-child{
        border-right: 1px solid #d9d9d9;
      }
      span{
        display: block;
        line-height: 20px;
      }
      &.area{
        margin-right:20px;
        border-right: 1px solid #d9d9d9;
      }
      &.check{
        background: #aaa;
        color: #fff;
      }
      &.hit:after{
        position: absolute;
        top:2px;
        right: 2px;
        content: '√';
        font-family: Arial, Helvetica, sans-serif;
        width:20px;
        height: 20px;
        background: #e62121;
        border-radius: 100%;
        -webkit-border-radius: 100%;
        text-align: center;
        line-height: 20px;
        font-size:12px;
        color: #fff;
        z-index: 1;
      }
    }
    &:last-child{
      margin-bottom: 0;
    }
  }
}
</style>
