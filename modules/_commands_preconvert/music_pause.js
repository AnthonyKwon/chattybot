const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

async function musicPause(message) {
    /* If not joined to voice channel, show error and exit */
    if (!discord.voiceMap.get(message.guild.id)) {
        message.channel.send(string.stringFromId('chattybot.music.playlist.empty'));
        return false;
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If music player is already not running, show error and exit */
    if (!voice.Player || !voice.Player.queue.length === 0) {
        message.channel.send(string.stringFromId('chattybot.music.playlist.empty'));
        return false;
    }

    const newState = voice.Player.toggleState(voice);
    if (newState === true) {
        message.channel.send(string.stringFromId('chattybot.music.resumed'));
    } else {
        message.channel.send(string.stringFromId('chattybot.music.paused'));
    }

    return true;
}

module.exports = {
    name: 'chattybot.command.pause',
    argsRequired: false,
    aliases: 'chattybot.command.pause.aliases',
    usage: 'chattybot.command.pause.usage',
    cooldown: 3,
    execute: musicPause
}
