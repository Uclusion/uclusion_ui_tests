import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '4b7344',
  viewportHeight: 1150,
  viewportWidth: 1700,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
