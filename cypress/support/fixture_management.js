import _ from 'lodash';
import {getSummariesInfo, loginUserToAccount, loginUserToMarket} from "./uclusion_backend";
import {Auth} from "aws-amplify";


const DELETION_TIMEOUT = 60000; // wait 60 seconds to delete a market

export function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}


export function cleanAccount(userConfiguration) {
    const promise = getSummariesInfo(userConfiguration);
    return promise.then((summariesInfo) => {
        const {summariesClient, idToken} = summariesInfo;
        return summariesClient.idList(idToken).then((audits) => {
            if (_.isEmpty(audits)) {
                return {signatures: []};
            }
            const allMarkets = audits.map((audit) => audit.id);
            const chunks = _.chunk(allMarkets, 24);
            const versionPromises = chunks.map((chunk) => {
                return summariesClient.versions(idToken, chunk).then((versions) => {
                    const {signatures} = versions;
                    const deletions = signatures.map((signature) => {
                        const {market_id: marketId} = signature;
                        let globalClient;
                        return loginUserToMarket(userConfiguration, marketId)
                            .then((client) => {
                                globalClient = client;
                                return client.markets.get();
                            }).then((market) => {
                                const {created_by: createdBy, current_user_id: currentUserId} = market;
                                console.log(`For ${currentUserId} and ${createdBy} deleting ${JSON.stringify(market)}`);
                                return globalClient.markets.deleteMarket();
                            });
                    });
                    if (deletions) {
                        deletions.push(sleep(DELETION_TIMEOUT));
                    }
                    return Promise.all(deletions);
                });
            });
            return Promise.all(versionPromises);
        })
            .then(() => loginUserToAccount(userConfiguration))
            .then((client) => client.users.cleanAccount())
            // cleanup cognito session otherwise we're still signed in (the sdk uses the same storage as the webapp)
            .then(() => Auth.signOut())
            .then(() => console.log('Done with cleanup'));
    });
}