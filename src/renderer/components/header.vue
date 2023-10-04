<template lang="pug">
header.main-header: nav
  div: nuxt-link(to="/", exact, :class="active('/')") #[i.el-icon-timer]排程
  div: nuxt-link(to="/setting", exact, :class="active('/setting')") #[i.el-icon-s-tools]設定
</template>
  
  <script>
  export default {
    name: 'HeaderComponent',
    mounted () {
      console.warn(this.$route)
    },
    methods: {
      active (url) {
        if (this.$route.path === url) {
          return ['active']
        }
        return []
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  $r: random(155);
  $b: random(155);
  $g: random(155);
  .main-header {
    height: 50px;
    display: flex;
    // background-color: #1e1f1f;
    background-color: RGB($r + 50, $g + 100, $b + 50);
  }
  nav {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    div {
      height: 100%;
      margin: 0 20px;
      display: flex;
      align-items: center;
    }
    a {
      font-family: Helvetica, sans-serif;
      color: white;
      font-size: 1rem;
      font-weight: 100;
      text-decoration: none;
      text-transform: uppercase;
      &:hover {
        font-weight: bolder;
        font-size: larger;
        // flicker from anim.scss @keyframe
        animation: flicker 0.5s ease alternate infinite;
      }
    }
    .active {
      font-weight: bolder;
      font-size: larger;
      filter: drop-shadow(6px 6px 7px rgba(0, 0, 0, 0.7))
    }
  }
  </style>
  