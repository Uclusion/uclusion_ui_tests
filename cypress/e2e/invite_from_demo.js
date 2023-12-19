
describe('Authenticator:', function() {
    const destination = 'https://stage.uclusion.com';
    const apiDestination = 'sso.stage.api.uclusion.com/v1'
    const inboxContents = [{notification: 'UNREAD_JOB_APPROVAL_REQUEST', count: 3},
        {notification: 'UNREAD_COMMENT', count: 1}, {notification: 'UNASSIGNED', count: 1},
        {notification: 'UNREAD_MENTION', count: 1}, {notification: 'REVIEW_REQUIRED', count: 1}];
    beforeEach(function() {
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from failing the test
            return false;
        });
    });

    describe('Check demo market creation', () => {
        it('signs up and creates template market and verifies', () => {
            const firstUserEmail = 'tuser+01@uclusion.com';
            const secondUserEmail = 'tuser+02@uclusion.com';
            const userPassword = 'Testme;1';
            cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, 'Tester One Uclusion', firstUserEmail,
                userPassword);
            // Wait for a read on Cognito of the signup
            cy.wait(8000);
            cy.getVerificationUrl('01', apiDestination).then((url) => {
                cy.signIn(url, firstUserEmail, userPassword);
                cy.get('#workspaceFromDemoBanner', { timeout: 15000 }).should('exist');
                cy.get('#Everyone', { timeout: 15000 }).should('exist');
                cy.get('[id^=workListItemREVIEW_REQUIRED]', { timeout: 30000 }).should('exist');
                inboxContents.forEach((content) => {
                    const { notification, count } = content;
                    cy.get(`[id^=workListItem${notification}]`).should('have.length', count);
                });
                cy.get('#Addcollaborators', { timeout: 10000 }).click();
                cy.get('#emailEntryBox').type(secondUserEmail);
                cy.get('#OnboardingWizardNext').click();
                cy.get('[id^=workListItemREVIEW_REQUIRED]', { timeout: 8000 }).click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('[id^=editorBox-reply]').type('Would really love your opinion @',
                    { delay: 500 });
                cy.get(`li[data-value="${secondUserEmail}"]`).click();
                cy.get('#OnboardingWizardNext').click();
                // Make sure back in inbox and done with operation before click anything
                cy.get('#ForYou', { timeout: 8000 }).should('exist');
                cy.get('#Everyone').click();
                return cy.url().then((url) => cy.getInviteUrlFromUrl('02', url, apiDestination))
            }).then(url => {
                cy.logOut();
                cy.fillSignupForm(url, 'Tester Two Uclusion', undefined, userPassword);
                cy.signIn(undefined, undefined, userPassword);
                cy.get('[id^=workListItemUNREAD_MENTION]', { timeout: 10000 }).should('exist');
            });
        });
    });

});