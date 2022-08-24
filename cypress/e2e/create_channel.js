const url = 'http://localhost:3000';
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
        username: 'testeruclusion@gmail.com',
        password: 'Uclusi0n_test',
    };

    describe('', () => {
        it('receive invite 1 for onboarding market', () => {
            cy.cleanAccount(apiConfig);
            cy.signIn(url, apiConfig.username, apiConfig.password);

            cy.wait(5000);
        });
    });

});