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

Cypress.Commands.add("fillSignupForm", (url, userName, userEmail, userPassword, useSignupLink=false) => {
    cy.visit(url, {failOnStatusCode: false});
    if (useSignupLink) {
        cy.contains('Don\'t have an account? Sign up').click();
    }
    if (userEmail) {
        cy.get('#email', { timeout: 5000 }).type(userEmail);
    }
    cy.get('#name', { timeout: 5000 }).type(userName);
    cy.get('#password').type(userPassword);
    cy.get('#repeat').type(userPassword);
    cy.get('#terms').click();
    cy.get('#signupButton').should('not.be.disabled').click();
})

Cypress.Commands.add("getVerificationUrl", (emailIndex, destination, redirect) => {
    let url = `https://${destination}/testonlyverification?index=${emailIndex}`;
    if (redirect) {
        url = `https://${destination}/testonlyverification?index=${emailIndex}&redirect=${redirect}`
    }
    return cy.request({
        method: 'GET',
        url
    }).then((response) => response.body);
})

Cypress.Commands.add("getInviteUrl", (emailIndex, rEmailIndex, destination) => {
    // Wait for eventual consistency on the invitation API
    cy.wait(8000);
    return cy.request({
        method: 'GET',
        url: `https://${destination}/testonlyinvite?index=${emailIndex}&rindex=${rEmailIndex}`
    }).then((response) => response.body);
})

Cypress.Commands.add("getInviteUrlFromUrl", (emailIndex, url, destination) => {
    // Wait for eventual consistency on the invitation API
    cy.wait(8000);
    return cy.request({
        method: 'GET',
        url: `https://${destination}/testonlyinvite?index=${emailIndex}&url=${encodeURIComponent(url)}`
    }).then((response) => response.body);
})

