const discord = require('../discord.js');
const string = require('../stringManager.js');

async function commandLeave(message) {
    /* If not joined to voice channel, join first */
    if (!discord.voiceMap.get(message.guild.id)) return;
    const voice = discord.voiceMap.get(message.guild.id);
    /* If player is available, kill it first */
    if (voice.Player) voice.Player.stop(message);
    const response = await voice.leave();
    if (response.result === 'SUCCESS') {
        message.channel.send(string.stringFromId('discord.voice.left', voice.channel.name));
        discord.voiceMap.delete(message.guild.id);
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
