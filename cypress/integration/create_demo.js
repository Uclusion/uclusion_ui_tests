
describe('Demo:', function() {
  const destination = 'https://stage.uclusion.com';
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
  });

  describe('Demo creation', () => {
    it('signs up and creates demo market', () => {
      const firstUserEmail = 'tuser+01@uclusion.com';
      const firstUserName = 'Awesome One';
      const secondUserEmail = 'tuser+02@uclusion.com';
      const secondUserName = 'Awesome Too';
      const thirdUserEmail = 'tuser+04@uclusion.com';
      const thirdUserName = 'Awesome More';
      const fourthUserEmail = 'tuser+03@uclusion.com';
      const fourthUserName = 'Ever Awesome';
      const userPassword = 'Testme;1';
      const jobName = 'Monitoring dashboard';
      const returnToChannel = '#DemoChannel';
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, firstUserName, firstUserEmail,
          userPassword);
      cy.waitForEmail(firstUserEmail, destination, 'Please verify your email address', new Date()).then((url) => {
        cy.signIn(url, firstUserEmail, userPassword);
        cy.createAndTourWorkspace('Demo Channel');
        cy.createAdditionalUser(secondUserEmail);
        cy.createAdditionalUser(thirdUserEmail);
        cy.createAdditionalUser(fourthUserEmail);
        cy.verifyCollaborators([secondUserName, thirdUserName, fourthUserName]);
        //Notification: unassigned job
        cy.createJob('Quantum random key', 'Generate a truly random number and seed the application with it.',
            undefined, undefined, undefined, true);
        //Notification: new approval - suggestion
        cy.createComment('SUGGEST', 'Use qRNG.', true, false, false, true);
        cy.get(returnToChannel).click();
        //Notification: new approval - job
        cy.createJob('Blog our data architecture', 'Interesting and good marketing.', firstUserName);
        cy.get(returnToChannel).click();
        //Notification: fully voted
        cy.createJob('Upgrade Material UI', 'Becoming too difficult to maintain.', firstUserName);
        cy.createComment('SUGGEST', 'Use a React for TailWind library instead.', true, true, true, true);
        cy.get(returnToChannel).click();
        cy.createJob('A crummy name', 'A crummy description.', firstUserName);
        cy.get(returnToChannel).click();
        cy.createJob('SPA level performance issues',
            'Need to reduce re-renders and slowness from background API calls.', firstUserName);
        cy.nextStage();
        cy.nextStage();
        cy.createComment('REPORT', 'Potentially endless - need feedback on how far to go.');
        cy.get(returnToChannel).click();
        //Notification: unfinished job
        cy.createJob('Updated documentation', 'A lot of the pictures are out of date.', firstUserName);
        cy.nextStage();
        cy.get(returnToChannel).click();
        cy.get('#Discussion').click();
        //Notification: comment reply
        cy.replyToComment('New environment for medium lived testing.',
            'Why not just use and selectively clean an existing environment?');
        cy.voteOption('Uclusion', 100, 'Easy enough to try.');
        cy.createComment('QUESTION', 'Testing best practices?');
        cy.createQuestionOption('Determine test ROI early', undefined, false);
        cy.navigateIntoJob(jobName);
        //Notification: resolved issue
        cy.createComment('ISSUE', 'The existing monitoring is good enough.', true);
      });
    });
  });

});