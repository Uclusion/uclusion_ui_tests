
describe('Demo 2:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo 3 creation', () => {
    it('invite 3 and create demo market', () => {
      const firstUserName = 'Awesome One';
      const userPassword = 'Testme;1';
      const returnToChannel = '#DemoChannel';
      const fourthUserEmail = 'tuser+03@uclusion.com';
      const fourthUserName = 'Ever Awesome';
      const jobName = 'SPA level performance issues';
      cy.waitForInviteAndTour(destination, fourthUserEmail, firstUserName, fourthUserName, userPassword);
      cy.createTodo('whenAble', 'CommentAddYellow', 'Configuration screens rework for consistency.');
      cy.createTodo('whenConvenient', 'CommentAddBlue', 'S3 clean up of orphaned files.');
      cy.navigateIntoJob(jobName);
      cy.createComment('REPORT', 'IMHO ready to ship.');
      cy.get(returnToChannel).click();
      cy.get('#Discussion').click();
      cy.createComment('SUGGEST', 'New environment for medium lived testing.');
      cy.replyToComment('Why not just use and selectively clean an existing environment?',
          'Could do that but would be more work than standing up a new environment.', false);
    });
  });

});