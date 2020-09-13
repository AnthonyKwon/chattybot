const fs = require('fs');
const path = require('path');
const { logger } = require('./common');
const config = require('./configLoader');
const { locale } = config.load(['locale']);

const stringResolverInternal = (target) => {
    try {
        const localizedStr = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', locale + '.json')));
        if (localizedStr[target]) {
            return localizedStr[target];
        } else {
            return `${target}_${locale}`
        }
    } catch (err) {
        logger.log('error', `[stringResolver] Failed to parse string: ${err}\n${err.body}`);
    }
}

const format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
        ;
    });
};

module.exports = {
    format,
    get: (target) => {
        return stringResolverInternal (target);
    }
}

