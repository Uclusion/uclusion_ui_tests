
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
      const secondJobName = 'Blog our data architecture';
      const thirdJobName = 'SPA level performance issues';
      const fourthJobName = 'New data compression algorithm';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      cy.waitForInviteAndTour(destination, secondUserEmail, firstUserName, secondUserName, userPassword);
      cy.verifyCollaborators([firstUserName]);
      cy.createJob('Database scaling', 'Consider total cost and max latency.', firstUserName, 50,
          'Already have several examples of potential optimizations.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(jobName, 'requiresInputChildren');
      cy.voteSuggestion(true, 75, 'Yes with orbs there can be other maintainers also.', true);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(secondJobName);
      cy.createComment('SUGGEST', 'Include the use of capabilities through the front end in the blog.');
      cy.get(returnToChannel).click();
      cy.createJob('Revisit onboarding', 'Need a faster route to aha.', secondUserName);
      cy.nextStage();
      cy.createComment('REPORT', 'I have removed all distractions from initial usage.');
      cy.nextStage();
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(thirdJobName);
      cy.createComment('TODO', 'Home page still slow.', true, false);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(fourthJobName);
      cy.voteOption('MLP', 75, 'Easy enough to try.')
    });
  });

});