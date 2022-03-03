
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
      const secondUserName = 'Awesome Too';
      const thirdUserEmail = 'tuser@uclusion.com';
      const thirdUserName = 'Awesome More';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      const jobName = 'Quantum random key'
      cy.waitForInviteAndTour(destination, thirdUserEmail, firstUserName, thirdUserName, userPassword);
      cy.verifyCollaborators([secondUserName]);
      cy.createJob('Open source our deployment scripts', 'We should not be solely owning any of it.', thirdUserName);
      cy.createComment('SUGGEST', 'Convert everything we can to shared orbs.', true);
      cy.get(returnToChannel).click();
      cy.createJob('New data compression algorithm', 'Looking to reduce size by half.', thirdUserName);
      cy.createComment('QUESTION', 'Which algorithm?', true, false);
      cy.createQuestionOption('DEFLATE', undefined, true);
      cy.createQuestionOption('LZMA2', undefined, false, true);
      cy.createQuestionOption('MLP', 'Based on neighboring data via backpropagation.', false, false, true);
      cy.get(returnToChannel).click();
      cy.createJob('Automatic AI animation of logo', 'Provide macros for walking, talking, smiling and laughing.',
          secondUserName, 75, 'Will be adorable.');
      cy.get(returnToChannel).click();
      cy.navigateIntoJob(jobName, 'furtherReadyToStart');
      cy.voteSuggestion(true, 25, 'Not sure about using the IBM API.');
      cy.get(returnToChannel).click();
      cy.createTodo('immediate', 'CommentAddRed', 'Revisit Lambda API common error handling.');
    });
  });

});