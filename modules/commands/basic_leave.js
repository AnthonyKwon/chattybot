const discord = require('../discord.js');
const string = require('../stringManager.js');

async function commandLeave(message) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) return false;
    const voice = discord.voiceMap.get(message.guild.id);
    /* If player is available, kill it first */
    if (voice.Player) voice.Player.stop(voice);
    const response = await voice.leave();
    if (response) {
        message.channel.send(string.stringFromId('discord.voice.left', voice.channel.name));
        discord.voiceMap.delete(message.guild.id);
    } else {
        /* Is there a case that failed to leave voice channel? */
    }
    return response;
}

module.exports = {
    name: 'chattybot.command.leave',
    description: 'chattybot.command.leave.desc',
    argsRequired: false,
    aliases: 'chattybot.command.leave.aliases',
    cooldown: 30,
    execute: commandLeave
}
