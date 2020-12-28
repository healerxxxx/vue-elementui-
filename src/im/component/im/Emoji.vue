<template>
  <div class="imoji-wrapper" v-if="visible" :style="{'margin-left': - column * 20 + 'px'}">
    <div class="imoji-content" :style="{'height': row * 40 + 'px', 'width': column * 40 + 'px'}">
      <li v-for="(item, index) in renderList" :key="index">
        <span @click="$emit('click', item.code)">{{item.code}}</span>
      </li>
    </div>
    <div class="imoji-dot" v-if="size < total">
      <i
        v-for="i in Math.ceil(total/size)"
        :key="i"
        :class="{'current': i === current}"
        @click="pageChange(i)">
      </i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Emoji',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    column: {
      type: Number,
      default: 8
    },
    row: {
      type: Number,
      default: 5
    }
  },
  data () {
    return {
      list: [
        { code: '😁' },
        { code: '😂' },
        { code: '😃' },
        { code: '😄' },
        { code: '😅' },
        { code: '😆' },
        { code: '😉' },
        { code: '😊' },
        { code: '😋' },
        { code: '😌' },
        { code: '😍' },
        { code: '😏' },
        { code: '😒' },
        { code: '😓' },
        { code: '😔' },
        { code: '😖' },
        { code: '😘' },
        { code: '😚' },
        { code: '😜' },
        { code: '😝' },
        { code: '😞' },
        { code: '😠' },
        { code: '😡' },
        { code: '😢' },
        { code: '😣' },
        { code: '😤' },
        { code: '😥' },
        { code: '😨' },
        { code: '😩' },
        { code: '😪' },
        { code: '😫' },
        { code: '😭' },
        { code: '😰' },
        { code: '😱' },
        { code: '😲' },
        { code: '😳' },
        { code: '😵' },
        { code: '😷' },
        { code: '😸' },
        { code: '😹' },
        { code: '😺' },
        { code: '😻' },
        { code: '😼' },
        { code: '😽' },
        { code: '😾' },
        { code: '😿' },
        { code: '🙀' },
        { code: '🙅' },
        { code: '🙆' },
        { code: '🙇' },
        { code: '🙈' },
        { code: '🙉' },
        { code: '🙊' },
        { code: '🙋' },
        { code: '🙌' },
        { code: '🙍' },
        { code: '🙎' },
        { code: '🙏' }
      ],
      current: 1
    }
  },
  computed: {
    total () {
      return this.list.length
    },
    size () {
      return this.row * this.column
    },
    renderList () {
      return this.list.slice((this.current - 1) * this.size, this.current * this.size)
    },
    visible: {
      get () {
        return this.value
      },
      set (newVal) {
        this.$emit('input', newVal)
      }
    }
  },
  methods: {
    pageChange (i) {
      if (i !== this.current) {
        this.current = i
      }
    }
  }
}
</script>

<style lang="scss">
.imoji-wrapper {
  position: absolute;
  left: 50%;
  bottom: 100%;
  margin-bottom: 10px;
  z-index: 10;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0px 0px 2px 0px #5E5E5E;
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 100%;
    width: 0;
    height: 0;
    margin-left: -8px;
    border-top: 8px solid #fff;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    z-index: 2;
  }
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 100%;
    width: 0;
    height: 0;
    margin-left: -8px;
    margin-top: 1px;
    border-top: 8px solid #b5b5b5;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    z-index: 1;
  }
  .imoji-content {
    font-size: 0;
    li {
      width: 40px;
      height: 40px;
      display: inline-block;
      line-height: 40px;
      text-align: center;
      margin: 0;
      span {
        font-size: 24px;
      }
    }
  }
  .imoji-dot {
    padding: 6px 0 10px;
    height: 12px;
    line-height: 12px;
    text-align: center;
    font-size: 0;
    i {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 100%;
      background: #eee;
      &.current {
        background: #0efa0e;
      }
    }
    i + i {
      margin-left: 12px;
    }
  }
}
</style>
