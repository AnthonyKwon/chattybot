const logger = require('../logger/main.mod.js');

// locale cache storage
const cache = new Map();

// get locale data from cache
function get(locale) {
    const cachedLocaleData = cache.get(locale);
    return cachedLocaleData;
}

// check if cache has locale
function has(locale) {
    return cache.has(locale);
}

// save locale data to cache
function save(locale, data) {
    if (cache.has(locale)) {
        // cache already has data for this locale.
        logger.verbose({ topic: 'i18n', message: `Cache already has ${locale} data. Skipping.` });
        return;
    }
    cache.set(locale, data);
}

module.exports = { get, has, save };