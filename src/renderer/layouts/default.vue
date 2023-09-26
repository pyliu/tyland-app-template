<template lang="pug">
div
  app-header
  b-container
    nuxt
</template>

<script>
import appHeader from '@/components/header';

export default {
  name: 'DefaultLayout',
  components: { appHeader }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
