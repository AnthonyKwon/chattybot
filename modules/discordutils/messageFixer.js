const util = require('node:util');
const common = require('../common.js');

function parseId(message, guild) {
    const regexId = /<(#|@)[0-9]{17,19}>/g;  // regex for all mention tags
    return message.replace(regexId, (match, $1) => {
        // get id w/o angle brackets
        let id = common.replaceAll(match, /[<>]/g, '');
        
        // classify and handle id by type
        if (id.includes('@'))  // user id
            return guild.members.cache.get(id.replace('@', '')).displayName;
        else if (id.includes('#'))  // channel id
            guild.channels.cache.get(id.replace('#', '')).name;
    });
}

function fix(messageObject) {
    // regex list of unreadable characters
    const unreadables = /[\{\}\[\]\/;:|\)*`^_~<>@\#\\\=\(]/gi;

    // parse user/channel ID and replace to its name
    let message = parseId(messageObject.content, messageObject.guild);
    // replace unreadable charaters to whitespace
    message = common.replaceAll(message, unreadables, ' ');
    // trim all whitespace in text
    message = message.trim();

    // return fixed message
    return message;
}

module.exports = { fix }