<template lang="pug">
.container
  img(src="/nuxt.png")
  h2 Hello Nuxtron.
  p Loaded from the {{ name }}
  p
    nuxt-link(to="/about") About
</template>

<script>
export default {
  asyncData ({ req }) {
    return {
      name: process.static ? 'static' : (process.server ? 'server' : 'client'),
    }
  }
}
</script>

<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: white;
  color: black;
  font-family: "Lucida Console", Monaco, monospace;
  padding-top: 100px;
  text-align: center;
}
a {
  color: black;
}
</style>
