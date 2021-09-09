
describe('Authenticator:', function() {
  const destination = 'https://stage.uclusion.com';
  // Step 1: setup the application state
  beforeEach(function() {

  });

  describe('Check market creation', () => {
    it('signs up and creates template market and verifies', () => {
      const testStartDate = new Date();
      cy.visit(`${destination}?utm_campaign=test#signup`);
      cy.get('#name').type('Tester Uclusion');
      cy.get('#email').type('tuser@uclusion.com');
      cy.get('#password').type('Testme;1');
      cy.get('#repeat').type('Testme;1');
      cy.get('#terms').click();
      cy.get('#signupButton').click();
      // Make the 🧙‍ happen!
      cy.task("gmail:check", {
        from: "support@uclusion.com",
        to: "tuser@uclusion.com",
        subject: "Please verify your email address",
        after: testStartDate,
        include_body: true
      }).then(emails => {
        assert.isNotNull(emails, 'No email returned');
        assert.isNotEmpty(emails, 'Email was not found');
        assert.lengthOf(emails, 1, 'Too many emails - maybe concurrent tests');
        const searchString = emails[0].body.html;
        const begin = searchString.indexOf(`href="${destination}`) + 6;
        const end = searchString.indexOf('"', begin);
        const url = searchString.substring(begin, end);
        cy.visit(url, {failOnStatusCode: false});
        cy.get('#username').type('tuser@uclusion.com');
        cy.get('#password').type('Testme;1');
        cy.get('#signinButton').click();
        //TODO create template market and verify by doing tour
        //TODO invite someone to the template market and have them signup and verify in when tour works
        //TODO sign out at the end so that don't collide with other tests
      });
    });
  });

});