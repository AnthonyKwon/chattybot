const fs = require('fs');
const { logger } = require('../common');
const string = require('../stringResolver');
const voice = require('../discordAudio');

module.exports = {
    name: string.get('joinCommandName'),
    description: string.get('joinCommandDesc').format(string.get('localizedBotName')),
    argsRequired: false,
    aliases: [string.get('joinCommandAliases')],
    usage: string.get('joinCommandUsage'),
    cooldown: 5,
    async execute(message, args) {
       voice.join(message);
    }
}
