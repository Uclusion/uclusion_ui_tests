
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
  cy.get('#createTemplateWorkspaceButton', { timeout: 7000 }).click();
  cy.get('[title=Next]', { timeout: 7000 }).click();
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

function waitForEmailAndSignIn(userEmail, userPassword, destination) {
  const testStartDate = new Date();
  return cy.task("gmail:check", {
    from: "support@uclusion.com",
    to: userEmail,
    subject: "Please verify your email address",
    after: testStartDate,
    include_body: true
  }).then(emails => {
    assert.isNotNull(emails, 'No email returned');
    assert.isNotEmpty(emails, 'Email was not found');
    assert.lengthOf(emails, 1, 'Too many emails - maybe concurrent tests');
    const searchString = emails[0].body.html;
    const begin = searchString.indexOf(`href="${destination}`) + 6;
    const end = searchString.indexOf('"', begin);
    const url = searchString.substring(begin, end);
    signIn(url, userEmail, userPassword);
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
      const userPassword = 'Testme;1';
      fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester One Uclusion', firstUserEmail,
          userPassword);
      waitForEmailAndSignIn(firstUserEmail, userPassword, destination).then(() => {
        createAndTourTemplate();
        cy.get('#adminManageCollaborators').click();
        return cy.get('#inviteLinker').find('input');
      }).then(input => {
        const inviteUrl = input.attr('value');
        logOut();
        const secondUserEmail = 'tuser+02@uclusion.com';
        cy.visit(inviteUrl, {failOnStatusCode: false});
        fillSignupForm(inviteUrl, 'Tester Two Uclusion', secondUserEmail, userPassword);
        return waitForEmailAndSignIn(secondUserEmail, userPassword, destination);
      }).then(() => {
        takeInvitedTour();
      });
    });
  });

});