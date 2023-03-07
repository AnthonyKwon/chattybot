const fs = require('fs');
const path = require('path');

const config = require('./config.js');
const logger = require('./logger/main.mod.js');

function isLocalizedCommandAvailable(cmdMsg, name) {
    try {
        const index = `command.${name}.name`;
        const stringList = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', config.locale + '.json')));
        if (stringList[index] === cmdMsg)
            return true;
        else
            return false;
    } catch (err) {
        logger.error('i18n', `Failed to check if localized command name avaliable:\n  ${err.stack}`);
        return false;
    }
}

function getCommandInfofromId(id, type) {
    try {
        const index = `command.${id}.${type}`;
        const stringList = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', config.locale + '.json')));
        if (stringList[index]) {
            return stringList[index];
        } else {
            return id;
        }
    } catch (err) {
        logger.error('i18n', `Failed to parse string from id:\n  ${err.stack}`);
    }
}

/* get localized string from localization id */
function getLocalizedStringfromId(id) {
    let result = undefined; 
    try {
        const localized = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/', config.locale + '.json')));
        if (Array.isArray(localized[id]))
            result = localized[id].join('\n');
        else if (typeof localized[id] === 'string')
            result = localized[id];
        else
            return `${config.locale}.${id}`;
    } catch (err) {
        logger.log('i18n', `Failed to parse string from id:\n  ${err.stack}`);
    }

    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            result = result.replace(`\{${i-1}\}`, arguments[i]);
        }
    }
    return result;
}

module.exports = {
    locale: config.locale,
    commandCheck: isLocalizedCommandAvailable,
    command: getCommandInfofromId,
    get: getLocalizedStringfromId
}
