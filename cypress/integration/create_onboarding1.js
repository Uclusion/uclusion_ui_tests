
describe('Demo 1:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Onboarding 1 creation', () => {
    it('receive invite 1 for onboarding market', () => {
      const firstUserName = 'John Doe';
      const secondUserEmail = 'tuser+04@uclusion.com';
      const secondUserName = 'Jane Doe';
      const userPassword = 'Testme;1';
      cy.waitForInvite(destination, secondUserEmail, firstUserName, secondUserName, userPassword);
      // Should be in inbox with approval notification
      cy.get('[id^=workListItemNOT_FULLY_VOTED]', {timeout: 30000});
      cy.wait(5000);
    });
  });

});