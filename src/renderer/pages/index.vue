<template lang="pug">
.e-nuxt-container
  .e-nuxt-content
    .e-nuxt-logo
      img(style='max-width: 100%;' src='~assets/electron-nuxt.png')
    .e-nuxt-system-info
      system-information.
        
        
  .e-nuxt-links
    .e-nuxt-button(@click='openURL(\'https://github.com/michalzaq12/electron-nuxt\')').
      
      Github
      
    .e-nuxt-button(@click='openURL(\'https://nuxtjs.org/guide\')').
      
      Nuxt.js
      
    .e-nuxt-button(@click='openURL(\'https://electronjs.org/docs\')').
      
      Electron.js
      
</template>

<script>
import SystemInformation from '@/components/SystemInformation.vue';

export default {
  name: 'IndexPage',
  components: {
    SystemInformation
  },
  data () {
    return {
      externalContent: ''
    }
  },
  methods: {
    openURL (url) {
      window.open(url)
    }
  }
}
</script>

<style>
.e-nuxt-container {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to right, #ece9e6, #ffffff);
  font-family: Helvetica, sans-serif;
}

.e-nuxt-content {
  display: flex;
  justify-content: space-around;
  padding-top: 100px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.e-nuxt-logo{
  width: 400px;
}

.e-nuxt-system-info {
  padding: 20px;
  border-top: 1px solid #397c6d;
  border-bottom: 1px solid #397c6d;
}

.e-nuxt-links {
  padding: 100px 0;
  display: flex;
  justify-content: center;
}

.e-nuxt-button {
  color: #364758;
  padding: 5px 20px;
  border: 1px solid #397c6d;
  margin: 0 20px;
  border-radius: 15px;
  font-size: 1rem;
}

.e-nuxt-button:hover{
  cursor: pointer;
  color: white;
  background-color: #397c6d;
}
</style>
