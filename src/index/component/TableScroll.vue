<template>
  <div class="table-scroll">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'tableScroll'
}
</script>

<style lang="scss">
.table-scroll {
  overflow-x: auto;
}
</style>
