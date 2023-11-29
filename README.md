# Uclusion UI Tests

## Test signup approach
https://developers.google.com/identity/protocols/oauth2/resources/oob-migration - seems to have broken 
[GMail Tester](https://github.com/levz0r/gmail-tester) node module which wasn't very supported anyway.

Could do 
[roll your own api](https://docs.cypress.io/guides/end-to-end-testing/google-authentication) but with
https://www.cypress.io/blog/2022/04/25/cypress-9-6-0-easily-test-multi-domain-workflows-with-cy-origin now available
can more easily login as test user in GMail as part of the script.

EXCEPT https://github.com/lirantal/cypress-social-logins - Doesn't work from CI environments because the
different IP addresses will make Google invoke CAPTCHA - see disclaimer at top.

Therefore, could try https://filiphric.com/google-sign-in-with-cypress and see if the tokens generated work with GMail Tester.
If not then have to follow his directions to do without GMail Tester but that is 2022 so might run into the OOB thing.

**Skip the GMail altogether.** Do the Uclusion signup form and then get the link from within Cypress
by hitting a Uclusion test API that returns the link for that user. That means will have to test various flows manually
or using Cypress locally but that is unavoidable since cannot do the non email ones already. IE the API only works for 
emails that begin with tuser and end with uclusion.com and then returns the URL from 

`utils.verification_utils.send_verification_email`

that's good enough as spoofing one of them is harmless, and you get charged eventually anyway.