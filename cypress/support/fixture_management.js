import _ from 'lodash';
import {getSummariesInfo} from "./uclusion_backend";


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
                        return loginUserToMarket(adminConfiguration, marketId)
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
        }).then(() => loginUserToAccount(adminConfiguration))
            .then((client) => client.users.cleanAccount())
            .then(() => console.log('Done with cleanup'));
    });
}