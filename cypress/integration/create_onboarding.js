
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
      const secondUserEmail = 'tuser+04@uclusion.com';
      const firstUserName = 'John Doe';
      const userPassword = 'Testme;1';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, firstUserName, firstUserEmail,
          userPassword);
      cy.waitForEmail(firstUserEmail, destination, 'Please verify your email address', new Date()).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.get('#linkemptyInbox', {timeout: 10000}).click();
        cy.get('#inboxEmail1').type(secondUserEmail);
        cy.get('#editorBox-planning-inv-add').type('Try a one and done to see if onboarding is even basically working.');
        cy.get('#planningInvestibleAddButton').click();
        cy.wait(5000);
      });
    });
  });

});