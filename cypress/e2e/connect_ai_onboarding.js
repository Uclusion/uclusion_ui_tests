
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

  // J-all-400: onboarding leads with Connect AI first everywhere a workspace can be created
  describe('Check connect AI first onboarding', () => {
    it('signs up without a demo and connects AI from onboarding', () => {
      const userEmail = 'tuser+06@uclusion.com';
      const userName = 'Tester Six Uclusion';
      const userPassword = 'Testme;1';
      const workspaceName = 'AI Smoke';
      // No utm_campaign so this lands on the onboarding choice instead of a demo
      cy.fillSignupForm(`${destination}?market_sub_type=TEST#signup`, userName, userEmail,
          userPassword);
      // Wait for a read on Cognito of the signup that just happened to work
      cy.wait(8000);
      cy.getVerificationUrl('06', apiDestination).then((url) => {
        cy.signIn(url, userEmail, userPassword);
        // Brand new user with no demo gets the AI choice with all three buttons
        cy.contains('How do you want to start?', { timeout: 60000 }).should('be.visible');
        cy.get('#OnboardingWizardNext').contains('Connect AI first');
        cy.get('#OnboardingWizardTerminate').contains('Skip AI and demo');
        // See a demo first goes to the existing solo/team demo choice
        cy.get('#OnboardingWizardOtherNext').contains('See a demo first').click();
        cy.contains('Which demo would you like?', { timeout: 10000 }).should('be.visible');
        // No demo chosen, so the onboarding route returns to the AI choice. The root path
        // is not used here because it does not redirect an already signed in user.
        cy.visit(`${destination}/demo`, {failOnStatusCode: false});
        cy.contains('How do you want to start?', { timeout: 60000 }).should('be.visible');
        // Skip AI and demo goes straight to the classic name step with no AI choice repeat
        cy.get('#OnboardingWizardTerminate').click();
        cy.get('#workspaceName', { timeout: 10000 }).should('be.visible');
        cy.contains('Connect AI first').should('not.exist');
        cy.visit(`${destination}/demo`, {failOnStatusCode: false});
        cy.contains('How do you want to start?', { timeout: 60000 }).should('be.visible');
        // Connect AI first shows name input plus the install selectors and Generate
        cy.get('#OnboardingWizardNext').click();
        cy.get('#workspaceName', { timeout: 10000 }).type(workspaceName);
        cy.get('#installScopeProject').click();
        cy.get('#OnboardingWizardNext').contains('Generate').click();
        // Generate created the workspace and fetched credentials for copy-paste setup
        cy.contains('Your workspace is ready', { timeout: 60000 }).should('be.visible');
        cy.contains('secret_key_id').should('be.visible');
        cy.contains('install.sh').should('be.visible');
        cy.contains('--project').should('be.visible');
        cy.contains('uclusion codex').should('be.visible');
        cy.get('#OnboardingWizardTerminate').contains('Go to workspace').click();
        cy.get('#workspaceMenuButton', { timeout: 30000 }).contains(workspaceName);
      });
    });
  });

});
