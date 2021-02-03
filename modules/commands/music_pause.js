const join = require('./basic_join.js');
const discord = require('../discord.js');
const PlayerClass = require('../player.js');
const string = require('../stringManager.js');

async function musicPause(message) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) {
        const response = await join.execute(message, []);
        if (response.result === 'FAIL') return { result: 'FAIL', app: 'discord.js', message: `Failed to join voice channel:\n{response}` };
    }
    const voice = discord.voiceMap.get(message.guild.id);
    /* If player not initialized, show error and exit */
    if (!voice.Player) {
        message.channel.send(string.stringFromId('chattybot.music.error.not_playing'));
        return { result: 'FAIL', app: 'player', message: `${message.author} tried to change player state, but player was not initalized.` };
    }

    const newState = voice.Player.toggleState(message);
    if (newState === true) {
        message.channel.send(string.stringFromId('chattybot.music.resumed'));
    } else {
        message.channel.send(string.stringFromId('chattybot.music.paused'));
    }

    return { result: 'SUCCESS' };
}

module.exports = {
    name: 'chattybot.command.pause',
    argsRequired: false,
    aliases: 'chattybot.command.pause.aliases',
    usage: 'chattybot.command.pause.usage',
    cooldown: 5,
    execute: musicPause
}
