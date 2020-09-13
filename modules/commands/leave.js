const fs = require('fs');
const { getTtsConnection, setTtsConnection, getYtConnection } = require('../common');
const string = require('../stringResolver');
const music = require('../tannergabriel_yt');
const tts = require('../textToSpeech');

const leaveInternal = async (message, args) => {
    if (!getTtsConnection() && !getYtConnection()) {
        return;
    }
    if (getTtsConnection()) {
        getTtsConnection().disconnect();
        setTtsConnection(undefined);
    }
    if (getYtConnection()) {
        const serverQueue = music.queue.get(message.guild.id);
        music.stop(message, serverQueue);
    }
    logger.log('verbose', `[discord.js] Left voice channel.`);
    message.channel.send(string.get('leftVoiceChannel'));
}

module.exports = {
    name: string.get('leaveCommandName'),
    description: string.get('leaveCommandDesc').format(string.get('localizedBotName')),
    argsRequired: false,
    aliases: [string.get('leaveCommandAliases')],
    cooldown: 5,
    execute(message, args) {
        return leaveInternal(message, args);
    }
}
