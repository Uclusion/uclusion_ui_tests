
import {deleteCognitoUser} from "./fixture_management";

export const userPassword = 'CypressTestUser';

/**
 * Calculates the usernames for the given test
 * run given the number of users to create and the test
 * name it's using.
 * If two test files use the same testName they are _not_ parallelizable
 * @param numUsers the number of users to create
 * @param testName the name of the test we're runign
 */
export function prepareUsersForTest(numUsers, testName){
    const users = [];
    for(let i = 0; i < numUsers; i++){
        const newUser = `tuser+${testName}-${i}@uclusion.com`;
        const userDef = {
            name: `TestUser ${testName}=${i}`,
            username: newUser,
            password: userPassword,
        }
        users.push(userDef);
    }
    const promises = users.map((user) => {
        return deleteCognitoUser(user)
    });
    return Promise.all(promises)
        .then(() => {
            return users;
        });
}