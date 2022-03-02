
describe('Demo:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo creation', () => {
    it('signs up and creates demo market', () => {
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
        cy.createAdditionalUser(secondUserEmail);
        cy.createAdditionalUser(thirdUserEmail);
        cy.verifyCollaborators([secondUserName, thirdUserName]);
        cy.createJob('Quantum random key', 'Generate a truly random number and seed the application with it.',
            undefined, undefined, undefined, true);
        cy.createComment('SUGGEST', 'Use qRNG.');
        cy.get(returnToChannel).click();
        cy.createJob('Blog our data architecture', 'Interesting and good marketing.', firstUserName);
      });
    });
  });

});