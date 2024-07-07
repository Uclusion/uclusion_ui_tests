
describe('Authenticator:', function() {
  const destination = 'https://stage.uclusion.com';
  const apiDestination = 'sso.stage.api.uclusion.com/v1'

  beforeEach(function() {
    // https://github.com/cypress-io/cypress/issues/1208
    indexedDB.deleteDatabase('localforage');
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  //Make screen vertically larger if want to use { scrollBehavior: false } in test for that bug
  describe('Check market creation', () => {
    it('signs up and creates template market and verifies', () => {
      const firstUserEmail = 'tuser+03@uclusion.com';
      const secondUserEmail = 'tuser+04@uclusion.com';
      const thirdUserEmail = 'tuser+05@uclusion.com';
      const userPassword = 'Testme;1';
      const optionText = 'This is your option to vote for';
      const jobName = 'Creating this story to test placeholder gets it';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester Three Uclusion', firstUserEmail,
          userPassword);
      // Wait for a read on Cognito of the signup that just happened to work
      cy.wait(8000);
      cy.getVerificationUrl('03', apiDestination).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.confirmDemoMarketInbox();
        // verify next button does something
        cy.get('#nextNavigation').click();
        cy.get('[id^=workListItem]').should('exist');
        cy.get('#nextNavigation').click();
        cy.get('[id^=workListItem]').should('exist');
        cy.get('#Inbox').click();
        // Before processing inbox items we are invited to compose
        cy.get('#composeFromDemoBanner').should('exist');
        // Now process an inbox item to get the workspace from demo banner
        cy.get('[id^=workListItemUNREAD_REVIEWABLE]', { timeout: 10000 }).click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('#5', { timeout: 15000 }).should('exist');
        cy.get('#OnboardingWizardOtherNext').click();
        cy.get('#newReport', { timeout: 10000 }).should('exist');
        cy.get('#Inbox').click();
        cy.createWorkspaceFromDemoBanner('UI Smoke');
        // Check that inbox clears of demo notifications
        cy.confirmDemoMarketClearedInbox();
        cy.createMarketQuestionWithOption('Did you receive this question?', optionText);
        cy.get('#Addcollaborators').click();
        // If switch to Chrome then try realClick() below
        cy.get('#copyInviteLink').click();
        return cy.window().then((win) => {
          return win.navigator.clipboard.readText();
        });
      }).then(inviteUrl => {
        cy.log(`clip board variable is ${inviteUrl}`);
        cy.logOut();
        cy.fillSignupForm(inviteUrl, 'Tester Four Uclusion', secondUserEmail, userPassword);
        // Wait for a read on Cognito of the signup that just happened to work
        cy.wait(8000);
        cy.getVerificationUrl('04', apiDestination, inviteUrl.substring(destination.length + 1));
      }).then((url) => {
        cy.signIn(url, secondUserEmail, userPassword);
        cy.get('#Discussion', { timeout: 60000 }).click();
        cy.get('#commentBox', { timeout: 120000 }).contains(optionText, { timeout: 60000 });
        cy.createAdditionalUser(thirdUserEmail);
        // add a story for second user with vote
        cy.createJob(jobName, thirdUserEmail, 75);
        cy.logOut();
        cy.wait(8000);
        return cy.getInviteUrl('05', '03', apiDestination);
      }).then((url) => {
        cy.log(`invite url variable is ${url}`);
        cy.fillSignupForm(url, 'Tester Five Uclusion', undefined, userPassword);
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