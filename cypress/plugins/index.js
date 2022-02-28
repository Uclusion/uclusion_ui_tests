const path = require("path");
const gmail = require("gmail-tester");
const util = require("util");

module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on("task", {
        "gmail:check": async args => {
            let done_waiting_time = 0;
            do {
                const emails = await gmail.get_messages(
                    path.resolve(__dirname, "credentials.json"), // credentials.json is inside plugins/ directory.
                    path.resolve(__dirname, "gmail_token.json"), // gmail_token.json is inside plugins/ directory.
                    args
                );
                if (emails.length > 0) {
                    console.log('[gmail] Found!');
                    return emails;
                }
                done_waiting_time += 5;
                if (done_waiting_time >= 180) {
                    console.log("[gmail] Maximum waiting time exceeded!");
                    return null;
                }
                await util.promisify(setTimeout)(5000);
            } while (true);
        }
    });
};