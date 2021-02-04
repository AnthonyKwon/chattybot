const leave = require('./basic_leave.js');
const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

async function musicStop(message) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) return;
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, cancel command */
    if (!voice.Player) return;
    /* Kill music player, and nullify it */
    if (voice.Player) voice.Player.stop(message);
    voice.Player = undefined;
    message.channel.send(string.stringFromId('chattybot.music.stopped'));
    /* If TTS is not running, leave voice channel */
    if (!voice.TTS) response = leave.execute(message);
    return { result: 'SUCCESS' };
}

module.exports = {
    name: 'chattybot.command.stop',
    argsRequired: false,
    aliases: 'chattybot.command.stop.aliases',
    description: 'chattybot.command.stop.desc',
    cooldown: 3,
    execute: musicStop
}
