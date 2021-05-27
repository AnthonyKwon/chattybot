const discord = require('../discordwrapper.js');
const localize = require('../localization.js');
const PlayerClass = require('../player.js');
const TTSClass = require('../textToSpeech.js');

async function ttsEmpty(message) {
    /* This command only can be used after TTS is initialized */
    const voice = discord.voiceMap.get(message.guild.id);
    if (!voice || !voice.TTS) {
        message.channel.send(localize.get('error.discord.voice.not_joined'));
        return;
    }

    /* Re-initialize TTSClass with empty queue */
    voice.TTS = new TTSClass([{ authorId: 0, message: localize.get('speak.tts_queue.empty') }]);
    /* If music is playing, destroy it first */
    let playtime = 0, queue = [], voiceDestroyed = false;
    if (voice.Player) {
        playtime = voice.Player.getPlaytime(voice);
        queue = voice.Player.queue;
        voice.Player.stop(voice);
        voiceDestroyed = true;
    }
    /* Notify to user */
    message.channel.send(localize.get('message.tts_queue.empty'));
    await voice.TTS.speak(message);
    if (voiceDestroyed === true) {
        voice.Player = new PlayerClass(queue);
        voice.Player.play(voice, playtime);
        destroyed = false;
    }
}

module.exports = {
    name: 'empty',
    argsRequired: false,
    cooldown: 15,
    execute: ttsEmpty
}