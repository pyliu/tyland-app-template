export default {
  head: {
    title: '個人助手',
    meta: [{
      charset: 'utf-8'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },
    {
      hid: 'description',
      name: 'description',
      content: '工作輔助的APP'
    }
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: 'favicon.ico'
    }
    ],
    script: []
  },
  build: {
    extend: (config) => {
      config.target = 'electron-renderer';
    },
    babel: { compact: true }
  },
  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#5cb85c'
  },
  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [],
  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,
  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    '@nuxtjs/style-resources',
    // https://go.nuxtjs.dev/axios
    // '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '@nuxtjs/localforage'
  ],
  bootstrapVue: {
    // Install the `IconsPlugin` plugin (in addition to `BootstrapVue` plugin)
    icons: true,
    config: {
      // Custom config options here
    }
  },
}
