/* eslint-disable */
import localforage from 'localforage';

describe('Authenticator:', function() {
  // Step 1: setup the application state
  beforeEach(function() {
    cy.visit('http://stage.uclusion.com');
  });

  describe('Check market creation', () => {
    it('signs in and creates market and verifies', () => {
      // Step 2: Take an action (Sign in)
      cy.get(selectors.usernameInput).type("ethan.israel@uclusion.com");
      cy.get(selectors.signInPasswordInput).type("5dpE7ykHaenW2pi");
      cy.get(selectors.signInSignInButton).contains('Sign In').click();
      cy.get('.MuiGrid-grid-md-1 > .MuiButtonBase-root > .MuiButton-label').click();
      cy.get(selectors.firstOption).contains('Document').click();
      let todayDate = Cypress.moment().format('MMM DD, YYYY');
      let marketName = 'Automate test' + todayDate;
      cy.get('#name').type(marketName);
      cy.get('.jss358 > .MuiButtonBase-root > .MuiButton-label').click();
      cy.get('.ql-editor').type("something text");
      cy.get('.jss361 > .MuiButton-label').click();
      cy.get('.jss358 > .MuiButton-outlined').click();
      cy.get('.jss801').click()
      cy.get('.jss641').click();
      cy.get(':nth-child(5) > .MuiButtonBase-root > .MuiButton-label').click();
    });
  });

});
export const selectors = {
  // Auth component classes
  usernameInput: '#username',
  signInPasswordInput: '#password',
  signInSignInButton: '.MuiButton-label',
  firstOption: '.jss344 > .MuiContainer-root > .MuiPaper-root >' +
    ' :nth-child(2) > :nth-child(1) > .MuiButtonGroup-root > :nth-child(1) > .MuiButton-label'

};
