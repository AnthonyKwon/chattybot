const util = require('util');
const join = require('./basic_join.js');
const report = require('../module/errorreport/main.mod');
const common = require('../module/common.js');
const localize = require('../module/localization.js');
const logger = require('../module/logger.js');
const TTSClass = require('../class/tts/ttsclass.js');

const devFlag = process.env.NODE_ENV === 'maintenance' ? true : false;
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
    let voice = message.client.voice.session.get(message.guild.id);

    // check if bot joined to the voice channel and join if not
    if (!voice || !voice.dispatcher) {
        const result = await join.execute(message, []);
        if (!result) return false; // join failed, stop function
        voice = message.client.voice.session.get(message.guild.id); // re-define voice value
    }

    /* If TTS is not initalized, do it first */
    if (!voice.TTS) voice.TTS = new TTSClass(message, 'GcpTtsWaveNet');
    /* Fix message for TTS-readable */
    const text = args.join(' ');
    const fixedText = await messageFix(message, text);
    logger.log('warn', `[TTS] Message ${text} will be spoken as ${fixedText}.`);
    try {
        /* Send message and TTS to discord */
        message.channel.send(localize.get('tts.speak.text', voice.channel.name, message.author, text));
        /* If bot have message delete permission, delete user's request message */
        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();
        await voice.TTS.addQueue(message.author, fixedText);
        logger.log('verbose', `[TTS] ${message.author} spoken: ${text}`);
    } catch(err) {
        const result = report(err, message.author.id);
        logger.log('error', `[TTS] Error occured while synthesizing:\n  ${err.stack}\n`);
        message.channel.send(result);
    }
    return true;
}

module.exports = {
    name: 'say',
    argsRequired: true,
    cooldown: 5,
    execute: ttsSay
}
