<template lang="pug">
b-card
  b-card-title 訊息
  div(v-for="(message, idx) in messages") {{ idx }}
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  asyncData ({ req }) {
    return {
      name: process.static ? 'static' : (process.server ? 'server' : 'client'),
    }
  },
  computed: {
    messages () {
      return this.$store.getters.messages
    }
  },
  created () {
    this.ipcRendererSetup();
  },
  mounted () {
    console.warn(this.messages);
  },
  methods: {
    ipcRendererSetup() {
      this.ipcRenderer = ipcRenderer;
      console.warn('ipcRenderer', this.ipcRenderer);
      // register main process quit event listener (To send leave channel message after user closed the app)
      this.ipcRenderer?.on("add-message", (event, msg) => console.log(event, msg));
    },
  }
}
</script>

<style scoped>
</style>
