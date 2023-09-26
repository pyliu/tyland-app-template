<template lang="pug">
.items.d-flex.justify-content-between.flex-wrap
  .item
    .name Nuxt.js:
    .value {{ nuxt }}
  .item
    .name Vue.js:
    .value {{ vue }}
  .item
    .name Electron:
    .value {{ electron }}
  .item
    .name Node:
    .value {{ node }}
  .item
    .name Chrome:
    .value {{ chrome }}
  .item
    .name Platform:
    .value {{ platform }}
</template>

<script>
export default {
  data () {
    return {
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      node: process.versions.node,
      platform: require('os').platform(),
      vue: require('vue/package.json').version,
      nuxt: require('nuxt/package.json').version
    }
  }
}
</script>

<style lang="scss" scoped>
.items {
  margin-top: 8px;
  .item {
    display: flex;
    margin: 0 6px 6px 0;
    .name {
      color: #6a6a6a;
      margin-right: 6px;
    }
    .value {
      color: #364758;
      font-weight: bold;
    }
  }
}
</style>
