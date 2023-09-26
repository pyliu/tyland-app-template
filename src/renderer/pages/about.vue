<template lang="pug">
#app
  img.mt-2.img-fluid(src="~/assets/electron-nuxt.png")
  .my-2: el-button(@click="startHacking") 開始
  b-container.fixed-bottom: system-information
</template>

<script>
export default {
  name: 'AboutPage',
  components: {},
  data () {
    return {
      externalContent: ''
    }
  },
  methods: {
    openURL (url) {
      window.open(url)
    },
    startHacking () {
      this.$notify({
        title: '這是警告',
        type: 'warning',
        message: '警告訊息通知測試!',
        duration: 5000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}
.fixed-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
}
</style>
  