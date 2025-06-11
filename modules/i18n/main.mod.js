const logger = require('../logger/main.mod.js');
const cache = require('./cache.js');
const file = require('./file.js');

// get locale data
function getLocaleData(locale) {
    let localeData = undefined;
    try {
        // check if cache already have locale
        if (cache.has(locale)) {
            // cache have locale. get from cache
            localeData = cache.get(locale);
        } else {
            // cache doesn't have locale. get from file and register to cache
            localeData = file.read(locale);
            cache.save(locale, localeData);
        }
        return localeData;
    } catch (err) {
        //TODO: implement errorreport
        logger.error({ topic: 'i18n', message: 'Error occured while getting locale data!' });
        logger.error({ topic: 'i18n', message: err.stack ? err.stack : err })
    }
}

// get locale string from id
function get(locale, id) {
    const localeData = getLocaleData(locale);

    // return field to requested function
    // multi-lined field, return as all lines joined 
    if (Array.isArray(localeData[id])) return localeData[id].join('\n');
    // single lined, return data as is
    else if (typeof localeData[id] === 'string') return localeData[id];
    // data non-existant, return dummy text instead
    else return `${locale}:${id}`;
}

// get all locale string from id
// cache is not used in this function as caching is not reliable in here,
// and this is not used that much.
function getAll(id) {
    try {
        // redirect to file.readAll() function
        return file.readAll(id);
    } catch (err) {
        //TODO: implement errorreport
        logger.error({ topic: 'i18n', message: 'Error occured while getting locale data!' });
        logger.error({ topic: 'i18n', message: err.stack ? err.stack : err });
        // return dummmy locale data
        return { 'en-US': 'undefined' };
    }
}

module.exports = { get, getAll };
