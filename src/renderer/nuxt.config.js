/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */
module.exports = {
  ssr: false,
  target: 'static',
  head: {
    title: 'tyland-app-template',
    meta: [{ charset: "utf-8" }]
  },
  loading: { color: '#5cb85c' },
  css: ['@/assets/scss/custom.scss'],
  plugins: [
    '~/plugins/bootstrap.js',
    {ssr: true, src: '@/plugins/icons.js'},
    {ssr: true, src: '@/plugins/element.js'},
  ],
  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,
  buildModules: [
    
  ],
  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/localforage'
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  // use these settings to use custom css
  bootstrapVue: {
    bootstrapCSS: true,
    bootstrapVueCSS: true,
    icons: true,
  },
};
