const fs = require('fs');
const path = require('path');
const logger = require('../logger/main.mod.js');

// set fallback locale to en-US
const fallbackLocale = 'en-US';

// read locale from file
function read(locale) {
    // get json locale file path for provided locale
    let localeFilePath = path.join(path.dirname(require.main.filename), 'locales', `${locale}.json`);
    // check json file of chosen locale is available
    // if not, switch to fallback locale (this SHOULD be available)
    if (!fs.existsSync(localeFilePath)) {
        logger.warn('i18n', `Locale ${locale} is not available, falling back.`);
        localeFilePath = path.join(path.dirname(require.main.filename), 'locales', `${fallbackLocale}.json`);
    }

    // read json file
    localeData = JSON.parse(fs.readFileSync(localeFilePath));
    return localeData;
}

// read all locale from file
// this is an equivalent of old getAll function
function readAll(id) {
    // read locales directory
    const localeFiles = fs.readdirSync(path.join(path.dirname(require.main.filename), 'locales')).filter(file => file.endsWith('.json'));
    const result = {};

    for (const file of localeFiles) {
        // get current locale from filename
       const locale = path.basename(file, path.extname(file));
       // get string and assign to object
       const localizedString = localeData[id];
       if (typeof(localizedString) !== 'string')  continue;  // skip if result is invalid
       const newResult = { [locale]: localizedString };
       Object.assign(result, newResult);
   }
   return result;
}

module.exports = { read, readAll };
