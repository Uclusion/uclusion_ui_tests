
function fillSignupForm(url, userName, userEmail, userPassword) {
  cy.visit(url, {failOnStatusCode: false});
  cy.get('#name', { timeout: 5000 }).type(userName);
  cy.get('#email').type(userEmail);
  cy.get('#password').type(userPassword);
  cy.get('#repeat').type(userPassword);
  cy.get('#terms').click();
  cy.get('#signupButton').should('not.be.disabled').click();
}

function signIn(url, userEmail, userPassword) {
  cy.visit(url, {failOnStatusCode: false});
  cy.get('#username', { timeout: 5000 }).type(userEmail);
  cy.get('#password').type(userPassword);
  cy.get('#signinButton').click();
}

function logOut() {
  cy.get('#identityButton').click();
  cy.get('#signoutButton').click();
  // Verify the sign out happened before allow Cypress to continue
  cy.get('#username', { timeout: 5000 });
}

function createAndTourWorkspace() {
  cy.get('#Channel', { timeout: 20000 }).click();
  cy.get('#workspaceName').type('Workspace created from UI tests');
  cy.get('#OnboardingWizardFinish').click();
  takeInvitedTour(true);
}

function takeInvitedTour(isCreator) {
  // Need the timeouts because market can still be loading
  if (!isCreator) {
    cy.get('[title=Next]', { timeout: 8000 }).click();
  }
  cy.get('[title=Close]', { timeout: 8000 }).first().click();
}

function waitForEmail(userEmail, destination, subject, testStartDate) {
  return cy.task("gmail:check", {
    from: "support@uclusion.com",
    to: userEmail,
    subject,
    after: testStartDate,
    include_body: true
  }).then(emails => {
    assert.isNotNull(emails, 'No email returned');
    assert.isNotEmpty(emails, 'Email was not found');
    assert.lengthOf(emails, 1, 'Too many emails - maybe concurrent tests');
    const searchString = emails[0].body.html;
    const begin = searchString.indexOf(`href="${destination}`) + 6;
    const end = searchString.indexOf('"', begin);
    return searchString.substring(begin, end);
  });
}

describe('Authenticator:', function() {
  const destination = 'https://stage.uclusion.com';
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
      const inviteSubject = 'Tester Two Uclusion invites you to a Uclusion channel';
      const testStartDate = new Date();
      const optionText = 'This is your option to vote for';
      fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester One Uclusion', firstUserEmail,
          userPassword);
      waitForEmail(firstUserEmail, destination, verifySubject, testStartDate).then((url) => {
        signIn(url, firstUserEmail, userPassword);
        createAndTourWorkspace();
        cy.get('#Discussion').click();
        cy.get('#commentAddLabelQUESTION').click();
        cy.focused().type('Did you receive this question?');
        cy.get('#commentSaveButton').click();
        cy.get('[id^=inlineAdd]', { timeout: 5000 }).click();
        cy.focused().type(optionText);
        cy.get('#decisionInvestibleSaveButton').click();
        cy.get('#currentVotingChildren', { timeout: 8000 }).contains(optionText);
        cy.get('#AddCollaborators').click();
        return cy.get('#inviteLinker', { timeout: 5000 }).find('input');
      }).then(input => {
        const inviteUrl = input.attr('value');
        logOut();
        cy.visit(inviteUrl, {failOnStatusCode: false});
        fillSignupForm(inviteUrl, 'Tester Two Uclusion', secondUserEmail, userPassword);
        return waitForEmail(secondUserEmail, destination, verifySubject, testStartDate);
      }).then((url) => {
        signIn(url, secondUserEmail, userPassword);
        takeInvitedTour(false);
        cy.get('#Discussion').click();
        cy.get('#currentVotingChildren', { timeout: 60000 }).contains(optionText);
        cy.get('#AddCollaborators').click();
        // https://github.com/cypress-io/cypress/issues/5827
        cy.get('#email1').should('not.be.disabled').type(thirdUserEmail, {force: true});
        cy.get('#addressAddSaveButton').should('not.be.disabled').click();
        cy.get('#emailsSentList', { timeout: 10000 }).contains(thirdUserEmail);
        // add a story for third user with vote
        cy.get('#AddJob').click();
        cy.get('#addAssignment').type(thirdUserEmail+'{enter}', {delay: 60});
        return cy.url().then(url => {
          const begin = url.indexOf('dialog') + 7;
          const end = url.indexOf('#');
          const marketId =  end > 0 ? url.substring(begin, end) : url.substring(begin);
          cy.get(`#editorBox-${marketId}-planning-inv-add`).type('Creating this story to test placeholder gets it');
          cy.get('input[value=75]').click();
          cy.get('#planningInvestibleAddButton').click();
          cy.get('#Description', { timeout: 10000 }).should('be.visible');
          logOut();
          return waitForEmail(thirdUserEmail, `${destination}/invite`, inviteSubject, testStartDate);
        });
      }).then((url) => {
        cy.visit(url, {failOnStatusCode: false});
        cy.get('#name').type('Tester Uclusion');
        cy.get('#password').type(userPassword);
        cy.get('#repeat').type(userPassword);
        cy.get('#terms').click();
        cy.get('#signupButton').click();
        // Prevent typing in before on new page
        cy.contains('Sign In');
        // Not requiring a third entry of the password here would be nice - have put in a when convenient for it
        cy.get('#password').type(userPassword);
        cy.get('#signinButton').click();
        takeInvitedTour(false);
        cy.get('#Jobs').click();
        cy.get('#swimLanesChildren').contains('Creating this story to test placeholder gets it', { timeout: 20000 }).click();
        cy.contains('Certain', { timeout: 10000 }).filter(':visible').should('be.visible');
      });
    });
  });

});