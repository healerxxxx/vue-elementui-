<template>
  <el-popover
    v-if="info.menuType === 16"
    placement="left"
    width="480"
    trigger="click">
    <el-table
      stripe
      v-loading="loading"
      :data="list"
      max-height="300">
      <el-table-column
        prop="channel"
        width="100"
        label="渠道名">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="60">
        <template slot-scope="scope">
          {{scope.row.status ? '关' : '开'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="operator"
        label="操作者"
        width="80">
        <template slot-scope="scope">
          {{/@/gi.test(scope.row.operator) ? scope.row.operator.split('@')[0] : scope.row.operator}}
        </template>
      </el-table-column>
      <el-table-column
        prop="loginTime"
        label="更新时间"
        width="160">
        <template slot-scope="scope">
          {{[scope.row.updateTime, 'yyyy-MM-dd hh:mm:ss'] | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="操作"
        width="80">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :disabled="scope.row.statusLoading"
            :active-value="0"
            :inactive-value="1"
            @click.native="switchStatus(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="text" slot="reference" @click="getList()">列表</el-button>
  </el-popover>
</template>

<script>
export default {
  name: 'channel-switch',
  props: ['info', 'api'],
  data () {
    return {
      list: [],
      loading: false
    }
  },
  methods: {
    getList () {
      if (this.loading || this.list.length > 0) return
      this.loading = true
      this.$service(this.api.channelList, {
        params: {
          version: this.info.version
        }
      }).then(res => {
        if (res.code === 200) {
          this.list = res.data
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        this.$message.error(JSON.stringify(err))
      }).finally(() => {
        this.loading = false
      })
    },
    switchStatus (data) {
      this.$set(data, 'loading', true)
      let _data = {
        switchControlId: data.switchControlId,
        status: data.status
      }
      this.$service(this.api.channelUpdate, {
        method: 'post',
        data: _data
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          this.$message.error(res.message)
        }
      }).catch((err) => {
        this.$set(data, 'status', data.status ? 0 : 1)
        this.$message.error(err.code ? err.code + ':' + err.message : JSON.stringify(err))
      }).finally(() => {
        data.loading = false
      })
    }
  }
}
</script>
