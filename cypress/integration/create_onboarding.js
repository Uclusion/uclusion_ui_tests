
describe('Demo:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Onboarding creation', () => {
    it('signs up only', () => {
      const firstUserEmail = 'tuser@uclusion.com';
      const firstUserName = 'John Doe';
      const userPassword = 'Testme;1';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, firstUserName, firstUserEmail,
          userPassword);
      cy.waitForEmail(firstUserEmail, destination, 'Please verify your email address', new Date()).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
      });
    });
  });

});