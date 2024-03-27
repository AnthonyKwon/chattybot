const { Locale } = require('discord.js');
const DiscordThread = require('./class/DiscordThread.js');
const DiscordVoice = require('./class/DiscordVoice.js');
const TTSClass = require('../tts/class/TextToSpeech.js');
const TTSUser = require('../tts/class/TTSUser.js');
const MessageFixer = require('./messageFixer.js');
const i18n = require('../i18n/main.mod.js');
const logger = require('../logger/main.mod.js');
const report = require('../errorreport/main.mod.js');

async function onArchive(thread) {
    const threadClass = new DiscordThread(thread.guild.id);  // voice thread class

    //check if voice thread class initialized correctly
    if (!threadClass.get()) return;
    // check if archived thread is same as voice thread
    if (threadClass.get().id !== thread.id) return;

    // remove and leave
    logger.warn('discord.js', `Thread ${thread} archived by someone. Removing thread and leaving voice...`);
    remove(threadClass);
}

async function onDelete(thread) {
    const threadClass = new DiscordThread(thread.guild.id);  // voice thread class

    // prevent discord from double-call the deletion
    if (threadClass.get().name = '__REMOVEME_CHATTYDISPOSAL') return;

    //check if voice thread class initialized correctly
    if (!threadClass.get()) return;
    // check if deleted thread is same as voice thread
    if (threadClass.get().id !== thread.id) return;

    // remove and leave
    logger.warn('discord.js', `Thread ${thread} removed by someone. Leaving voice...`);
    threadClass.deleted = true;
    remove(threadClass);
}

async function onVoiceDisconnect(threadClass, channel) {
    logger.warn('discord.js', `Bot kicked from channel ${channel} by someone. Removing thread...`);
    // remove voice thread
    const leaveEpoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
    threadClass.headup.edit(`${channel} :wave: <t:${leaveEpoch}:R>`);
    remove(threadClass);
}

async function parse(message) {
    const threadClass = new DiscordThread(message.guild.id);  // voice thread class

    // check if voice thread class initialized correctly
    if (!threadClass.get()) return;
    // check if message come from voice thread
    if (threadClass.get().id !== message.channel.id) return;

    try {
        // get params to initialize TTS module
        const paramBuilder = new TTSClass.ParameterBuilder();
        paramBuilder.locale = message.guild.preferredLocale;
        const params = await paramBuilder.build();

        // initialize TTS module wrapper
        const tts = await TTSClass.getOrCreate(message.guild.id, params);
        const user = new TTSUser(message.member);  // profile of the user

        // fix and build message 
        const text = MessageFixer.fix(message);
        // is fixed message has anything?
        if (text == '') return;  // NOPE: stop and exit

        // add message to TTS speak queue
        const voice = new DiscordVoice(message.guild.id);
        tts.addQueue(user, voice.locale, text);
        // create player callback TTS to use
        const voiceCallback = async function (stream) {
            // play audio stream
            const player = await voice.play(stream);
            // wait until player finish playing stream
            await new Promise(resolve => player.on('stateChange', () => resolve()));
        }
        // request TTS to speak
        logger.verbose('tts', `${message.author} spoken: ${text}`);
        await tts.requestSpeak(voiceCallback);
    } catch (err) {
        // handle error report
        const result = report(err, message.author.id);
        logger.error('tts', 'Error occured while synthesizing!');
        logger.error('tts', err.stack ? err.stack : err);
        message.channel.send(i18n.get('en-US', 'error.generic').format(result));
    }
}

async function remove(thread) {
    // leave from voice channel
    const voice = new DiscordVoice(thread.guildId);
    const voiceChannel = thread.get().client.channels.cache.get(voice.channelId);
    const epoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
    if (voice.connected) {
        await voice.leave();
        logger.verbose('discord.js', `Left voice channel ${voiceChannel}.`);
        thread.headup.edit(`${voiceChannel} :wave: <t:${epoch}:R>`);
    } else {
        thread.headup.edit(`:cry:  <t:${epoch}:R>`);
    }

    // remove voice thread
    if (!thread.deleted) {
        logger.verbose('discord.js', `Removed thread channel ${thread.get()}.`);
        await thread.delete();
    }
}

module.exports = { onArchive, onDelete, onVoiceDisconnect, parse, remove }