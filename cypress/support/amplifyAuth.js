/**
 * This is a simple wrapper around the amplify session to avoid code repetition
 */
import { Auth } from 'aws-amplify';
import Amplify from 'aws-amplify';

const cognitoConfiguration = {
    userPoolId: 'us-west-2_Mf87AlPbr',
    userPoolWebClientId: 'ntmrfr1h1qrm1u8vi47mo1bsu',
    region: 'us-west-2',
};

Amplify.configure({ Auth: cognitoConfiguration });

export function getIdentity() {
    return Auth.currentSession().then((sessionData) => {
      const { idToken } = sessionData;
      const { jwtToken } = idToken;
      // console.debug(jwt_decode(jwtToken));
      return jwtToken;
    });
}