Cypress.Commands.add("signIn", (url, userEmail, userPassword) => {
    if (url) {
        cy.visit(url, {failOnStatusCode: false});
    } else {
        // Prevent typing in before on new page
        cy.contains('Sign In', {timeout: 8000});
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
    cy.get('#OnboardingWizardNext').click();
    // Verify the sign out happened before allow Cypress to continue
    cy.get('#username', { timeout: 5000 });
})

Cypress.Commands.add("createCommentImmediate", (description) => {
    cy.get('#Bugs').click();
    cy.get('#newMarketTodo').click();
    cy.wait(1000);
    // focus is not reliable in React so have to use get even though should be focussed
    cy.get('[id$=-comment-add-editor]').type(description);
    cy.get('#OnboardingWizardNext').click();
})

Cypress.Commands.add("createMarketQuestionWithOption", (description, optionDescription) => {
    cy.get('#Default' ).click();
    cy.get('#Discussion').click();
    cy.get('#newMarketQuestion').click();
    cy.wait(1000);
    // focus is not reliable in React so have to use get even though should be focussed
    cy.get('[id^=editorBox-marketComment]').type(description);
    cy.get('#OnboardingWizardNext').click();
    cy.wait(3000);
    cy.get('[id^=editorBox-addOptionWizard]', {timeout: 8000}).type(optionDescription);
    cy.get('#OnboardingWizardNext').click();
    cy.get('#QUESTIONYes', { timeout: 10000 }).should('exist');
    cy.get('#OnboardingWizardNext', { timeout: 8000 }).click();
    cy.get('#commentBox', { timeout: 8000 }).contains(optionDescription);
})

Cypress.Commands.add("replyToComment", (parentDescription, description) => {
    cy.contains('p', parentDescription, {timeout: 90000}).closest('[id^=c]').within(() => {
        cy.get('[id^=commentReplyButton]').click();
        cy.focused({ timeout: 10000 }).type(description);
    });
    cy.get('#commentSendButton').click();
});

Cypress.Commands.add("resolveComment", (description, hasWarning=false) => {
    cy.contains('p', description, {timeout: 90000}).closest('[id^=c]').within(() => {
        cy.get('[id^=commentResolveReopenButton]').click();
    });
    if (hasWarning) {
        cy.handleCommentWarning(false);
    }
});

Cypress.Commands.add("createTodo", (type, section, description) => {
    cy.get('#Todos', {timeout: 30000}).click();
    cy.get(`#${type}TodosButton`).click();
    cy.focused({ timeout: 10000 }).type(description);
    cy.get(`#${section}cabox`).within(() => {
        cy.get('#commentSendButton').click();
    });
})

Cypress.Commands.add("confirmDemoMarketInbox", () => {
    // first dismiss the workspace notification to confirm there
    cy.get('#OnboardingWizardSkip', { timeout: 30000 }).click();
    cy.get('#Default', { timeout: 30000 }).click();
    // Demo starts in swimlanes
    cy.get('#swimlanesDemoBannerText').should('exist');
    cy.get('#Inbox').click();
    // Special case the support notification as it is not from quick add like the rest
    cy.get('[id^=workListItemUNREAD_COMMENT]', { timeout: 480000 }).should('have.length', 1);
    const inboxContents = [{notification: 'UNREAD_JOB_APPROVAL_REQUEST', count: 3},
        {notification: 'UNREAD_COMMENT', count: 1}, {notification: 'UNASSIGNED', count: 1},
        {notification: 'NOT_FULLY_VOTED', count: 1}, {notification: 'REPLY_MENTION', count: 1},
        {notification: 'REVIEW_REQUIRED', count: 1}, {notification:'UNREAD_REVIEWABLE', count: 1}];
    inboxContents.forEach((content) => {
        const { notification, count } = content;
        cy.get(`[id^=workListItem${notification}]`).its('length').should('be.gte', count);
    });
})

Cypress.Commands.add("confirmDemoMarketClearedInbox", () => {
    cy.get('#Inbox').click();
    // See https://docs.cypress.io/api/commands/should#Timeouts
    cy.get('#workspaceFromDemoBanner', { timeout: 60000 }).should('not.exist');
    cy.get('[id^=workListItemREVIEW_REQUIRED]', { timeout: 60000 }).should('not.exist');
    const inboxContents = [{notification: 'UNREAD_JOB_APPROVAL_REQUEST', count: 0},
        {notification: 'UNASSIGNED', count: 0}, {notification: 'NOT_FULLY_VOTED', count: 0},
        {notification: 'REPLY_MENTION', count: 0}, {notification: 'REVIEW_REQUIRED', count: 0},
        {notification:'UNREAD_REVIEWABLE', count: 0}];
    inboxContents.forEach((content) => {
        const { notification, count } = content;
        cy.get(`[id^=workListItem${notification}]`).should('have.length', count);
    });
})

Cypress.Commands.add("navigateIntoJob", (name, isAssigned=true, sectionSelector='storiesSection') => {
    if (isAssigned) {
        cy.get('#AssignedJobs', {timeout: 30000}).click();
    } else {
        cy.get('#JobBacklog', {timeout: 30000}).click();
    }
    cy.get(`#${sectionSelector}`, {timeout: 120000}).contains(name, {timeout: 180000}).click();
})

Cypress.Commands.add("createQuestionOption", (name, description, parentDescription, doAddAnother=false,
                                              isAddAnother=false, isAuthor=true) => {
    if (!isAddAnother) {
        // Wait for the parent description to clear from the question create
        cy.wait(10000);
        cy.contains('p', parentDescription, {timeout: 90000}).closest('[id^=c]')
            .within(($div) => {
                //Try to see which element we got so can debug
                $div.css('border', '1px solid magenta');
                if (isAuthor) {
                    cy.get('[id^=approvableOption]', {timeout: 120000}).click();
                } else {
                    cy.get('[id^=proposedOption]', {timeout: 120000}).click();
                }
                $div.css('border', 'unset');
        });
    }
    cy.focused({ timeout: 10000 }).type(name);
    if (description) {
        cy.get('#editorBox-description').type(description);
    }
    if (doAddAnother) {
        cy.get('#decisionInvestibleSaveAddAnotherButton').click();
    } else {
        cy.get('#decisionInvestibleSaveButton').click();
    }
    cy.contains(name, { timeout: 8000 });
})

Cypress.Commands.add("createQuestionOptionComment", (parentDescription, optionName, type, description) => {
    cy.get(`#currentVotingChildren`, {timeout: 120000}).within(() => {
        cy.contains(optionName, {timeout: 120000}).click();
    });
    cy.contains('p', parentDescription, {timeout: 90000}).closest('[id^=c]').within(() => {
        cy.get(`#commentAddLabel${type}`).click();
        // focus is not reliable in React so have to use get even though should be focussed
        cy.get('[id$=-comment-add-editor]').type(description);
        cy.get('#commentSendButton').click();
    });
    // Click again to close
    cy.get(`#currentVotingChildren`, {timeout: 120000}).within(() => {
        cy.contains(optionName, {timeout: 120000}).click();
    });
})

Cypress.Commands.add("voteOption", (optionName, certainty, reason) => {
    cy.get(`#currentVotingChildren`, {timeout: 120000}).within(() => {
        cy.contains(optionName, {timeout: 120000}).click();
    });
    cy.vote(certainty, reason);
    // Click again to close
    cy.get(`#currentVotingChildren`, {timeout: 120000}).within(() => {
        cy.contains(optionName, {timeout: 120000}).click();
    });
})

Cypress.Commands.add("createJob", (description, assigneeName, certainty, justification,
                                   isReady, isSkipApprovals=false) => {
    cy.get('#AssignedJobs', { timeout: 10000 }).click();
    cy.get('#addJob', { timeout: 5000 }).click();
    cy.get('[id^=editorBox-addJobWizard]', { timeout: 5000 }).type(description, { timeout: 5000 });
    if (assigneeName) {
        cy.get('#OnboardingWizardNext').click();
        cy.get('#addressBook', { timeout: 5000 }).contains(assigneeName.replace('@', ' ')).click();
        if (certainty) {
            cy.get('#OnboardingWizardNext').click();
            cy.get(`#${certainty}`, { timeout: 8000 }).click();
            if (justification) {
                cy.wait(1000);
                cy.get('[id^=editorBox-newjobapproveeditor]').type(justification, { timeout: 5000 });
            }
            cy.get('#OnboardingWizardNext').click();
        } else if (isSkipApprovals) {
            cy.get('#OnboardingWizardNext').click();
            cy.get('#OnboardingWizardOtherNext').click();
        }
        else {
            cy.get('#OnboardingWizardSkip').click();
        }
    } else {
        if (isReady) {
            cy.get('#READY').click();
            cy.get('#READY').within(() => {
                cy.get('input', {timeout: 8000}).should('have.value', 'true');
            });
        } else {
            cy.get('#NOT_READY').click();
            cy.get('#NOT_READY').within(() => {
                cy.get('input', {timeout: 8000}).should('have.value', 'true');
            });
        }
        cy.get('#OnboardingWizardNext').click();
    }
    cy.get('#Overview', {timeout: 10000}).should('be.visible');

})

Cypress.Commands.add("createWorkspaceFromDemoBanner", (name, participants=[]) => {
    cy.get('#workspaceFromDemoBanner', { timeout: 10000 }).click()
    cy.get('#workspaceName').type(name);
    cy.get('#OnboardingWizardNext').click();
    // Go past Slack setup to add participants
    cy.get('#OnboardingWizardNext').click();
    if (participants.length > 0) {
        participants.forEach((participant) => {
            cy.get('#emailEntryBox').type(participant + '{enter}', {delay: 60, force: true});
        });
    }
    cy.get('#copyInviteLink', { timeout: 8000 }).should('be.visible');
    cy.get('#OnboardingWizardNext').click();
})

Cypress.Commands.add("vote", (certainty, reason, isInbox=false) => {
    cy.get(`#${certainty}`).click();
    if (reason) {
        cy.focused({ timeout: 10000 }).type(reason);
    }
    if (isInbox) {
        cy.get('#OnboardingWizardNext').click();
    } else {
        cy.get('#addOrUpdateVoteButton').click();
    }
    // Should find way to verify when done but just kludging for now
    cy.wait(10000);
})

Cypress.Commands.add("voteSuggestion", (voteFor, certainty, reason) => {
    cy.get(`#${voteFor ? 'for' : 'against'}`, { timeout: 120000 }).click();
    // This is happening too quickly to debug so add a wait
    cy.wait(2000);
    cy.vote(certainty, reason);
})

Cypress.Commands.add("editNameDescription", (currentName, newName, newDescription) => {
    cy.contains('h1', currentName, {timeout: 180000}).click();
    cy.wait(10000);
    if (newName) {
        cy.focused({ timeout: 10000 }).clear().type(newName);
    }
    if (newDescription) {
        cy.get('[id$=-body-editor]').clear().type(newDescription);
    }
    cy.get('#investibleUpdateButton').click();
    cy.wait(5000);
})

Cypress.Commands.add("verifyCollaborators", (collaborators) => {
    cy.get('#Settings').click();
    collaborators.forEach((collaborator) => {
        cy.contains(collaborator, {timeout: 180000});
    });
})

Cypress.Commands.add("createAdditionalUser", (userEmail) => {
    cy.get('#Addcollaborators', { timeout: 10000 }).click();
    cy.get('#emailEntryBox').type(userEmail);
    cy.get('#OnboardingWizardNext').click();
    cy.contains('Sent', { timeout: 8000 });
    // Go past confirmation screen
    cy.get('#OnboardingWizardNext').click();
})