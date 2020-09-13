const fs = require('fs');
const { getTtsConnection, setTtsConnection, getYtConnection, setYtConnection, logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const tts = require('../textToSpeech');
const { chat_format } = config.load(['chat_format']);

const getUnsafe = () => {
    const unsafe = ['<', '/', '>']; /* XML and some unsafe characters */
    return unsafe;
}

const saferMessage = message => {
    const unsafe = getUnsafe();
    let newMsg = message;
    for (u of unsafe) {
        newMsg = newMsg.replaceAll(u, '');
    }
    return newMsg;
}

const isMessageSafe = message => {
    const unsafe = getUnsafe();
    for (u of unsafe) {
        if (message.includes(u)) return false;
    }
    return true;
}

const sayInternal = async (message, args) => {
    if (!getTtsConnection() && message.member.voice.channel) {
        setTtsConnection(await message.member.voice.channel.join());
        logger.log('verbose', `[discord.js] Joined voice channel ${getTtsConnection().channel.id}`);
        message.channel.send(string.get('joinedVoiceChannel').format(getTtsConnection().channel.name));
    } else if (getTtsConnection()) {
    } else {
        return string.get('joinVoiceChannelFirst');
    }
    const safeMsg = saferMessage(args.join(' '));
    message.delete();
    if (!isMessageSafe(args.join(' '))) {
        logger.log('warn', `[discord.js] ${message.author} tried to send unsafe character/word in message!`);
        message.channel.send(string.get('unsafeMessageWarning'));
    }
    logger.log('verbose', `[discord.js] ${message.author} spoken: ${args.join(' ')}`);
    message.channel.send(chat_format.format(message.author, safeMsg));
    tts.speak(getTtsConnection(), message, safeMsg);
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
