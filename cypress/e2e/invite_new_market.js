
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
      const firstUserName = 'Tester Three Uclusion';
      const secondUserEmail = 'tuser+04@uclusion.com';
      const thirdUserEmail = 'tuser+05@uclusion.com';
      const userPassword = 'Testme;1';
      const questionText = 'Did you receive this question?';
      const optionText = 'This is your option to vote for';
      const jobName = 'Creating this story to test placeholder gets it';
      const reviewJobName = 'Job getting a review on.';
      const blockingIssue = 'This is my issue with this progress.';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, firstUserName, firstUserEmail,
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
        cy.createMarketQuestionWithOption(questionText, optionText);
        cy.get('#Compose').click();
        cy.get('#typeTODO').click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('[id^=editorBox-addBugCommentAddBug]').type('This is my critical bug.');
        cy.get('#OnboardingWizardNext').click();
        cy.createJob(reviewJobName, firstUserName, undefined, undefined, undefined, true);
        cy.get('#Default').click();
        cy.navigateIntoJob(reviewJobName);
        cy.get('#newReport').click();
        cy.get('[id^=editorBox-jobCommentREPORTJobCommentAdd]').type('This is my report yea!');
        cy.get('#OnboardingWizardNext').click();
        cy.get('#Overview', {timeout: 10000}).should('be.visible');
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
        // Will be on workspace notification
        cy.get('#Default', { timeout: 30000 }).click();
        cy.get('#Discussion', { timeout: 60000 }).click();
        cy.get('#commentBox', { timeout: 120000 }).contains(optionText, { timeout: 60000 });
        cy.get('#Inbox').click();
        cy.get('[id^=linkNOT_FULLY_VOTED]', { timeout: 30000 }).contains(questionText).click();
        cy.get('#approvalButton').click();
        cy.vote(75, 'My vote for option reason.', true);
        cy.get('#Inbox').click();
        cy.get('[id^=workListItemUNASSIGNED]').click();
        cy.get('[id^=moveComment]').click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('#OnboardingWizardTerminate').contains('Skip', { timeout: 30000 }).click();
        cy.get('#Overview', {timeout: 10000}).should('be.visible');
        cy.get('#Inbox').click();
        cy.get('[id^=linkUNREAD_REVIEWABLE]').click();
        cy.get('#OnboardingWizardOtherNext').click();
        cy.get('#commentAddLabelISSUE').click();
        cy.get('#OnboardingWizardNext').click();
        cy.focused({ timeout: 10000 }).type(blockingIssue);
        cy.get('#OnboardingWizardNext').click();
        // Decision of send to team or not
        cy.get('#ISSUEYes', {timeout: 10000}).should('be.visible');
        cy.get('#OnboardingWizardNext').click();
        cy.get('#Overview', {timeout: 10000}).should('be.visible');
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
        cy.get('#Default', { timeout: 30000 }).click();
        cy.navigateIntoJob(jobName);
        // Have to use wait here because otherwise contains can find the inbox not visible or job visible
        cy.wait(10000);
        cy.get('span').filter(':visible').contains('Certain');
        cy.get('#Inbox').click();
        cy.get('[id^=linkUNREAD_JOB_APPROVAL_REQUEST]').click();
        cy.vote(75, 'My vote for take job reason.', true);
        cy.get('span').filter(':visible').contains('Certain');
        cy.get('#Inbox').click();
        cy.get('[id^=workListItemUNREAD_COMMENT]').contains(blockingIssue).click();
        cy.contains(blockingIssue, {timeout: 10000}).click();
        cy.get('[id^=moveComment]').click();
        cy.get('#OnboardingWizardTerminate').click();
        cy.get('#Bugs', { timeout: 30000 }).should('be.visible');
      });
    });
  });

});