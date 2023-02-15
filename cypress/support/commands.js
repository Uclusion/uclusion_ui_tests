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

import {cleanAccount} from "./fixture_management";

Cypress.Commands.add("cleanAccount", (userConfiguration) => {
    return cleanAccount(userConfiguration);
})

Cypress.Commands.add("fillSignupForm", (url, userName, userEmail, userPassword, useSignupLink=false) => {
    cy.visit(url, {failOnStatusCode: false});
    if (useSignupLink) {
        cy.contains('Don\'t have an account? Sign up').click();
    }
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
    }, { timeout: 360000 }).then(emails => {
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
    // Verify the sign out happened before allow Cypress to continue
    cy.get('#username', { timeout: 5000 });
})

Cypress.Commands.add("takeTour", (hasNext=false, extraWaitTime=0) => {
    // Need the timeouts because market can still be loading
    if (hasNext) {
        cy.wait(1000);
        cy.get('[title=Next]', { timeout: 10000 }).click();
    }
    cy.wait(1000);
    cy.get('[title=Close]', { timeout: 10000+extraWaitTime }).first().click();
})

Cypress.Commands.add("sendComment", (hasWarning=false, hasTour=true, isRestricted) => {
    cy.get('#commentSendButton').click();
    if (hasWarning) {
        cy.handleCommentWarning(hasTour, isRestricted);
    }
})

Cypress.Commands.add("handleCommentWarning", (hasTour=true, isRestricted) => {
    if (isRestricted === undefined) {
        cy.get('#issueProceedButton', {timeout: 5000}).click();
    } else if (isRestricted) {
        cy.get('#proceedRestrictedButton', {timeout: 5000}).click();
    } else {
        cy.get('#proceedNormalButton', {timeout: 5000}).click();
    }
    if (hasTour) {
        cy.takeTour();
    } else {
        cy.wait(5000);
    }
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
    cy.get('#Questions').click();
    cy.get('#newMarketQuestion').click();
    cy.wait(1000);
    // focus is not reliable in React so have to use get even though should be focussed
    cy.get('[id^=editorBox-marketCommentDiscussionCommentAdd]').type(description);
    cy.get('#OnboardingWizardNext').click();
    cy.wait(3000);
    cy.get('[id^=editorBox-addOptionWizard]').type(optionDescription);
    cy.get('#OnboardingWizardNext').click();
    cy.wait(1000);
    cy.get('#OnboardingWizardNext').click();
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

Cypress.Commands.add("createJob", (description, assigneeName, certainty,
                                   justification,
                                   isReady) => {
    cy.get('#AssignedJobs', { timeout: 5000 }).click();
    cy.url().then(url => {
        cy.get('#addJob', { timeout: 5000 }).click();
        cy.get('[id^=editorBox-addJobWizard]', { timeout: 5000 }).type(description, { timeout: 5000 });
        if (assigneeName) {
            cy.get('#OnboardingWizardNext').click();
            cy.get('#addAssignment', { timeout: 5000 }).type(assigneeName + '{enter}',
                {delay: 60, force: true});
            if (certainty) {
                cy.get('#OnboardingWizardNext').click();
                cy.get(`#${certainty}`, { timeout: 5000 }).click();
                if (justification) {
                    cy.wait(1000);
                    cy.get('[id$=-newjobapproveeditor]').type(justification, { timeout: 5000 });
                }
                cy.get('#OnboardingWizardNext').click();
            } else {
                cy.get('#OnboardingWizardSkip').click();
            }
        } else {
            cy.get('#OnboardingWizardSkip').click();
        }
        cy.get('#Overview', {timeout: 10000}).should('be.visible');
        if (isReady) {
            cy.get('#readyToStartCheckbox').click();
            cy.get('#readyToStartCheckbox').within(() => {
                cy.get('input', {timeout: 8000}).should('have.value', 'true');
            });
        }
    });
})

Cypress.Commands.add("createAndTourWorkspace", (name, participants=[]) => {
    cy.get('#workspaceName', { timeout: 8000 }).type(name);
    cy.get('#OnboardingWizardNext').click();
    cy.get('#inviteLinker', { timeout: 8000 }).should('be.visible');
    if (_.isEmpty(participants)) {
        cy.get('#OnboardingWizardNext').click();
    } else {
        participants.forEach((participant) => {
            cy.get('#emailEntryBox').type(participant + '{enter}', {delay: 60, force: true});
        });
        cy.get('#OnboardingWizardNext').click();
    }
})

Cypress.Commands.add("vote", (certainty, reason) => {
    cy.get(`#${certainty}`).click();
    if (reason) {
        cy.focused({ timeout: 10000 }).type(reason);
    }
    cy.get('#addOrUpdateVoteButton').click();
    // Should find way to verify when done but just kludging for now
    cy.wait(10000);
})

Cypress.Commands.add("voteSuggestion", (voteFor, certainty, reason, hasTour=false) => {
    if (hasTour) {
        cy.get('[title=Close]', { timeout: 120000 }).first().click();
    }
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

Cypress.Commands.add("waitForInvite", (destination, userEmail, invitingUserName, userName,
                                              userPassword, doTour=false) => {
    const testStartDate = new Date();
    // Running in parallel so the email might have been sent before we got here
    testStartDate.setMinutes(testStartDate.getMinutes() - 2);
    const inviteSubject = `${invitingUserName} invites you to collaborate`;
    cy.waitForEmail(userEmail, `${destination}/invite`, inviteSubject, testStartDate).then((url) =>{
        cy.fillSignupForm(url, userName, undefined, userPassword);
        cy.signIn(undefined, undefined, userPassword);
        if (doTour) {
            cy.takeTour(true);
        }
    });
})

Cypress.Commands.add("waitForInviteAndTour", (destination, userEmail, invitingUserName, userName,
                                              userPassword) => {
    cy.waitForInvite(destination, userEmail, invitingUserName, userName, userPassword, true);
})

Cypress.Commands.add("verifyCollaborators", (collaborators) => {
    cy.get('#Settings').click();
    collaborators.forEach((collaborator) => {
        cy.contains(collaborator, {timeout: 180000});
    });
})

Cypress.Commands.add("waitForReviewStage", () => {
    // Better way is to come in through inbox but for now just wait for in right stage
    cy.contains('Review Report', {timeout: 90000});
})

Cypress.Commands.add("nextStage", () => {
    cy.get('#stageChangeActionButton').click();
});

Cypress.Commands.add("createAdditionalUser", (userEmail) => {
    cy.get('#Addcollaborators').click();
    cy.get('#emailEntryBox').type(userEmail);
    cy.get('#OnboardingWizardNext').click();
})