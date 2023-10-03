<template lang="pug">
#app
  img.img-fluid(src="~/assets/monitoring.jpg")
  .my-2: el-button(@click="startHacking") 開始
</template>

<script>
export default {
  name: 'IndexPage',
  components: {},
  data: () =>({}),
  mounted () {

  },
  methods: {
    openURL (url) {
      window.open(url)
    },
    startHacking () {
      // invoke to main process
      const { ipcRenderer } = require('electron')
      ipcRenderer.invoke('command', {
        type: 'version'
      }).then(msg => console.log(msg))

      this.$notify({
        title: '這是標題',
        type: 'success',
        message: '訊息通知測試!',
        duration: 5000
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}
</style>
  