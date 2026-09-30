
describe('Authenticator:', function() {
  const destination = 'https://stage.uclusion.com';
  const apiDestination = 'sso.stage.api.uclusion.com/v1'

  beforeEach(function() {
    // https://github.com/cypress-io/cypress/issues/1208
    indexedDB.deleteDatabase('localforage');
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  //Make screen vertically larger if want to use { scrollBehavior: false } in test for that bug
  describe('Check market creation', () => {
    it('signs up and creates template market and verifies', () => {
      const firstUserEmail = 'tuser+03@uclusion.com';
      const firstUserName = 'Tester Three Uclusion';
      const secondUserEmail = 'tuser+04@uclusion.com';
      const thirdUserEmail = 'tuser+05@uclusion.com';
      const userPassword = 'Testme;1';
      const questionText = 'Did you receive this question?';
      const optionText = 'This is your option to vote for';
      const jobName = 'Creating this story to test placeholder gets it';
      const reviewJobName = 'Job getting a review on.';
      const blockingIssue = 'This is my issue with this progress.';
      const reportText = 'This is my report yea!';
      const taskText = 'Root task for sub task resolve.';
      const subTaskText = 'This sub task gets resolved directly.';
      const linkedTaskText = 'Task an approval links to.';
      const voteReason = 'My vote for option reason.';
      const thirdUserEmailNamePart = thirdUserEmail.substring(0, thirdUserEmail.indexOf('@'));
      cy.fillSignupForm(`${destination}?utm_campaign=team&market_sub_type=TEST#signup`,
          firstUserName, firstUserEmail,
          userPassword);
      // Grant clipboard permissions to avoid errors when copying invite link
      cy.grantClipboardPermissions();
      // Wait for a read on Cognito of the signup that just happened to work
      cy.wait(8000);
      cy.getVerificationUrl('03', apiDestination).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.confirmDemoMarketInbox(true);
        // Next message opens a direct job link or a single-notification page.
        cy.get('#nextNavigation').click();
        cy.location('pathname').should('match', /^\/(dialog\/[^/]+\/[^/]+|inbox\/[^/]+)$/);
        cy.location('href').then((firstMessageUrl) => {
          cy.get('#nextNavigation').click();
          cy.location('href').should('not.eq', firstMessageUrl);
          cy.location('pathname').should('match', /^\/(dialog\/[^/]+\/[^/]+|inbox\/[^/]+)$/);
        });
        cy.get('#inboxId').click();
        // Open the notified reply, promote it to a task, then move it to a new job.
        cy.get('[id^=workListItemUNREAD_REPLY]', { timeout: 10000 }).first().invoke('attr', 'id')
          .then((rowId) => {
            const replyId = rowId.substring('workListItemUNREAD_REPLY_'.length);
            cy.get(`#${rowId}`).click();
            cy.get(`#c${replyId} #storyFromComment`, { timeout: 10000 }).click();
            cy.get(`#moveTask${replyId}`).click();
            cy.get(`#c${replyId} [id^=moveComment]`, { timeout: 10000 }).click();
            cy.get(`#moveTask${replyId}`).click();
          });
        cy.get('#OnboardingWizardNext').click();
        cy.get('#READY').click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('#readyToStartCheckbox',  {timeout: 10000}).should('exist');
        cy.get('#inboxId').click();
        cy.createWorkspace('UI Smoke');
        // Check that inbox clears of demo notifications
        cy.confirmDemoMarketClearedInbox();
        cy.createMarketQuestionWithOption(questionText, optionText);
        cy.get('#Compose').click();
        cy.get('#typeTODO').click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('[id^=editorBox-addBugCommentAddBug]').type('This is my critical bug.');
        cy.get('#OnboardingWizardNext').click();
        cy.createJob(reviewJobName, firstUserName, undefined, undefined, undefined, true, true);
        cy.get('#Engineering').click();
        cy.navigateIntoJob(reviewJobName);
        cy.get('#Overview').contains('Overview').click();
        cy.get('#reportsToggleId').click();
        cy.get('#newReport').click();
        cy.get('[id^=editorBox-jobCommentREPORTJobCommentAdd]').type(reportText);
        cy.get('#OnboardingWizardNext').click();
        cy.get('[id^=commentReplyButton]', {timeout: 10000}).should('be.visible');
        cy.contains(reportText, {timeout: 10000}).should('be.visible');
        // B-all-552: resolving a sub task promotes it to a resolved top level task
        cy.get('#newTask').click();
        cy.get('[id^=editorBox-jobCommentTODOJobCommentAdd]', {timeout: 10000}).type(taskText);
        cy.get('#OnboardingWizardNext').click();
        cy.contains(taskText, {timeout: 30000}).should('be.visible');
        // On your own task the reply button is the Grouped drop down (J-all-392) whose
        // Task item opens the reply wizard - no #commentSendButton in this flow
        cy.contains('p', taskText, {timeout: 30000}).closest('[id^=c]').within(() => {
          cy.get('[id^=commentReplyButton]').click();
        });
        cy.get('[id^=groupedTask]', {timeout: 10000}).click();
        cy.wait(1000);
        // focus is not reliable in React so have to use get even though should be focussed
        cy.get('[id^=editorBox-replyCommentAddReply]', {timeout: 10000}).type(subTaskText);
        cy.get('#OnboardingWizardNext').click();
        cy.get('[id^=subTaskResolve]', {timeout: 30000}).click();
        cy.get('[id^=subTaskResolve]').should('not.exist');
        // Comment creation leaves the job on the tasks section; the resolved list
        // asserted below is in the Overview's condensed todos
        cy.get('#Overview').contains('Overview').click();
        cy.get('#investibleCondensedTodos', {timeout: 10000}).within(() => {
          cy.contains('Resolved').click();
          cy.contains(subTaskText, {timeout: 30000}).should('be.visible');
        });
        cy.get('#Addcollaborators').click();
        // If switch to Chrome then try realClick() below
        cy.get('#copyInviteLink').click();
        return cy.window().then((win) => {
          return win.navigator.clipboard.readText();
        });
      }).then(inviteUrl => {
        cy.log(`clip board variable is ${inviteUrl}`);
        cy.logOut();
        cy.fillSignupForm(inviteUrl, 'Tester Four Uclusion', secondUserEmail, userPassword);
        // Wait for a read on Cognito of the signup that just happened to work
        cy.wait(8000);
        cy.getVerificationUrl('04', apiDestination, inviteUrl.substring(destination.length + 1));
      }).then((url) => {
        cy.signIn(url, secondUserEmail, userPassword);
        // J-all-400 (C-all-1505): invited users get the AI first offer before the tour
        cy.contains('Connect your AI', { timeout: 60000 }).should('be.visible');
        cy.get('#OnboardingWizardTerminate').click();
        // Will be on workspace notification
        cy.get('#Engineering', { timeout: 30000 }).click();
        cy.get('#NotesDiscussion', { timeout: 60000 }).contains('Notes').click();
        cy.get('#commentBox', { timeout: 120000 }).contains(optionText, { timeout: 60000 });
        cy.get('#approvalButton').click();
        cy.vote(75, voteReason, true);
        cy.get('#approvals', {timeout: 10000}).should('be.visible');
        cy.contains('[id^=cv]', voteReason, {timeout: 10000}).should('be.visible');
        cy.createAdditionalUser(thirdUserEmail);
        cy.get('#Engineering').click();
        cy.get('#endEngineering').click();
        cy.get('#manageMembersId').click();
        // add third user to Engineering view
        cy.get('#addressBook').within(()=> {
          cy.get('li').filter(':visible').contains(thirdUserEmailNamePart).click();
        });
        cy.get('#participantAddButton').click();
        cy.get('#viewMembersList').within(() => {
          cy.contains(thirdUserEmailNamePart, { timeout: 30000 }).should('be.visible');
        });
        // go into the job to create this blocking issue since not a member of this view
        cy.get('#Engineering').click();
        cy.navigateIntoJob(reviewJobName);
        cy.get('#Debatable').click();
        cy.get('#newISSUE').click();
        cy.focused({ timeout: 10000 }).type(blockingIssue);
        cy.get('#OnboardingWizardNext').click();
        // Decision of send to team or not
        cy.get('#ISSUEYes', {timeout: 10000}).should('be.visible');
        cy.get('#OnboardingWizardNext').click();
        cy.get('#newISSUE', {timeout: 10000}).should('be.visible');
        // add a story for second user with vote
        cy.get('#Engineering').click();
        cy.createJob(jobName, thirdUserEmail, 75);
        // J-all-486: this approval links to a task on its own job, for the third user to follow below
        cy.get('#Overview').contains('Overview').click();
        cy.get('#newTask').click();
        cy.get('[id^=editorBox-jobCommentTODOJobCommentAdd]', {timeout: 10000}).type(linkedTaskText);
        cy.get('#OnboardingWizardNext').click();
        cy.contains('p:visible', linkedTaskText, {timeout: 30000}).parents()
          .filter((index, element) => /^c[0-9a-f-]{36}$/.test(element.id)).first().invoke('attr', 'id')
          .then((taskAnchor) => {
            cy.location().then((location) => {
              const taskUrl = `${location.origin}${location.pathname}#${taskAnchor}`;
              cy.get('#Overview').contains('Overview').click();
              cy.get('[id^=cv]', {timeout: 10000}).click();
              // A pasted link to this site becomes a named link, as when a person pastes one
              cy.get('[id^=editorBox-jobapproveeditor] .ql-editor', {timeout: 10000}).click().then(($editor) => {
                const win = $editor[0].ownerDocument.defaultView;
                const clipboardData = new win.DataTransfer();
                clipboardData.setData('text/plain', taskUrl);
                $editor[0].dispatchEvent(new win.ClipboardEvent('paste',
                  {bubbles: true, cancelable: true, clipboardData}));
              });
              cy.get('[id^=editorBox-jobapproveeditor] .ql-editor a').should('have.attr', 'href', taskUrl);
              // The editor debounces its change callback by 50ms before updating the approval form.
              cy.wait(100);
              cy.get('#OnboardingWizardNext').click();
              cy.get('[id^=cv] a', {timeout: 30000}).should('be.visible');
            });
          });
        cy.logOut();
        cy.wait(8000);
        return cy.getInviteUrl('05', '03', apiDestination);
      }).then((url) => {
        cy.log(`invite url variable is ${url}`);
        cy.fillSignupForm(url, 'Tester Five Uclusion', undefined, userPassword);
        // Not requiring a third entry of the password here would be nice - have put in a when convenient for it
        cy.signIn(undefined, undefined, userPassword);
        cy.get('#Engineering', { timeout: 30000 }).click();
        cy.navigateIntoJob(jobName);
        // Have to use wait here because otherwise contains can find the inbox not visible or job visible
        cy.wait(10000);
        cy.get('#Overview').contains('Overview').click();
        cy.get('span').filter(':visible').contains('Certain');
        // J-all-486: following that link in someone else's approval, header Back returns to the approval
        cy.location('pathname').then((jobPath) => {
          cy.get('[id^=cv] a:visible').first().click();
          // The task opens in the tasks section, which hides the Overview and its approvals
          cy.get('[id^=cv] a:visible', {timeout: 10000}).should('not.exist');
          cy.get('#backNavigation').click();
          cy.location('pathname').should('eq', jobPath);
          cy.get('[id^=cv] a:visible', {timeout: 10000}).should('have.length', 1);
        });
        cy.get('#inboxId').click();
        // We are a member of this view so should get the critical bugs
        cy.get('[id^=workListItemUNASSIGNED]').click();
        // J-all-392: Move is a drop down carrying the old first step's choices
        cy.get('[id^=moveComment]').click();
        cy.get('[id^=moveNewJob]').click();
        cy.get('#OnboardingWizardNext').click();
        cy.get('#Overview', {timeout: 10000}).should('be.visible');
        cy.get('#inboxId').click();
        cy.get('[id^=linkUNREAD_JOB_APPROVAL_REQUEST]').contains(reviewJobName).click();
        cy.vote(75, 'My vote for take job reason.', true);
        cy.get('span').filter(':visible').contains('Certain');
        cy.get('#inboxId').click();
        cy.get('[id^=workListItemUNREAD_COMMENT]').contains(blockingIssue).click();
        cy.contains(blockingIssue, {timeout: 10000}).click();
        // J-all-392: Convert to bug now runs straight from the Move drop down
        cy.get('[id^=moveComment]').click();
        cy.get('[id^=moveBug]').click();
        cy.get('#Bugs', { timeout: 30000 }).should('be.visible');
      });
    });
  });

});
