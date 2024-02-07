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
    if(!threadClass.get()) return;
    // check if archived thread is same as voice thread
    if(threadClass.get().id !== thread.id) return;

    // remove and leave
    logger.warn('discord.js', `Thread ${thread} archived by someone. Removing thread and leaving voice...`);
    remove(threadClass, false, false);
}

async function onDelete(thread) {
    const threadClass = new DiscordThread(thread.guild.id);  // voice thread class
    
    //check if voice thread class initialized correctly
    if(!threadClass.get()) return;
    // check if deleted thread is same as voice thread
    if(threadClass.get().id !== thread.id) return;

    // remove and leave
    logger.warn('discord.js', `Thread ${thread} removed by someone. Leaving voice...`);
    remove(threadClass, true, false);
}

async function parse(message) {
    const threadClass = new DiscordThread(message.guild.id);  // voice thread class

    // check if voice thread class initialized correctly
    if(!threadClass.get()) return;
    // check if message come from voice thread
    if(threadClass.get().id !== message.channel.id) return;

    try {
        // initialize TTS module wrapper
        const tts = await TTSClass.getOrCreate(message.guild.id);
        const user = new TTSUser(message.member);  // profile of the user
        
        // fix and build message 
        const text = MessageFixer.fix(message);
        // is fixed message has anything?
        if(text == '') return;  // NOPE: stop and exit
        
        // add message to TTS speak queue
        const voice = new DiscordVoice(message.guild.id);
        tts.addQueue(user, voice.locale, text);
        // create player callback TTS to use
        const voiceCallback = async function(stream) {
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
        logger.verbose('tts', `Error occured while synthesizing:\n  ${err.stack}\n`);
        message.channel.send(i18n.get('en-US', 'error.generic').format(result));
    }
}

async function remove(thread, threadDeleted=false, voiceDisconnected=false) {
    const voice = new DiscordVoice(thread.guildId);
    // check if bot is in voice channel
    if(!voice.channelId) return;

    // leave from voice channel
    const voiceChannel = thread.get().client.channels.cache.get(voice.channelId);
    if(!voiceDisconnected) {
        await voice.leave();
        logger.verbose('discord.js', `Left voice channel ${voiceChannel}.`);
    }

    // remove voice thread
    const epoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
    thread.headup.edit(`${voiceChannel} :wave: <t:${epoch}:R>`);
    if(!threadDeleted) {
        logger.verbose('discord.js', `Removed thread channel ${thread.get()}.`);
        await thread.setLocked(true);
        await thread.delete();
    }
}

module.exports = { onArchive, onDelete, parse, remove }