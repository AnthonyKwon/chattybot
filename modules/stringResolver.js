/* String Resolver
 * Get localized string from "locale/*.json" */
const fs = require('fs');
const path = require('path');
const { logger } = require('./common');
const config = require('./configLoader');
const { locale } = config.load(['locale']);

const string_get = target => {
    try {
        const localizedStr = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', locale + '.json')));
        if (localizedStr[target]) {
            return localizedStr[target];
        } else {
            return `${target}_${locale}`
        }
    } catch (err) {
        logger.log('error', `[stringResolver] Failed to parse string: ${err.stack}`);
    }
}

module.exports = {
    get: string_get
}

