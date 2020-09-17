const fs = require('fs');
const { logger } = require('../common');
const string = require('../stringResolver');
const voice = require('../discordAudio');
const name = string.get('joinCommandName');

module.exports = {
    name,
    description: string.get('joinCommandDesc').format(string.get('localizedBotName')),
    aliases: [string.get('joinCommandAliases')],
    usage: string.get('joinCommandUsage'),
    cooldown: 5,
    async execute(message) {
       voice.join(message);
    }
}
