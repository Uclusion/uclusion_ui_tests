
describe('Demo 1:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo 1 creation', () => {
    it('invite 1 and create demo market', () => {
      const firstUserName = 'Awesome One';
      const secondUserEmail = 'tuser+02@uclusion.com';
      const secondUserName = 'Awesome Too';
      const jobName = 'Open source our deployment scripts';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      cy.waitForInviteAndTour(destination, secondUserEmail, firstUserName, secondUserName, userPassword);
      cy.get(returnToChannel, {timeout: 20000}).click();
      cy.navigateIntoJob(jobName);
        //TODO - need vote on suggestion
    });
  });

});