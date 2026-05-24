/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      fix: true,
      include: [],
      exclude: [],
      rawOptions: {},
      warnings: true,
      errors: true
    },

    boot: [
      'axios',
      'pinia'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'material-icons',
      'mdi-v7',
      'fontawesome-v6'
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },

      vueRouterMode: 'hash',

      // Typescript aliases
      alias: {}
    },

    devServer: {
      open: true,
      proxy: {
        '/api': {
          target: process.env.API_URL || 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },

    framework: {
      config: {
        dark: 'auto'
      },

      plugins: [
        'Notify',
        'Dialog',
        'Loading',
        'LocalStorage'
      ]
    },

    animations: 'all',

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render']
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentials: false,
      manifest: {
        name: 'BrewPilotApi',
        short_name: 'BrewPilotApi',
        description: 'Sistema de elaboração de receitas cervejeiras',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1a1a2e',
        theme_color: '#e8a020',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'brew-pilot-app'
      }
    },

    bex: {
      contentScripts: ['my-content-script']
    }
  }
})
