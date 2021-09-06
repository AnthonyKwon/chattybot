const path = require('path');
const { Readable } = require('stream');

// Get server username from user's ID.
const getUsername = (client, guild, userId) => {
    const username = client.guilds.cache.get(guild.id).member(userId).displayName;
    return username.split('_').join(' ');
}

/* Implement format() in javascript
   https://stackoverflow.com/a/18405800 */
if (!String.prototype.format) {
    String.prototype.format = function() {
        const args = arguments;
        return this.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

/* replace all in string */
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

/*
 * @param binary Buffer
 * returns readableInstanceStream Readable
 * https://stackoverflow.com/a/54136803
 */
const bufferToStream = (binary) => {
    const readableInstanceStream = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}

/*
 * Add padding zero
 * https://stackoverflow.com/a/9744576
*/
const paddy = (num, padlen, padchar) => {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

const datetime = () => {
    const currDate = new Date();
    let dateString = String(currDate.getFullYear()).padStart(4, '0');
    dateString = `${dateString}${String(currDate.getMonth() + 1).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getDate()).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getHours()).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getMinutes()).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getSeconds()).padStart(2, '0')}`;
    return dateString;
}

/* parse command aliases */
function parseAliases(commandName, aliases) {
    if (typeof aliases === 'string') {
        if (aliases === commandName) return true;
    } else if (typeof aliases === 'object') {
        if (aliases.includes(commandName)) return true;
    }
    return false;
}

const parseTime = param => {
    let time = paddy(Math.floor(param) % 1000, 3);
    time = Math.floor(param / 1000) > 1 ?
        `${paddy((Math.floor(param / 1000)) % 60, 2)}.${time}` : `00.${time}`;
    time = Math.floor((param / (1000 * 60))) ?
        `${paddy(Math.floor((param / (1000 * 60))) % 60, 2)}:${time}` : `00:${time}`;
    time = Math.floor((param / (1000 * 60 * 60))) ?
        `${param / (1000 * 60 * 60)}:${time}` : `00:${time}`
    return time;
}

/*
 * Remove duplicate from array (ES6 style)
 * https://stackoverflow.com/a/9229821
 */
function uniq(a) {
   return Array.from(new Set(a));
}

module.exports = {
    bufferToStream,
    datetime,
    getUsername,
    parseAliases,
    parseTime,
    replaceAll,
    uniq,
}
