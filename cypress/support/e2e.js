// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Email signup and resend wait for Cloudflare Turnstile's "I am human" widget, which cannot be
// relied on to give a token inside Cypress. Replace only Cloudflare's widget script with a stub
// that hands the app Cloudflare's dummy token. The stage SSO service still checks that token with
// Turnstile's siteverify, using the always-pass test secret, which accepts only the dummy token.
const TURNSTILE_STUB = `
(function () {
  var DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';
  var widgets = {};
  var nextId = 0;
  function answer(id) {
    setTimeout(function () {
      var options = widgets[id];
      if (options && options.callback) {
        options.callback(DUMMY_TOKEN);
      }
    }, 0);
  }
  window.turnstile = {
    render: function (container, options) {
      nextId += 1;
      var id = 'cypress-turnstile-' + nextId;
      widgets[id] = options;
      answer(id);
      return id;
    },
    reset: function (id) {
      answer(id);
    },
    remove: function (id) {
      delete widgets[id];
    }
  };
})();
`;

beforeEach(() => {
  cy.intercept('https://challenges.cloudflare.com/turnstile/v0/api.js*', {
    headers: { 'content-type': 'application/javascript' },
    body: TURNSTILE_STUB,
  });
});
