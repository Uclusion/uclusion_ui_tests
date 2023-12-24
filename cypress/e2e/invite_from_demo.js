
describe('Authenticator:', function() {
    const destination = 'https://stage.uclusion.com';
    const apiDestination = 'sso.stage.api.uclusion.com/v1'
    beforeEach(function() {
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
            const userPassword = 'Testme;1';
            cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, firstUserName, firstUserEmail,
                userPassword);
            // Wait for a read on Cognito of the signup
            cy.wait(8000);
            cy.getVerificationUrl('01', apiDestination).then((url) => {
                cy.signIn(url, firstUserEmail, userPassword);
                cy.confirmDemoMarketInbox();
                cy.get('#Addcollaborators', { timeout: 10000 }).click();
                cy.get('#emailEntryBox').type(secondUserEmail);
                cy.get('#OnboardingWizardNext').click();
                cy.get('[id^=workListItemREVIEW_REQUIRED]', { timeout: 8000 }).click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('[id^=editorBox-reply]').type('Would really love your opinion @',
                    { delay: 500 });
                // First check that target user's name is correct in drop down
                cy.get(`li[data-value="${firstUserName}"]`).should('exist');
                cy.get(`li[data-value="${secondUserEmail}"]`).click();
                cy.get('#OnboardingWizardNext').click();
                // Make sure back in inbox and done with operation before click anything
                cy.get('#ForYou', { timeout: 8000 }).should('exist');
                cy.get('#Everyone').click();
                cy.navigateIntoJob('Null safety');
                cy.createSuggestion('Test that creating a suggestion works.');
                cy.get('#Everyone').click();
                return cy.url().then((url) => cy.getInviteUrlFromUrl('02', url, apiDestination))
            }).then(url => {
                cy.logOut();
                cy.fillSignupForm(url, 'Tester Two Uclusion', undefined, userPassword);
                cy.signIn(undefined, undefined, userPassword);
                cy.get('[id^=workListItemUNREAD_MENTION]', { timeout: 10000 }).should('exist');
                // Should have a help unblock but not another UNREAD_COMMENT for the suggestion
                cy.get('[id^=workListItemUNREAD_COMMENT]').should('have.length', 1);
                cy.get('[id^=linkNOT_FULLY_VOTED]', { timeout: 10000 }).click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('#inbox100').click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('#ForYou', { timeout: 10000 }).should('exist');
            });
        });
    });

});