<template lang="pug">
div
  app-header
  nuxt.full-h
</template>

<script>
import appHeader from '@/components/header';

export default {
  name: 'DefaultLayout',
  components: { appHeader }
}
</script>

<style lang="scss" scoped>
body {
  margin: 0 !important;
}
.full-h {
  height: calc(100vh - 60px);
}
</style>
