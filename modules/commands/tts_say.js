const util = require('util');
const join = require('./basic_join.js');
const common = require('../common.js');
const discord = require('../discord.js');
const logger = require('../logger.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');
const TTSClass = require('../textToSpeech.js');

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
    finalMsg = common.replaceAll(finalMsg, '@', string.stringFromId('cattybot.tts.replacement.@'));

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, '&', string.stringFromId('cattybot.tts.replacement.&'));

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, regExSpecial, ' ');
    return finalMsg;
}

async function ttsSay(message, args) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) {
        const response = await join.execute(message, []);
        if (!response) return false;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If TTS is not initalized, do it first */
    if (!voice.TTS) voice.TTS = new TTSClass();
    /* Fix message for TTS-readable */
    const text = args.join(' ');
    const fixedText = await messageFix(message, text);
    logger.log('warn', `[TTS] Message ${text} will be spoken as ${fixedText}.`);
    try {
        /* Send message and TTS to discord */
        message.channel.send(string.stringFromId('chattybot.tts.text.format', voice.channel.name, message.author, text));
        /* If bot have message delete permission, delete user's request message */
        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();
        voice.TTS.setQueue(message.author.id, fixedText);
        /* If TTS is already speaking, do not call TTS */
        if (voice.TTS.speaking === true) return;
        /* If music is playing, destroy it first */
        let playtime = 0, queue = [], voiceDestroyed = false;
        if (voice.Player) {
            playtime = voice.Player.getPlaytime(voice);
            queue = voice.Player.queue;
            voice.Player.stop(voice);
            voiceDestroyed = true;
        }
        await voice.TTS.speak(message);
        if (voiceDestroyed === true) {
            voice.Player = new PlayerClass(queue);
            voice.Player.play(voice, playtime);
            destroyed = false;
        }
        logger.log('verbose', `[TTS] ${message.author} spoken: ${text}`);
        return true;
    } catch(err) {
        logger.log('error', `[TTS] Error occured while synthesizing:\n${err.stack}\n`);
        let _msg = string.stringFromId('discord.error.exception.line1') + '\n';
        if (!devFlag) _msg += string.stringFromId('discord.error.exception.line2.prod');
        else _msg += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```';
        return false;
    }
    return false;
}

module.exports = {
    name: 'chattybot.command.say',
    description: 'chattybot.command.say.desc',
    argsRequired: true,
    aliases: 'chattybot.command.say.aliases',
    usage: 'chattybot.command.say.usage',
    cooldown: 3,
    execute: ttsSay
}
