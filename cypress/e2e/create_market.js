
describe('Authenticator:', function() {
  const destination = 'https://stage.uclusion.com';
  let optionUrl;
  // Step 1: setup the application state
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  //Make screen vertically larger if want to use { scrollBehavior: false } in test for that bug
  describe('Check market creation', () => {
    it('signs up and creates template market and verifies', () => {
      const firstUserEmail = 'tuser+01@uclusion.com';
      const secondUserEmail = 'tuser+02@uclusion.com';
      const thirdUserEmail = 'tuser@uclusion.com';
      const userPassword = 'Testme;1';
      const verifySubject = 'Please verify your email address';
      const inviteSubject = 'Tester Two Uclusion invites you to collaborate';
      const testStartDate = new Date();
      const optionText = 'This is your option to vote for';
      const jobName = 'Creating this story to test placeholder gets it';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester One Uclusion', firstUserEmail,
          userPassword);
      cy.waitForEmail(firstUserEmail, destination, verifySubject, testStartDate).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.createAndTourWorkspace('UI Smoke Channel');
        cy.get('#Discussion').click();
        cy.createComment('QUESTION', 'Did you receive this question?');
        cy.createQuestionOption(optionText, 'My option description', 'Did you receive this question?');
        cy.sendComment();
        cy.wait(5000);
        cy.get(`#currentVotingChildren`, {timeout: 120000}).within(() => {
          cy.contains(optionText, {timeout: 120000}).click();
          cy.get("#shareButtonExplanation", { timeout: 5000 }).click();
        });
        cy.get('#inviteLinker', { timeout: 5000 }).find('input')
            .then((input) => {
              optionUrl = input.attr('value');
            });
        cy.contains('Close').click();
        cy.get('#workspaceMenuButton').click()
        cy.get('#addWorkspaceIconId').click();
        return cy.get('#inviteLinker', { timeout: 5000 }).find('input');
      }).then(input => {
        const inviteUrl = input.attr('value');
        cy.logOut();
        cy.visit(inviteUrl, {failOnStatusCode: false});
        cy.fillSignupForm(inviteUrl, 'Tester Two Uclusion', secondUserEmail, userPassword);
        cy.waitForEmail(secondUserEmail, destination, verifySubject, testStartDate);
      }).then((url) => {
        cy.signIn(url, secondUserEmail, userPassword);
        cy.get('#Discussion').click();
        cy.get('#currentVotingChildren', { timeout: 60000 }).contains(optionText);
        cy.get('#workspaceMenuButton').click();
        cy.get('#addWorkspaceIconId').click();
        // https://github.com/cypress-io/cypress/issues/5827
        cy.get('#emailEntryBox').type(thirdUserEmail + '{enter}', {delay: 60, force: true});
        cy.get('#addressAddSaveButton').should('not.be.disabled').click();
        cy.get('#emailsSentList', { timeout: 10000 }).contains(thirdUserEmail);
        cy.get('#closeAddNewUsers').click();
        // add a story for third user with vote
        cy.createJob(jobName, thirdUserEmail, 75);
        cy.logOut();
        return cy.waitForEmail(thirdUserEmail, `${destination}/invite`, inviteSubject, testStartDate);
      }).then((url) => {
        cy.fillSignupForm(url, 'Tester Uclusion', undefined, userPassword);
        // Not requiring a third entry of the password here would be nice - have put in a when convenient for it
        cy.signIn(undefined, undefined, userPassword);
        cy.navigateIntoJob(jobName);
        // Have to use wait here because otherwise contains can find the inbox not visible or job visible
        cy.wait(10000);
        cy.get('span').filter(':visible').contains('Certain');
        cy.logOut();
        cy.fillSignupForm(optionUrl, 'Tester Three Uclusion', 'tuser+03@uclusion.com', userPassword, true);
        cy.waitForEmail('tuser+03@uclusion.com', destination, verifySubject, testStartDate);
      }).then((url) => {
        cy.signIn(url, 'tuser+03@uclusion.com', userPassword);
        // Verify the option is open and visible
        cy.contains('My option description', {timeout: 120000});
      });
    });
  });

});