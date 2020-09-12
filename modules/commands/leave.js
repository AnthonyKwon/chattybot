const fs = require('fs');
const { getTtsConnection, setTtsConnection, getYtConnection, setYtConnection } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

const leaveInternal = async (message, args) => {
    if (!getTtsConnection()) {
        return;
    }
    if (getTtsConnection()) {
        getTtsConnection().disconnect();
        setTtsConnection(undefined);
    }
    if (getYtConnection()) {
        getYtConnection().disconnect();
        setYtConnection(undefined);
    }
    logger.log('verbose', `[discord.js] Left voice channel.`);
    message.channel.send(string.get('leftVoiceChannel'));
}

module.exports = {
    name: 'leave',
    description: string.get('leaveCommandDesc'),
    argsRequired: false,
    aliases: [string.get('leaveCommandAliases')],
    cooldown: 5,
    execute(message, args) {
        return leaveInternal(message, args);
    }
}
