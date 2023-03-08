const fs = require('node:fs');
const path = require('node:path');
const logger = require(path.join(path.dirname(require.main.filename), 'modules', 'logger', 'main.mod'));
const config = require(path.join(path.dirname(require.main.filename), 'configs', 'settings.json'));

class GuildI18nClass {
    constructor(guildId) {
        // read guild locale file
        const locData = readGuildLocaleFile();
        // test if current guild set own locale
        if (locData[guildId])  this._locale = locData[guildId];  // set to guild's own locale
        else  this._locale = config.defaultLocale;  // set to default locale defined in configuration
        this.guildId = guildId;
    }

    get locale() { return this._locale; }  // return current guild locale to user
    set locale(value) {  // set current guild locale from provided input
        this._locale = value;
        updateGuildLocaleFile(this.guildId, this._locale);
    }
}

// guild locale data file location
const fileLocation = path.join(path.dirname(require.main.filename), 'data', 'guild-locale.json');

// read guild locale data file
function readGuildLocaleFile() {
    try {
        // check if guild locale data file exists
        if (!fs.existsSync(fileLocation)) return config.defaultLocale;  // not found, return defaultLocale
        return JSON.parse(fs.readFileSync(fileLocation)); // return locale data file
    } catch (err) {
        logger.error('i18n', `Failed to read guild locale data file!\n${err.stack}`);
        return config.defaultLocale;
    }
}

// update guild locale data
function updateGuildLocaleFile(guildId, newLocale) {
    const localeData = {};
    try {
        // create directory to file if not exists
        if (!fs.existsSync(path.dirname(fileLocation))) fs.mkdirSync(path.dirname(fileLocation));  // file and directory doesn't exist, create path directory
        else if (fs.existsSync(fileLocation)) Object.assign(localeData, JSON.parse(fs.readFileSync(fileLocation)));  // file exists, read file and assign to localeData variable
        // add new locale data to variable
        Object.assign(localeData, { [guildId]: newLocale });
        // save modified data to file
        fs.writeFileSync(fileLocation, JSON.stringify(localeData));
    } catch (err) {
        logger.error('i18n', `Failed to read guild locale data file!\n${err.stack}`);
        return config.defaultLocale;
    }

}

module.exports = GuildI18nClass;