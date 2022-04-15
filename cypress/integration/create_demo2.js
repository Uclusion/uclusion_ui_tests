
describe('Demo 2:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo 2 creation', () => {
    it('invite 2 and create demo market', () => {
      const firstUserName = 'Awesome One';
      const secondUserName = 'Awesome Too';
      const thirdUserEmail = 'tuser+04@uclusion.com';
      const thirdUserName = 'Awesome More';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      const jobName = 'Generate a truly random number and seed the application with it.';
      const secondJobName = 'Blog our data architecture.';
      cy.waitForInviteAndTour(destination, thirdUserEmail, firstUserName, thirdUserName, userPassword);
      cy.verifyCollaborators([secondUserName]);
      //Notification: please vote
      cy.createJob('Open source our deployment scripts. We should not be solely owning any of it.', thirdUserName);
      cy.createComment('SUGGEST', 'Convert everything we can to shared orbs.', true, true, true, false);
      cy.get(returnToChannel).click();
      cy.createJob('New data compression algorithm to reduce size by half.', thirdUserName);
      //Notification: please choose
      cy.createComment('QUESTION', 'Which algorithm?');
      cy.createQuestionOption('DEFLATE', undefined, 'Which algorithm?', true);
      cy.createQuestionOption('LZMA2', undefined, 'Which algorithm?', true, true);
      cy.createQuestionOption('MLP', 'Based on neighboring data via backpropagation.', 'Which algorithm?', false, true);
      cy.sendComment(true, false);
      cy.voteOption('MLP', 100, 'Better for audio.')
      cy.get(returnToChannel).click();
      //Notification: Please approve
      cy.createJob('Automatic AI animation of logo. Provide macros for walking, talking, smiling and laughing.',
          secondUserName, 75, 'Will be adorable.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(jobName, 'furtherReadyToStart');
      cy.voteSuggestion(true, 25, 'Not sure about using the IBM API.');
      cy.get(returnToChannel).click();
      //Notification: red unassigned to-do
      cy.createTodo('immediate', 'CommentAddRed', 'Revisit Lambda API common error handling.');
      cy.navigateIntoJob(secondJobName);
      //Notification: new approval
      cy.vote(75, 'Good idea.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob('Upgrade Material UI.', 'requiresInputChildren');
      cy.voteSuggestion(false, 100, 'Too much effort at this time.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob('Another crummy description.');
      //Notification: description change
      cy.editNameDescription('Another crummy description.', 'Cloud failover', 'Need a better strategy without buying a cadillac.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob('Consider total cost and max latency for database scaling.');
      cy.editNameDescription('Consider total cost and max latency for database scaling.', undefined, 'Consider total cost over 5 years and max latency.');
      cy.vote(75, 'Easier while still relatively few users.');
      cy.createCommentImmediate('QUESTION', 'Is clean up strategy in scope?');
    });
  });

});