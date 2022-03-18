
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
      const firstJobName = 'Monitoring dashboard';
      const secondJobName = 'Blog our data architecture';
      const thirdJobName = 'SPA level performance issues';
      const fourthJobName = 'New data compression algorithm';
      const fifthJobName = 'Quantum random key';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      cy.waitForInviteAndTour(destination, secondUserEmail, firstUserName, secondUserName, userPassword);
      cy.verifyCollaborators([firstUserName]);
      //Notification: new assignment
      cy.createJob('Database scaling', 'Consider total cost and max latency.', firstUserName, 50,
          'Already have several examples of potential optimizations.');
      cy.get(returnToChannel).click();
      cy.createJob(firstJobName, 'Status at a glance.', secondUserName);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(jobName, 'requiresInputChildren');
      cy.voteSuggestion(true, 75, 'Yes with orbs there can be other maintainers also.', true);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(secondJobName);
      //Notification: unresolved issue
      cy.createComment('SUGGEST', 'Include the use of capabilities through the front end in the blog.');
      cy.get(returnToChannel).click();
      //Notification: please review
      cy.createJob('Revisit onboarding', 'Need a faster route to aha.', secondUserName);
      cy.nextStage();
      cy.createComment('REPORT', 'I have removed all distractions from initial usage.');
      cy.nextStage();
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(thirdJobName);
      cy.waitForReviewStage();
      //Notification: unresolved task
      cy.createComment('TODO', 'Home page still slow.', true, false);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(fourthJobName, 'requiresInputChildren');
      cy.voteOption('MLP', 75, 'Easy enough to try.')
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(fifthJobName, 'furtherReadyToStart');
      cy.voteSuggestion(true, 100, 'IBM API is fine.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(firstJobName);
      //Notification: resolved issue
      cy.resolveComment('The existing monitoring is good enough.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob('Upgrade Material UI', 'requiresInputChildren');
      cy.voteSuggestion(true, 100, 'Yes good idea.');
    });
  });

});