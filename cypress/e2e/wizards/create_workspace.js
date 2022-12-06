import {deleteCognitoUser} from "../../support/fixture_management";
import {jobUser, prepareUsersForTest, wipedUser} from "../../support/testUsers";

describe('Authenticator:', function() {

  let users;
  const destination = 'https://stage.uclusion.com';
  // Step 1: setup the application state
  beforeEach(function() {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
    return prepareUsersForTest(3, 'create_workspace_onboarding')
        .then((preparedUsers) => {
        users = preparedUsers
      });
  });

  //Make screen vertically larger if want to use { scrollBehavior: false } in test for that bug
  describe('Check market creation', () => {
    it('signs up and creates template market and verifies', () => {
      const creator = users[0];
      const participants = [users[1].username, users[2].username];
      const verifySubject = 'Please verify your email address';
      const testStartDate = new Date();
      cy.fillSignupForm(`${destination}?utm_campaign=test#signup`, creator.name, creator.username,
          creator.password);
      cy.waitForEmail(creator.username, destination, verifySubject, testStartDate).then((url) => {
        cy.signIn(url, creator.username, creator.password);
        cy.createAndTourWorkspace('UI Smoke', 'MarlboroMen', participants);
      });
    });
  });

});