const fs = require('fs');
const util = require('util');
const { logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const music = require('../tannergabriel_yt');
const tts = require('../textToSpeech');
const { chat_format } = config.load(['chat_format']);
const regexMention = /<(#|@!)[0-9]{18}>/g;
const regExSpecial = /[\{\}\[\]\/;:|\)*`^_~+<>@\#$%&\\\=\(]/gi;

const saferMessage = (message, content) => {
    let saferMsg = content.replace(regexMention, (match, $1) => {
        let id = match.replaceAll(/[<>]/g, '');
        if (id.includes('@!')) {
            id = message.guild.members.cache.get(id.replace('@!', '')).displayName;
            return id;
        } else if (id.includes('#')) {
            const asyncFetchChannel = util.promisify(message.client.channels.fetch);
            const channel = asyncFetchChannel(id.replace('#', ''));
            id = channel.name;
            return id;
        }
    });
    console.log(saferMsg);
    saferMsg = saferMsg.replaceAll(regExSpecial, '');
    return saferMsg;
}

const sayInternal = async (message, args) => {
    const safeMsg = saferMessage(message, args.join(' '));
    message.delete();
    logger.log('verbose', `[discord.js] ${message.author} spoken: ${args.join(' ')}`);
    const musicPlaying = music.isPlaying(message);
    let dispatcherData;
    if (musicPlaying) dispatcherData = music.destroy(message);
    message.channel.send(chat_format.format(message.author, args.join(' ')));
    const result = tts.speak(message, safeMsg);
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
