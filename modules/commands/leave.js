const fs = require('fs');
const string = require('../stringResolver');
const music = require('../tannergabriel_yt');
const tts = require('../textToSpeech');
const voice = require('../discordAudio');
const name = string.get('leaveCommandName');

module.exports = {
    name,
    description: string.get('leaveCommandDesc').format(string.get('localizedBotName')),
    argsRequired: false,
    aliases: [string.get('leaveCommandAliases')],
    cooldown: 5,
    execute(message) {
        voice.leave(message);
    }
}
