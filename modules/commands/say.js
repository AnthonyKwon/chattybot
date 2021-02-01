const util = require('util');
const join = require('./join.js');
const { logger } = require('../common');
const discord = require('../discord.js');
const string = require('../stringManager.js');
const TTSClass = require('../textToSpeech.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;
const regexMention = /<(#|@!)[0-9]{18}>/g;
const regExSpecial = /[\{\}\[\]\/;:|\)*`^_~<>\#\\\=\(]/gi;

function messageFix(message, content) {
    /* replace raw mention id to discord mention */
    let finalMsg = content.replace(regexMention, (match, $1) => {
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

    /* Replace '@'(at) symbol to text '-at-' */
    finalMsg = finalMsg.replaceAll('@', '-at-');

    /* Replace '&'(and) symbol to text '-and-' */
    finalMsg = finalMsg.replaceAll('&', '-and-');

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = finalMsg.replaceAll(regExSpecial, ' ');
    return finalMsg;
}

async function commandSay(message, args) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) {
        const response = await join.execute(message, []);
        if (response.result === 'FAIL') return;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If TTS is not initalized, do it first */
    if (!voice.TTS) voice.TTS = new TTSClass();
    /* Fix message for TTS-readable */
    const text = args.join(' ');
    const fixedText = await messageFix(message, text);
    try {
        logger.log('verbose', `[discord.js] ${message.author} spoken: ${text}`);
        /* Send message and TTS to discord */
        message.channel.send(string.stringFromId('catty.tts.text.format', voice.channel.name, message.author, text));
        await voice.TTS.speak(message, fixedText);
    } catch(err) {
        logger.log('error', `[discord.js] Failed to launch requested command: ${err}\n${err.body}\n${err.stack}`);
        let _msg = string.stringFromId('discord.error.exception.line1') + '\n';
        if (!devFlag) _msg += string.stringFromId('discord.error.exception.line2.prod');
        else _msg += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + err.stack + '```';
    }
}

module.exports = {
    name: 'catty.command.say',
    description: 'catty.command.say.desc',
    argsRequired: true,
    aliases: 'catty.command.say.aliases',
    usage: 'catty.command.say.usage',
    cooldown: 5,
    execute: commandSay
}
