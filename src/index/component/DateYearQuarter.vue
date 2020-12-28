<template>
  <el-popover
    placement="bottom-start"
    trigger="click"
    v-model="visible">
    <div class="date-year-quarter-wrapper">
      <div class="date-header-wrapper">
        <i class="el-icon-d-arrow-left" @click="yearDown"></i>
        <span @click="chooseType" v-if="type==='quarter'">{{year}}年</span>
        <span v-else>{{firstYear}}年 - {{firstYear + 9}}年</span>
        <i
          :class="{'el-icon-d-arrow-right': true, 'disable': type==='quarter' ? year >= disableYear : firstYear + 10 > disableYear}"
          @click="yearUp">
        </i>
      </div>
      <div class="date-quarter-wrapper" v-if="type==='quarter'">
        <li
          :class="{'disable': year >= disableYear && item >= disableQuarter}"
          v-for="item in 4"
          :key="item" @click="chooseQuarter(item)">
          第{{quarter[item]}}季度
        </li>
      </div>
      <div class="date-year-wrapper" v-else>
        <li
          :class="{'disable': firstYear + item - 1 > disableYear}"
          v-for="item in 10"
          :key="item"
          @click="chooseYear(firstYear + item - 1)">
          {{firstYear + item - 1}}年
        </li>
      </div>
    </div>
    <el-input slot="reference" v-model="time" prefix-icon="el-icon-date" placeholder="请选择季度"></el-input>
  </el-popover>
</template>

<script>
export default {
  name: 'DateYearQuarter',
  props: {
    value: {
      type: 'String',
      default: null
    }
  },
  data () {
    return {
      time: null,
      visible: false,
      year: new Date().getFullYear(),
      disableYear: new Date().getFullYear(),
      disableQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
      firstYear: null,
      quarter: {
        1: '一',
        2: '二',
        3: '三',
        4: '四'
      },
      type: 'quarter'
    }
  },
  methods: {
    yearDown () {
      if (this.type === 'quarter') {
        this.year--
      } else {
        this.firstYear = this.firstYear <= 100 ? 2000 : this.firstYear - 10
      }
    },
    yearUp () {
      if (this.type === 'quarter') {
        if (this.year >= this.disableYear) return
        this.year++
      } else {
        if (this.firstYear + 10 > this.disableYear) return
        this.firstYear = this.firstYear + 10
      }
    },
    chooseType () {
      this.type = 'year'
      this.firstYear = this.year - this.year % 10
    },
    chooseYear (i) {
      if (i > this.disableYear) return
      this.type = 'quarter'
      this.year = i
    },
    chooseQuarter (i) {
      if (this.year >= this.disableYear && i >= this.disableQuarter) return
      this.$emit('input', this.year + '-' + i)
      this.visible = false
    }
  },
  watch: {
    value (val) {
      if (val && val.split('-')) {
        const _time = val.split('-')
        this.time = `${_time[0]}年第${this.quarter[_time[1]]}季度`
      } else {
        this.time = null
      }
    },
    visible (val) {
      if (val) {
        this.type = 'quarter'
      }
    }
  }
}
</script>

<style lang="scss">
.date-year-quarter-wrapper {
  .date-header-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 10px;
    span {
      font-size: 16px;
      font-weight: 500;
      padding: 0 5px;
      line-height: 24px;
      text-align: center;
      cursor: pointer;
      color: #606266;
      &:hover {
        color: #e62121;
      }
    }
    i {
      cursor: pointer;
      &:hover {
        color: #e62121;
      }
      &.disable {
        cursor: not-allowed;
        color: #c0c4cc;
        &:hover {
          color: #c0c4cc;
        }
      }
    }
  }
  .date-quarter-wrapper, .date-year-wrapper {
    padding: 15px 0 0;
    li {
      font-size: 12px;
      display: inline-block;
      width: 50%;
      line-height: 36px;
      text-align: center;
      cursor: pointer;
      &:hover {
        color: #e62121;
      }
      &.disable {
        background-color: #f5f7fa;
        cursor: not-allowed;
        color: #c0c4cc;
        &:hover {
          color: #c0c4cc;
        }
      }
    }
  }
  .date-year-wrapper {
    li {
      width: 25%
    }
  }
}
</style>
