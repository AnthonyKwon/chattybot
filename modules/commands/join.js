const fs = require('fs');
const { logger } = require('../common');
const string = require('../stringResolver');
const voice = require('../discordAudio');

const joinInternal = async (message, args) => {
    voice.join(message);
}

module.exports = {
    name: string.get('joinCommandName'),
    description: string.get('joinCommandDesc').format(string.get('localizedBotName')),
    argsRequired: false,
    aliases: [string.get('joinCommandAliases')],
    usage: string.get('joinCommandUsage'),
    cooldown: 5,
    execute(message, args) {
       return joinInternal(message, args);
    }
}
