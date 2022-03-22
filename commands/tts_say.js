const util = require('util');
const join = require('./basic_join.js');
const common = require('../module/common.js');
const localize = require('../module/localization.js');
const logger = require('../module/logger.js');
const TTSClass = require('../class/tts/ttsclass.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;
const regexMention = /<(#|@!)[0-9]{18}>/g;
const regExSpecial = /[\{\}\[\]\/;:|\)*`^_~<>\#\\\=\(]/gi;

function messageFix(message, content) {
    /* replace raw mention id to discord mention */
    let finalMsg = content.replace(regexMention, (match, $1) => {
        let id = common.replaceAll(match, /[<>]/g, '');
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

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, '@', localize.get('cattybot.tts.replacement.@'));

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, '&', localize.get('cattybot.tts.replacement.&'));

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, regExSpecial, ' ');
    return finalMsg;
}

async function ttsSay(message, args) {
    /* If not joined to voice channel, join first */
    if (!message.client.voice.session.get(message.guild.id)) {
        await join.execute(message, []);
    }
    const voice = message.client.voice.session.get(message.guild.id);
    /* If TTS is not initalized, do it first */
    if (!voice.TTS) voice.TTS = new TTSClass(message, 'GcpTtsBasic', undefined);
    /* Fix message for TTS-readable */
    const text = args.join(' ');
    const fixedText = await messageFix(message, text);
    logger.log('warn', `[TTS] Message ${text} will be spoken as ${fixedText}.`);
    try {
        /* Send message and TTS to discord */
        message.channel.send(localize.get('chattybot.tts.text.format', voice.channel.name, message.author, text));
        /* If bot have message delete permission, delete user's request message */
        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();
        await voice.TTS.addQueue(message.author, fixedText);
        logger.log('verbose', `[TTS] ${message.author} spoken: ${text}`);
    } catch(err) {
        //const errorReport = new discord.MessageAttachment(Buffer.from(err.stack), `report-${common.datetime()}.txt`);
        logger.log('error', `[TTS] Error occured while synthesizing:\n  ${err.stack}\n`);
        message.channel.send(localize.get('error.generic'), errorReport);
    }
    return;
}

module.exports = {
    name: 'say',
    argsRequired: true,
    cooldown: 5,
    execute: ttsSay
}
