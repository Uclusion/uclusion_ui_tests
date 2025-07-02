
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

    describe('Check demo market creation', () => {
        it('signs up and creates template market and verifies', () => {
            const firstUserEmail = 'tuser+01@uclusion.com';
            const firstUserName = 'Tester One Uclusion';
            const secondUserEmail = 'tuser+02@uclusion.com';
            const secondUserName = 'Tester Two Uclusion';
            const userPassword = 'Testme;1';
            const suggestionText = 'Test a suggestion for @';
            cy.fillSignupForm(`${destination}?utm_campaign=solo#signup`, firstUserName, firstUserEmail,
                userPassword);
            // Wait for a read on Cognito of the signup
            cy.wait(8000);
            cy.getVerificationUrl('01', apiDestination).then((url) => {
                cy.signIn(url, firstUserEmail, userPassword);
                cy.confirmDemoMarketInbox(false);
                cy.createAdditionalUser(secondUserEmail);
                cy.get('#3work').click();
                cy.navigateIntoJob('Region based memory management for garbage collection.');
                cy.get('#Assistance').click();
                cy.get('#newQUESTION').click();
                cy.get('[id^=editorBox-jobCommentQUESTIONJobCommentAdd]')
                    .type('Tell me something? Would really love your opinion @', { delay: 500 });
                // First check that target user's name is correct in drop down
                cy.get(`li[data-value="${firstUserName}"]`).should('exist');
                cy.get(`li[data-value="${secondUserEmail}"],li[data-value="${secondUserName}"]`).click();
                cy.get('#OnboardingWizardOtherNext').click();
                // Make sure done with operation before click anything
                cy.get('#Assistance', { timeout: 20000 }).should('exist');
                cy.get(`[data-value="${secondUserEmail}"]`, { timeout: 8000 });
                cy.get('#3work').click();
                cy.navigateIntoJob('Null safety');
                cy.get('#Assistance').click();
                cy.get('#newSUGGEST').click();
                cy.focused({ timeout: 8000 }).type(suggestionText, { delay: 500 });
                // mention so that suggestion will generate a notification
                cy.get(`li[data-value="${secondUserEmail}"],li[data-value="${secondUserName}"]`).click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('#Assistance', { timeout: 20000 }).should('exist');
                cy.get('#3work').click();
                return cy.url().then((url) => cy.getInviteUrlFromUrl('02', url, apiDestination))
            }).then(url => {
                cy.logOut();
                cy.fillSignupForm(url, secondUserName, undefined, userPassword);
                cy.signIn(undefined, undefined, userPassword);
                // first dismiss the workspace notification
                cy.get('#3work', { timeout: 30000 }).click();
                cy.get('#swimlanesDemoBannerText', { timeout: 10000 }).should('exist');
                cy.get('#Inbox').click();
                // for mention in question - two of these ISSUE so use contains
                cy.get('[id^=workListItemISSUE]', { timeout: 10000 }).contains('love')
                    .should('exist');
                // Special case the support notification as it is not from quick add like the rest
                cy.get('[id^=workListItemUNREAD_COMMENT]', { timeout: 60000 })
                    .should('have.length', 1);
                cy.get('[id^=linkNOT_FULLY_VOTED]', { timeout: 30000 }).contains(suggestionText).click();
                cy.get('[id^=voteFor]', { timeout: 10000 }).click();
                cy.get('#100').click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('#ForYou', { timeout: 10000 }).should('exist');
            });
        });
    });

});