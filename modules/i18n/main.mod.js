const fs = require('fs');
const path = require('path');
const logger = require(path.join(path.dirname(require.main.filename), 'modules', 'logger', 'main.mod.js'));

/**
 * i18n.get(): get i18n string from id
 * this function uses dynamic arguments: locale and id
 */
 function get(args) {
    if (arguments.length === 1) {
        // redirect to getAll() function. argument: id
        return getAll(arguments[0]);
    } else if (arguments.length === 2) {
        // redirect to getSingle() function. argument: locale, id
        return getSingle(arguments[0], arguments[1]);
    } else {
        // invalid argument provided, throw error
        throw new Error('InvalidArgumentError');
    }
}

/**
 * test function: this will exposed to outside
 * test if specified string available
 */
function test(locale, string) {
    try {
        // read locale file
        const localeData = JSON.parse(fs.readFileSync(path.join(path.dirname(require.main.filename), 'locales', `${locale}.json`)));
        // test if file contains string
        if (Object.values(localeData).includes(string)) return true;  // file has it
        else return false;  // file doesn't have it
    } catch (err) {
        logger.error('i18n', `Failed to check if localized command name avaliable:\n${err.stack}`);
        return false;
    }
}

// get localized string from id
function getSingle(locale, id) {
    try {
        // read locale file
        const localeData = JSON.parse(fs.readFileSync(path.join(path.dirname(require.main.filename), 'locales', `${locale}.json`)));
        // test if field is multi-lined
        if (Array.isArray(localeData[id])) return localeData[id].join('\n');  // multi-line field
        else if (typeof localeData[id] === 'string') return localeData[id];  // single-line field
        else return `${locale}:${id}`;
    } catch (err) {
        logger.error('i18n', `Failed to parse string from id:\n${err.stack}`);
    }
}

function getAll(id) {
    // read locales directory
    const localeFiles = fs.readdirSync(path.join(path.dirname(require.main.filename), 'locales')).filter(file => file.endsWith('.json'));
    const result = {};

    for (const file of localeFiles) {
         // get current locale from filename
        const locale = path.basename(file, path.extname(file));
        // get string and assign to object
        const localizedString = getSingle(locale, id);
        if (localizedString === `${locale}:${id}`)  continue;  // skip if result is invalid
        const newResult = { [locale]: localizedString };
        Object.assign(result, newResult);
    }
    return result;
}

module.exports = { get, test }