const DiscordThread = require('./class/DiscordThread.js');
const DiscordVoice = require('./class/DiscordVoice.js');
const TTSClass = require('../tts/class/TextToSpeech.js');
const TTSUser = require('../tts/class/TTSUser.js');
const MessageFixer = require('./messageFixer.js');
const i18n = require('../i18n/main.mod.js');
const logger = require('../logger/main.mod.js');
const report = require('../errorreport/main.mod.js');

async function parse(message) {
    const compThread = new DiscordThread(message.guild.id);  // thread to compare
    // is message from my thread channel?
    if(message.channel.id !== compThread.get().id) return;  // NOPE: not a same thread

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

module.exports = {
    parse
}