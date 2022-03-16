
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
      //Notification: unassigned to-do yellow
      cy.createTodo('whenAble', 'CommentAddYellow', 'Configuration screens rework for consistency.');
      //Notification: unassigned to-do blue
      cy.createTodo('whenConvenient', 'CommentAddBlue', 'S3 clean up of orphaned files.');
      cy.navigateIntoJob(jobName);
      // Better way is to come in through inbox but for now just wait for in right stage
      cy.contains('Review Report', {timeout: 90000});
      //Notification: view comment
      cy.createComment('REPORT', 'IMHO ready to ship.');
      cy.get(returnToChannel).click();
      cy.get('#Discussion').click();
      //Notification: comment reply and please vote combination
      cy.createComment('SUGGEST', 'New environment for medium lived testing.');
      cy.replyToComment('Why not just use and selectively clean an existing environment?',
          'Could do that but would be more work than standing up a new environment.', false);
      cy.createComment('QUESTION', 'Can we adopt a better communications tool?');
      cy.createQuestionOption('Uclusion', 'The communications tool for experienced developers.', true);
      cy.contains('1 approvals', {timeout: 90000});
      //Notification: new option
      cy.createQuestionOption('Zoom', 'The communications tool for online meetings.', false);
      //Notification: new option submitted
      cy.createQuestionOption('Integration testing for Lambdas', undefined, false, false, false, false);
      cy.get(returnToChannel).click();
      cy.navigateIntoJob('Upgrade Material UI');
      cy.voteSuggestion(true, 50, 'Depends on effort estimate.');
    });
  });

});