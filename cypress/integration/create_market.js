
function fillSignupForm(url, userName, userEmail, userPassword) {
  cy.visit(url, {failOnStatusCode: false});
  cy.get('#name').type(userName);
  cy.get('#email').type(userEmail);
  cy.get('#password').type(userPassword);
  cy.get('#repeat').type(userPassword);
  cy.get('#terms').click();
  cy.get('#signupButton').click();
}

function signIn(url, userEmail, userPassword) {
  cy.visit(url, {failOnStatusCode: false});
  cy.get('#username').type(userEmail);
  cy.get('#password').type(userPassword);
  cy.get('#signinButton').click();
}

function logOut() {
  cy.get('#identityButton').click();
  cy.get('#signoutButton').click();
}

function createAndTourTemplate() {
  cy.get('#createTemplateWorkspaceButton', { timeout: 10000 }).click();
  cy.get('[title=Next]', { timeout: 10000 }).click();
  cy.get('[title=Next]').click();
  cy.get('[title=Close]').first().click();
}

function takeInvitedTour() {
  cy.get('[title=Next]', { timeout: 10000 }).click();
  cy.get('[title=Next]').click();
  cy.get('[title=Next]').click();
  cy.get('[title=Next]').click();
  cy.get('[title=Next]').click();
  cy.get('[title=Close]').first().click();
}

function waitForEmail(userEmail, destination, subject) {
  const testStartDate = new Date();
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

  });

  describe('Check market creation', () => {
    it('signs up and creates template market and verifies', () => {
      const firstUserEmail = 'tuser+01@uclusion.com';
      const secondUserEmail = 'tuser+02@uclusion.com';
      const thirdUserEmail = 'tuser@uclusion.com';
      const userPassword = 'Testme;1';
      const verifySubject = 'Please verify your email address';
      const inviteSubject = 'Tester Two Uclusion has invited you to join a Uclusion Workspace';
      fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester One Uclusion', firstUserEmail,
          userPassword);
      waitForEmail(firstUserEmail, destination, verifySubject).then((url) => {
        signIn(url, firstUserEmail, userPassword);
        createAndTourTemplate();
        cy.get('#adminManageCollaborators').click();
        return cy.get('#inviteLinker').find('input');
      }).then(input => {
        const inviteUrl = input.attr('value');
        logOut();
        cy.visit(inviteUrl, {failOnStatusCode: false});
        fillSignupForm(inviteUrl, 'Tester Two Uclusion', secondUserEmail, userPassword);
        return waitForEmail(secondUserEmail, destination, verifySubject);
      }).then((url) => {
        signIn(url, secondUserEmail, userPassword);
        takeInvitedTour();
        cy.get('#adminManageCollaborators').click();
        // https://github.com/cypress-io/cypress/issues/5827
        cy.get('#email1').should('not.be.disabled').type(thirdUserEmail, {force: true});
        cy.get('#emailsSentList').contains(thirdUserEmail);
        cy.get('#addressAddSaveButton').click();
        logOut();
        return waitForEmail(thirdUserEmail, `${destination}/invite`, inviteSubject);
      }).then((url) => {
        cy.visit(url, {failOnStatusCode: false});
        cy.get('#name').type('Tester Uclusion');
        cy.get('#password').type(userPassword);
        cy.get('#repeat').type(userPassword);
        cy.get('#terms').click();
        cy.get('#signupButton').click();
        // Not forcing a third entry of the password here would be nice - have put in a when convenient for it
        cy.get('#password').type(userPassword);
        cy.get('#signinButton').click();
        takeInvitedTour();
      });
    });
  });

});