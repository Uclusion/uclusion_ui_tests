
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

  // T-all-2471: the creator connects AI first, invites a second human, and the invited human
  // connects AI too, verifying both connect paths end to end
  describe('Check connect AI for creator and invited user', () => {
    it('creates a workspace via connect AI then the invited user connects AI', () => {
      const firstUserEmail = 'tuser+07@uclusion.com';
      const firstUserName = 'Tester Seven Uclusion';
      const secondUserEmail = 'tuser+08@uclusion.com';
      const secondUserName = 'Tester Eight Uclusion';
      const userPassword = 'Testme;1';
      const workspaceName = 'AI Invite Smoke';
      // No utm_campaign so the creator lands on the onboarding choice
      cy.fillSignupForm(`${destination}?market_sub_type=TEST#signup`, firstUserName, firstUserEmail,
          userPassword);
      cy.grantClipboardPermissions();
      // Wait for a read on Cognito of the signup that just happened to work
      cy.wait(8000);
      cy.getVerificationUrl('07', apiDestination).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        // The sign in handler polls for the fresh account then window replaces to /demo,
        // which can yank a started wizard back mid flow. Wait for that redirect to land
        // before interacting; only the handler navigates to /demo after sign in.
        cy.url({ timeout: 60000 }).should('include', '/demo');
        cy.contains('How do you want to start?', { timeout: 60000 }).should('be.visible');
        // Creator goes down the connect AI first route
        cy.get('#OnboardingWizardNext').contains('Connect AI first').click();
        cy.get('#workspaceName', { timeout: 10000 }).type(workspaceName);
        cy.get('#OnboardingWizardNext').contains('Generate').click();
        cy.contains('secret_key_id', { timeout: 60000 }).should('be.visible');
        cy.get('#OnboardingWizardTerminate').contains('Go to workspace').click();
        cy.get('#workspaceMenuButton', { timeout: 30000 }).contains(workspaceName);
        // Invite the second human through the UI. A single person workspace first offers
        // creating a view for the collaborator, so skip that step.
        cy.get('#Addcollaborators').click();
        cy.contains('Do you want a view', { timeout: 10000 }).should('be.visible');
        cy.get('#OnboardingWizardSkip').click();
        cy.get('#copyInviteLink', { timeout: 8000 }).click();
        return cy.window().then((win) => {
          return win.navigator.clipboard.readText();
        });
      }).then((inviteUrl) => {
        cy.log(`clip board variable is ${inviteUrl}`);
        cy.logOut();
        cy.fillSignupForm(inviteUrl, secondUserName, secondUserEmail, userPassword);
        // Wait for a read on Cognito of the signup that just happened to work
        cy.wait(8000);
        cy.getVerificationUrl('08', apiDestination, inviteUrl.substring(destination.length + 1));
      }).then((url) => {
        cy.signIn(url, secondUserEmail, userPassword);
        // The sign in handler's delayed window replace reloads the invite path; wait it
        // out so the reload cannot eat the Generate click
        cy.wait(8000);
        // The invited user gets the AI first offer and connects too
        cy.contains('Connect your AI', { timeout: 60000 }).should('be.visible');
        cy.get('#OnboardingWizardNext').contains('Generate').click();
        cy.contains('secret_key_id', { timeout: 60000 }).should('be.visible');
        cy.contains('install.sh').should('be.visible');
        cy.get('#OnboardingWizardTerminate').contains('Go to workspace').click();
        cy.get('#workspaceMenuButton', { timeout: 30000 }).contains(workspaceName);
      });
    });
  });

});
