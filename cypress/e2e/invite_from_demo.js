
describe('Authenticator:', function() {
    const destination = 'https://stage.uclusion.com';
    const apiDestination = 'sso.stage.api.uclusion.com/v1'
    const inboxContents = [{notification: 'UNREAD_JOB_APPROVAL_REQUEST', count: 3},
        {notification: 'ISSUE', count: 1}, {notification: 'UNASSIGNED', count: 1},
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
                inboxContents.forEach((content) => {
                    const { notification, count } = content;
                    cy.get(`[id^=workListItem${notification}]`).should('have.length', count);
                });
                cy.createAdditionalUser(secondUserEmail);
                cy.get(`[id^=workListItemREVIEW_REQUIRED]`).click();
                cy.get('#OnboardingWizardNext').click();
                cy.get('[id$=-comment-add-editor]').type('Would really love your opinion @');
                cy.get(`li[data-value="${secondUserEmail}"]`).click();
                cy.get('#commentSendButtonreply').click();
                cy.logOut();
                return cy.getInviteUrl('02', '01', apiDestination);
            }).then(url => {
                cy.fillSignupForm(url, 'Tester Two Uclusion', undefined, userPassword);
                cy.signIn(undefined, undefined, userPassword);
                cy.get('[id^=#workListItemUNREAD_MENTION]', { timeout: 10000 }).should('exist');
            });
        });
    });

});