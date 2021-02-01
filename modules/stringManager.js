const fs = require('fs');
const path = require('path');
const { logger } = require('./common');
const configManager = require('./configManager');
const config = configManager.read('locale');

/* get localization id from localized string */
function getLocalizedIdfromString(string) {
    try {
        const localized = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', config.locale + '.json')));
        const result = Object.keys(localized).find(key => localized[key] == string);
        if (result) return result;
        else return string;
    } catch (err) {
        logger.log('error', `[stringManager] Failed to parse id from string: ${err.stack}`);
    }
}

/* get localized string from localization id */
function getLocalizedStringfromId(id) {
    let result = undefined;
    try {
        const localized = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', config.locale + '.json')));
        if (localized[id]) {
            result = localized[id];
        } else {
            return `${config.locale}.${id}`;
        }
    } catch (err) {
        logger.log('error', `[stringManager Failed to parse string from id: ${err.stack}`);
    }

    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            result = result.replace(`\{${i-1}\}`, arguments[i]);
        }
    }
    return result;
}

module.exports = {
    idFromString: getLocalizedIdfromString,
    stringFromId: getLocalizedStringfromId,
    locale: config.locale
}

