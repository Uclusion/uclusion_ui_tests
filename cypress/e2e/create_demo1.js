
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
      const jobName = 'Open source our deployment scripts.';
      const firstJobName = 'Status at a glance monitoring dashboard.';
      const secondJobName = 'Blog our data architecture.';
      const thirdJobName = 'Need to reduce re-renders and slowness from background API calls.';
      const fourthJobName = 'New data compression algorithm to reduce size by half.';
      const fifthJobName = 'Generate a truly random number and seed the application with it.';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      cy.waitForInviteAndTour(destination, secondUserEmail, firstUserName, secondUserName, userPassword);
      cy.verifyCollaborators([firstUserName]);
      //Notification: new assignment
      cy.createJob('Consider total cost and max latency for database scaling.', firstUserName, 50,
          'Already have several examples of potential optimizations.');
      cy.get(returnToChannel).click();
      cy.createJob(firstJobName, secondUserName);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(jobName, 'requiresInputChildren');
      cy.voteSuggestion(true, 75, 'Yes with orbs there can be other maintainers also.', true);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(secondJobName);
      //Notification: unresolved issue
      cy.createComment('SUGGEST', 'Include the use of capabilities through the front end in the blog.');
      cy.get(returnToChannel).click();
      //Notification: please review
      cy.createJob('Need a faster route to aha in onboarding.', secondUserName);
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
      // Take tour for blocked - if the push doesn't make it have to wait for the poll
      cy.takeTour(false, 600000);
      //Notification: resolved issue
      cy.resolveComment('The existing monitoring is good enough.', true);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob('Upgrade Material UI.', 'requiresInputChildren');
      cy.voteSuggestion(true, 100, 'Yes good idea.');
    });
  });

});