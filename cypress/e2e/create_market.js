
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
      const inviteSubject = 'Tester Two Uclusion invites you to collaborate';
      const testStartDate = new Date();
      const optionText = 'This is your option to vote for';
      const jobName = 'Creating this story to test placeholder gets it';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester One Uclusion', firstUserEmail,
          userPassword);
      cy.waitForEmail(firstUserEmail, destination, verifySubject, testStartDate).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.createAndTourWorkspace('UI Smoke');
        cy.createMarketQuestionWithOption('Did you receive this question?', optionText);
        cy.wait(5000);
        cy.get('#Addcollaborators').click();
        // If switch to Chrome then try realClick() below
        cy.get('#copyInviteLink').click();
        return cy.window().then((win) => {
          return win.navigator.clipboard.readText();
        });
      }).then(inviteUrl => {
        cy.log(`clip board variable is ${inviteUrl}`);
        cy.logOut();
        cy.fillSignupForm(inviteUrl, 'Tester Two Uclusion', secondUserEmail, userPassword);
        cy.waitForEmail(secondUserEmail, destination, verifySubject, testStartDate);
      }).then((url) => {
        cy.signIn(url, secondUserEmail, userPassword);
        cy.get('#Discussion', { timeout: 60000 }).click();
        cy.get('#currentVotingChildren', { timeout: 60000 }).contains(optionText, { timeout: 60000 });
        cy.createAdditionalUser(thirdUserEmail);
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
      });
    });
  });

});