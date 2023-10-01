<template lang="pug">
header.main-header
  nav
    div
      nuxt-link(to="/", exact) #[i.el-icon-s-home] 首頁
    div
      nuxt-link(to="/about", exact) #[i.el-icon-s-tools] 設定
</template>

<script>
export default {
  name: 'HeaderComponent'
}
</script>

<style lang="scss" scoped>
.main-header {
  height: 50px;
  display: flex;
  background-color: #586e84;
}

nav {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  div {
    height: 100%;
    margin: 0 20px;
    display: flex;
    align-items: center;
  }
}

a {
  font-family: Helvetica, sans-serif;
  color: white;
  font-size: 1rem;
  font-weight: 100;
  text-decoration: underline;
  text-transform: uppercase;
  &:hover {
    opacity: 0.9;
    font-size: large;
    position: relative;
  }
}

</style>
