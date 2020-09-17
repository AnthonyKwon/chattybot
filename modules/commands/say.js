const fs = require('fs');
const util = require('util');
const { logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const music = require('../tannergabriel_yt');
const tts = require('../textToSpeech');
const name = string.get('sayCommandName');
const { chat_format } = config.load(['chat_format']);
const regexMention = /<(#|@!)[0-9]{18}>/g;
const regExSpecial = /[\{\}\[\]\/;:|\)*`^_~+<>@\#$%&\\\=\(]/gi;

/* Remove all potentally dangerous characters,
 * replace user & mention to name */
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
    saferMsg = saferMsg.replaceAll(regExSpecial, '');
    return saferMsg;
}

const commandFunc = async (message, args) => {
    /* Get filtered message */
    const safeMsg = saferMessage(message, args.join(' '));
    message.delete();
    logger.log('verbose', `[discord.js] ${message.author} spoken: ${args.join(' ')}`);
    /* Check if music playing */
    const musicPlaying = music.isPlaying(message);
    let dispatcherData;
    /* Destroy current music session */
    if (musicPlaying) dispatcherData = music.destroy(message);
    message.channel.send(chat_format.format(message.author, args.join(' ')));
    const result = await tts.speak(message, safeMsg);
    result.on('finish', () => {
        /* Restore destoryed music session
         * TODO: this code throws exception, but works. (I don't know why)
         * We need to fix it. */
        if (musicPlaying) music.restore(message, dispatcherData);
    });
}

module.exports = {
    name,
    description: string.get('sayCommandDesc').format(string.get('localizedBotName')),
    argsRequired: true,
    aliases: [string.get('sayCommandAliases')],
    usage: string.get('sayCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        return commandFunc(message, args);
    }
}
