const DiscordThread = require('./class/DiscordThread.js');
const DiscordVoice = require('./class/DiscordVoice.js');
const TTSClass = require('../tts/class/TextToSpeech.js');
const TTSUser = require('../tts/class/TTSUser.js');
const MessageFixer = require('./messageFixer.js');
const logger = require('../logger/main.mod.js');

// event lock to prevent multiple event trigger
// why I even have to do this; maybe spaghetti code?
let eventLock = false;

async function onAway(threadClass) {
    if (eventLock) return;

    // check if thread class is already removed by another event
    if (!threadClass) return;

    logger.info('discord.js', 'Everyone were away longer than specified time. Removing thread and leaving voice...');
    remove(threadClass);
}

async function onArchive(thread) {
    if (eventLock) return;
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
    if (eventLock) return;
    const threadClass = new DiscordThread(thread.guild.id);  // voice thread class

    //check if voice thread class initialized correctly
    if (!await threadClass.available()) return;
    // check if deleted thread is same as voice thread
    if (threadClass.get().id !== thread.id) return;
    // remove and leave
    logger.warn('discord.js', `Thread ${thread} removed by someone. Leaving voice...`);
    remove(threadClass);
}

async function onVoiceDisconnect(threadClass, channel) {
    if (eventLock) return;
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

    // reset thread away check timer
    threadClass.awayHandler.refresh();

    try {
        // get params to initialize TTS module
        const paramBuilder = new TTSClass.ParameterBuilder();
        paramBuilder.locale = message.guild.preferredLocale;
        const params = await paramBuilder.build();

        // initialize TTS module wrapper
        const tts = await TTSClass.getOrCreate(message.guild.id, params);
        const user = new TTSUser(message.guild, message.member);  // profile of the user

        // fix and build message 
        const text = MessageFixer.fix(message);
        // is fixed message has anything?
        if (text == '') return;  // NOPE: stop and exit

        // add message to TTS speak queue
        const voice = new DiscordVoice(message.guild.id);
        await tts.addQueue(user, text);
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
        logger.error('tts', 'Error occured while synthesizing!');
        logger.error('tts', err.stack ? err.stack : err);
    }
}

async function remove(thread) {
    // set event lock
    eventLock = true;

    // delete TTS class if available
    if (TTSClass.available(thread.guildId))
        TTSClass.delete(thread.guildId);

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

    // unregister thread's away-from-keyboard handler
    clearTimeout(thread.awayHandler);
    thread.deleteAwayHandler();

    // remove voice thread
    if (await thread.available()) {
        logger.verbose('discord.js', `Removed thread channel ${thread.get()}.`);
        await thread.delete();
    }

    eventLock = false;
}

module.exports = { onAway, onArchive, onDelete, onVoiceDisconnect, parse, remove }