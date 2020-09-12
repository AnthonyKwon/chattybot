const fs = require('fs');
const path = require('path');
const common = require('./common');
const config = require('./configLoader');
const { locale } = config.load(['locale']);

const stringResolverInternal = (target) => {
    try {
        const localizedStr = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', locale + '.json')));
        console.log(target);
        if (localizedStr[target]) {
            return localizedStr[target];
        } else {
            return `Error: Locale not defined.`
        }
    } catch (err) {
        common.logger.log('error', `[stringResolver] Failed to parse string: ${err}\n${err.body}`);
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

