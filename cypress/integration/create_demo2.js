
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
      const returnToChannel = '#DemoChannel';
      const jobName = 'Open source our deployment scripts';
      cy.waitForInviteAndTour(destination, thirdUserEmail, firstUserName, thirdUserName, userPassword);
      cy.get(returnToChannel, {timeout: 20000}).click();
      cy.navigateIntoJob(jobName);
      //TODO - need vote on suggestion
    });
  });

});