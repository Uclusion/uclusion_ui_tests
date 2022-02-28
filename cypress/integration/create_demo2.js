
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
      const returnToChannel = '#DemoChannel';
      cy.waitForInviteAndTour(destination, thirdUserEmail, firstUserName, thirdUserName, userPassword);
      cy.createJob(jobName, 'We should not be solely owning any of it.', thirdUserName);
      cy.createComment('SUGGEST', 'Convert everything we can to shared orbs.', true, false);
      cy.get(returnToChannel).click();
      cy.createJob('New data compression algorithm', 'Looking to reduce size by half.', thirdUserName);
      cy.createComment('QUESTION', 'Which algorithm?', true);
      cy.createQuestionOption('DEFLATE', undefined, true);
      cy.createQuestionOption('LZMA2', undefined, false, true);
      cy.createQuestionOption('MLP', 'Based on neighboring data via backpropagation.', false, false, true);
      cy.get(returnToChannel).click();
      cy.createJob('Automatic AI animation of logo', 'Provide macros for walking, talking, smiling and laughing.',
          secondUserName, 75, 'Will be adorable.');
    });
  });

});