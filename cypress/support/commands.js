// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("fillSignupForm", (url, userName, userEmail, userPassword) => {
    cy.visit(url, {failOnStatusCode: false});
    cy.get('#name', { timeout: 5000 }).type(userName);
    if (userEmail) {
        cy.get('#email').type(userEmail);
    }
    cy.get('#password').type(userPassword);
    cy.get('#repeat').type(userPassword);
    cy.get('#terms').click();
    cy.get('#signupButton').should('not.be.disabled').click();
})

Cypress.Commands.add("waitForEmail", (userEmail, destination, subject, testStartDate) => {
    return cy.task("gmail:check", {
        from: "support@uclusion.com",
        to: userEmail,
        subject,
        after: testStartDate,
        include_body: true
    }).then(emails => {
        assert.isNotNull(emails, 'No email returned');
        assert.isNotEmpty(emails, 'Email was not found');
        assert.lengthOf(emails, 1, 'Too many emails - maybe concurrent tests');
        const searchString = emails[0].body.html;
        const begin = searchString.indexOf(`href="${destination}`) + 6;
        const end = searchString.indexOf('"', begin);
        return searchString.substring(begin, end);
    });
})

Cypress.Commands.add("signIn", (url, userEmail, userPassword) => {
    if (url) {
        cy.visit(url, {failOnStatusCode: false});
    } else {
        // Prevent typing in before on new page
        cy.contains('Sign In');
    }
    if (userEmail) {
        cy.get('#username', {timeout: 5000}).type(userEmail);
    }
    cy.get('#password').type(userPassword);
    cy.get('#signinButton').click();
})

Cypress.Commands.add("logOut", () => {
    cy.get('#identityButton').click();
    cy.get('#signoutButton').click();
    // Verify the sign out happened before allow Cypress to continue
    cy.get('#username', { timeout: 5000 });
})

Cypress.Commands.add("takeInvitedTour", (isCreator) => {
    // Need the timeouts because market can still be loading
    if (!isCreator) {
        cy.get('[title=Next]', { timeout: 8000 }).click();
    }
    cy.get('[title=Close]', { timeout: 8000 }).first().click();
})

Cypress.Commands.add("createAndTourWorkspace", () => {
    cy.get('#Channel', { timeout: 20000 }).click();
    cy.get('#workspaceName').type('Workspace created from UI tests');
    cy.get('#OnboardingWizardFinish').click();
    cy.takeInvitedTour(true);
})

Cypress.Commands.add("createAdditionalUser", (destination, userEmail, invitingUserName, userName,
                                              userPassword) => {
    const testStartDate = new Date();
    const inviteSubject = `${invitingUserName} invites you to a Uclusion channel`;
    cy.get('#AddCollaborators').click();
    cy.get('#email1').should('not.be.disabled').type(userEmail, {force: true});
    cy.get('#addressAddSaveButton').should('not.be.disabled').click();
    cy.get('#emailsSentList', { timeout: 10000 }).contains(userEmail);
    cy.logOut();
    cy.waitForEmail(userEmail, `${destination}/invite`, inviteSubject, testStartDate).then((url) =>{
        cy.fillSignupForm(url, userName, undefined, userPassword);
        cy.signIn(undefined, undefined, userPassword);
        cy.takeInvitedTour(false);
    });
})