import { Auth } from 'aws-amplify';
import uclusion from 'uclusion_sdk';
import TestTokenManager, {TOKEN_TYPE_ACCOUNT, TOKEN_TYPE_MARKET, TOKEN_TYPE_MARKET_INVITE} from './TestTokenManager';
import {getIdentity} from './amplifyAuth';


export function getSSOInfo(configuration) {
    return loginUserToIdentity(configuration)
        .then(idToken => {
            return uclusion.constructSSOClient(configuration)
                .then((ssoClient) => {
                    return { idToken, ssoClient };
                });
        });
}

export function getSummariesInfo(configuration) {
    return loginUserToIdentity(configuration)
        .then(idToken => {
            return uclusion.constructSummariesClient(configuration)
                .then((summariesClient) => {
                    return { idToken, summariesClient };
                });
        });
}

export function loginUserToIdentity(configuration) {
    return Auth.signIn(configuration)
        .then(() => getIdentity());
}

export function loginUserToAccount(configuration) {
    return getSSOInfo(configuration)
        .then(info => {
            const { ssoClient, idToken } = info;
            const tokenManager = new TestTokenManager(TOKEN_TYPE_ACCOUNT, null, ssoClient);
            return tokenManager.getToken()
                .then(() => uclusion.constructClient({ ...configuration, tokenManager }));
        });
}

export function loginUserToAccountAndGetToken(configuration) {
    return getSSOInfo(configuration)
        .then(info => {
            const { ssoClient, idToken } = info;
            const tokenManager = new TestTokenManager(TOKEN_TYPE_ACCOUNT, null, ssoClient);
            return tokenManager.getToken()
                .then((accountToken) => {
                    return uclusion.constructClient({ ...configuration, tokenManager })
                        .then((client) => {
                            return {accountToken, client};
                        })
                });
        });
}



export function loginUserToMarket(configuration, marketId) {
    return getSSOInfo(configuration)
        .then(info => {
            const { ssoClient, idToken } = info;
            const tokenManager = new TestTokenManager(TOKEN_TYPE_MARKET, marketId, ssoClient);
            return tokenManager.getToken()
                .then(() => uclusion.constructClient({ ...configuration, tokenManager }));
        });
}

export function loginUserToMarketInvite(configuration, marketToken) {
    return getSSOInfo(configuration)
        .then(info => {
            const { ssoClient, idToken } = info;
            const tokenManager = new TestTokenManager(TOKEN_TYPE_MARKET_INVITE, marketToken, ssoClient);
            return tokenManager.getToken()
                .then(() => uclusion.constructClient({ ...configuration, tokenManager }));
        });
}