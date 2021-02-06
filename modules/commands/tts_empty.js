const join = require('./basic_join.js');
const discord = require('../discord.js');
const string = require('../stringManager.js');
const PlayerClass = require('../player.js');
const TTSClass = require('../textToSpeech.js');

async function ttsEmpty(message) {
    /* This command only can be used after TTS is initialized */
    const voice = discord.voiceMap.get(message.guild.id);
    if (!voice || !voice.TTS) {
        return false;
    }

    /* Re-initialize TTSClass with empty queue */
    voice.TTS = new TTSClass([{ authorId: 0, message: string.stringFromId('chattybot.tts.queue.empty.speak') }]);
    /* If music is playing, destroy it first */
    let playtime = 0, queue = [], voiceDestroyed = false;
    if (voice.Player) {
        playtime = voice.Player.getPlaytime(voice);
        queue = voice.Player.queue;
        voice.Player.stop(voice);
        voiceDestroyed = true;
    }
    /* Notify to user */
    message.channel.send(string.stringFromId('chattybot.tts.queue.empty.message'));
    await voice.TTS.speak(message);
    if (voiceDestroyed === true) {
        voice.Player = new PlayerClass(queue);
        voice.Player.play(voice, playtime);
        destroyed = false;
    }
}

module.exports = {
    name: 'chattybot.command.empty',
    description: 'chattybot.command.empty.desc',
    argsRequired: false,
    aliases: 'chattybot.command.empty.aliases',
    cooldown: 30,
    execute: ttsEmpty
}