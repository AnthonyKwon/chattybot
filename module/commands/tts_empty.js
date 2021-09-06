const discord = require('../discordwrapper.js');
const localize = require('../localization.js');
const TTSClass = require('../../class/ttsClass.js');

async function ttsEmpty(message) {
    /* This command only can be used after TTS is initialized */
    const voice = discord.voiceMap.get(message.guild.id);
    if (!voice || !voice.TTS) {
        message.channel.send(localize.get('error.discord.voice.not_joined'));
        return;
    }

    /* Re-initialize TTSClass with empty queue */
    voice.TTS = new TTSClass('GcpTtsWaveNet', TTSClass.genQueueArr(undefined, localize.get('speak.tts_queue.empty')));
    /* Notify to user */
    message.channel.send(localize.get('message.tts_queue.empty'));
    await voice.TTS.speak(message);
}

module.exports = {
    name: 'empty',
    argsRequired: false,
    cooldown: 15,
    execute: ttsEmpty
}