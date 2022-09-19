const path = require("path");
const gmail = require("gmail-tester");
const util = require("util");
const clipboardy = require('clipboardy');

module.exports = (on, config) => {
    on('task', {
        // Clipboard plugin
        getClipboard: () => {
            return clipboardy.readSync();
        },
    });
}

module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on("task", {
        "gmail:check": async args => {
            do {
                const emails = await gmail.get_messages(
                    path.resolve(__dirname, "credentials.json"), // credentials.json is inside plugins/ directory.
                    path.resolve(__dirname, "gmail_token.json"), // gmail_token.json is inside plugins/ directory.
                    args
                );
                if (emails.length > 0) {
                    console.log('[gmail] Found!');
                    if (emails.length > 1) {
                        const { to } = args;
                        return emails.filter((email) => {
                            // GMail API is ignoring +01 etc. but we need exact match
                            return email.receiver === to;
                        });
                    }
                    return emails;
                }
                await util.promisify(setTimeout)(5000);
            } while (true);
        }
    });
};