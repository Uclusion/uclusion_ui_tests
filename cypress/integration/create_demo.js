
describe('Demo:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo creation', () => {
    it('signs up and creates template market and verifies', () => {
      const firstUserEmail = 'tuser+01@uclusion.com';
      const firstUserName = 'Awesome One';
      const secondUserEmail = 'tuser+02@uclusion.com';
      const secondUserName = 'Awesome Too';
      const thirdUserEmail = 'tuser@uclusion.com';
      const thirdUserName = 'Awesome More';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, firstUserName, firstUserEmail,
          userPassword);
      cy.waitForEmail(firstUserEmail, destination, 'Please verify your email address', new Date()).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.createAndTourWorkspace('Demo Channel');
        cy.createAdditionalUser(destination, secondUserEmail, firstUserName, secondUserName, userPassword);
        cy.createAdditionalUser(destination, thirdUserEmail, secondUserName, thirdUserName, userPassword);
        cy.createJob('Quantum random key', 'Generate a truly random number and seed the application with it.');
        cy.createComment('SUGGEST', 'See qRNG.');
        cy.get(returnToChannel).click();
        cy.createJob('Automatic AI animation of logo', 'Provide macros for walking, talking, smiling and laughing.',
            secondUserName, 75, 'Will be adorable.');
        cy.get(returnToChannel).click();
        cy.createJob('Database scaling', 'Consider total cost and max latency.', firstUserName, 50,
            'Already have several examples of potential optimizations.');
        cy.get(returnToChannel).click();
        cy.createJob('New data compression algorithm', 'Looking to reduce size by half.', thirdUserName);
        cy.createComment('QUESTION', 'Which algorithm?', true);
        cy.createQuestionOption('DEFLATE', undefined, true);
        cy.createQuestionOption('LZMA2', undefined, false, true);
        cy.createQuestionOption('MLP', 'Based on neighboring data via backpropagation.', false, false, true);
      });
    });
  });

});