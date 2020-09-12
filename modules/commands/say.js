const fs = require('fs');
let { getTtsConnection, setTtsConnection, getYtConnection, setYtConnection } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

const sayInternal = async (message, args) => {
    if (!getTtsConnection() && message.member.voice.channel) {
        setTtsConnection(await message.member.voice.channel.join());
    } else if (getTtsConnection()) {
    } else {
        return string.get('먼저 음성 채널에 들어가 있어야 해요.');
    }
    tts.speak(getTtsConnection(), message, args.join(' '));
}

module.exports = {
    name: 'say',
    description: string.get('sayCommandDesc'),
    argsRequired: true,
    aliases: [string.get('sayCommandAliases')],
    usage: string.get('sayCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        return sayInternal(message, args);
    }
}
