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
    }, { timeout: 180000 }).then(emails => {
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
    cy.get('#signinButton').should('not.be.disabled').click();
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

Cypress.Commands.add("createComment", (type, description, hasWarning=false, hasTour=true) => {
    cy.get(`#commentAddLabel${type}`).click();
    cy.focused().type(description);
    cy.get('#commentSaveButton').click();
    if (hasWarning) {
        cy.get('#issueProceedButton', { timeout: 5000 }).click();
        if (hasTour) {
            cy.get('[title=Close]', { timeout: 10000 }).first().click();
        }
    }
})

Cypress.Commands.add("navigateIntoJob", (name) => {
    cy.get('#Jobs', {timeout: 30000}).click();
    cy.get('#swimLanesChildren').contains(name, {timeout: 30000}).click();
})

Cypress.Commands.add("createQuestionOption", (name, description, isFirst, doAddAnother=false,
                                              isAddAnother=false) => {
    if (!isAddAnother) {
        if (isFirst) {
            cy.get('[id^=inlineAdd]', {timeout: 5000}).click();
        } else {
            cy.get('[title="New approvable option"]', {timeout: 10000}).click();
        }
    }
    cy.focused().type(name);
    if (description) {
        cy.get('[id$=-newInvestible]').type(description);
    }
    if (doAddAnother) {
        cy.get('#decisionInvestibleSaveAddAnotherButton').click();
    } else {
        cy.get('#decisionInvestibleSaveButton').click();
    }
    cy.get('#currentVotingChildren', { timeout: 8000 }).contains(name);
})

Cypress.Commands.add("createJob", (name, description, assigneeName, certainty, justification) => {
    cy.get('#AddJob', { timeout: 5000 }).click();
    if (name) {
        cy.focused().type(name);
    }
    if (assigneeName) {
        cy.get('#addAssignment').type(assigneeName + '{enter}', {delay: 60});
    }
    cy.url().then(url => {
        const begin = url.indexOf('dialog') + 7;
        const end = url.indexOf('#');
        const marketId = end > 0 ? url.substring(begin, end) : url.substring(begin);
        if (description) {
            cy.get(`#editorBox-${marketId}-planning-inv-add`).type(description);
        }
        if (certainty) {
            cy.get(`input[value=${certainty}]`).click();
        }
        if (justification) {
            cy.get(`#editorBox-${marketId}-add-initial-vote`).type(justification);
        }
        cy.get('#planningInvestibleAddButton').click();
        cy.get('#Description', {timeout: 10000}).should('be.visible');
    });
})

Cypress.Commands.add("createAndTourWorkspace", (channeName) => {
    cy.get('#Channel', { timeout: 20000 }).click();
    cy.get('#workspaceName').type(channeName);
    cy.get('#OnboardingWizardFinish').click();
    cy.takeInvitedTour(true);
})

Cypress.Commands.add("waitForInviteAndTour", (destination, userEmail, invitingUserName, userName,
                                              userPassword) => {
    const testStartDate = new Date();
    // Running in parallel so the email might have been sent before we got here
    testStartDate.setMinutes(testStartDate.getMinutes() - 2);
    const inviteSubject = `${invitingUserName} invites you to a Uclusion channel`;
    cy.waitForEmail(userEmail, `${destination}/invite`, inviteSubject, testStartDate).then((url) =>{
        cy.fillSignupForm(url, userName, undefined, userPassword);
        cy.signIn(undefined, undefined, userPassword);
        cy.takeInvitedTour(false);
    });
})

Cypress.Commands.add("verifyCollaborators", (collaborators) => {
    cy.get('#Discussion').click();
    collaborators.forEach((collaborator) => {
        cy.contains(collaborator, {timeout: 180000});
    });
})

Cypress.Commands.add("createAdditionalUser", (userEmail) => {
    cy.get('#AddCollaborators').click();
    cy.get('#email1').should('not.be.disabled').type(userEmail, {force: true});
    cy.get('#addressAddSaveButton').should('not.be.disabled').click();
    cy.get('#emailsSentList', { timeout: 10000 }).contains(userEmail);
})