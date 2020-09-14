const fs = require('fs');
const { logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const music = require('../tannergabriel_yt');
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
    const safeMsg = saferMessage(args.join(' '));
    message.delete();
    if (!isMessageSafe(args.join(' '))) {
        logger.log('warn', `[discord.js] ${message.author} tried to send unsafe character/word in message!`);
        message.channel.send(string.get('unsafeMessageWarning'));
    }
    logger.log('verbose', `[discord.js] ${message.author} spoken: ${args.join(' ')}`);
    const musicPlaying = music.isPlaying(message);
    let dispatcherData;
    if (musicPlaying) dispatcherData = music.destroy(message);
    message.channel.send(chat_format.format(message.author, args.join(' ')));
    const result = await tts.speak(message, safeMsg)
    result.on('finish', () => {
        if (musicPlaying) music.restore(message, dispatcherData);
    });
}

module.exports = {
    name: string.get('sayCommandName'),
    description: string.get('sayCommandDesc').format(string.get('localizedBotName')),
    argsRequired: true,
    aliases: [string.get('sayCommandAliases')],
    usage: string.get('sayCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        return sayInternal(message, args);
    }
}
