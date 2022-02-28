
describe('Demo 2:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo creation', () => {
    it('invite 2 and create demo market', () => {
      const firstUserName = 'Awesome One';
      const thirdUserEmail = 'tuser@uclusion.com';
      const thirdUserName = 'Awesome More';
      const userPassword = 'Testme;1';
      const jobName = 'Open source our deployment scripts';
      cy.waitForInviteAndTour(destination, thirdUserEmail, firstUserName, thirdUserName, userPassword);
      cy.createJob(jobName, 'We should not be solely owning any of it.', thirdUserName);
      cy.createComment('SUGGEST', 'Convert everything we can to shared orbs.', true, false);
    });
  });

});