const url = 'http://localhost:4000';
describe('Creates a new channel', function() {
    beforeEach(function() {
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from failing the test
            return false;
        });
    });

    const apiConfig = {
        baseURL: 'https://dev.api.uclusion.com/v1',
        websocketURL: 'wss://dev.ws.uclusion.com/v1',
        username: 'tuser+04@uclusion.com',
        password: 'Testme;1',
    };

    describe('Onboarding 1 creation', () => {
        it('receive invite 1 for onboarding market', () => {
            cy.cleanAccount(apiConfig);
            cy.signIn(url, apiConfig.username, apiConfig.password);

            cy.wait(5000);
        });
    });

});