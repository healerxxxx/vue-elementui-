<template>
  <div class="cps-order-export">
    <el-form :inline="true" :model="filter" size="mini" :disabled="loading">
      <el-form-item label="时间">
        <el-date-picker
          v-model="filter.time"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          style="width:240px"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now()
          }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="">
        <el-button size="mini" type="primary" @click="exportList()">导出</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { StatisticsConsumer } from '../../../../util/api'
export default {
  name: 'CPSOrderExpert',
  data () {
    return {
      filter: {}
    }
  },
  methods: {
    exportList () {
      if (!this.filter.time) return this.$message.warning('请选择具体的时间范围')
      let _data = {}
      if (this.filter.time) {
        _data['startTime'] = this.filter.time[0] + ' 00:00:00'
        _data['endTime'] = this.filter.time[1] + ' 23:59:59'
      }
      let _arr = []
      Object.keys(_data).forEach(item => {
        _arr.push(item + '=' + _data[item])
      })
      window.open(window.location.origin + StatisticsConsumer[0].cpsOrder.export + '?' + _arr.join('&'))
    }
  }
}
</script>
