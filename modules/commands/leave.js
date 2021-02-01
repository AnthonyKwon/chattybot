const discord = require('../discord.js');
const string = require('../stringManager.js');

async function commandLeave(message) {
    const voice = discord.voiceMap.get(message.guild.id);
    const response = await voice.leave();
    if (response.result === 'SUCCESS') {
        message.channel.send(string.stringFromId('discord.voice.left', voice.channel.name));
        discord.voiceMap.delete(message.guild.id);
    }
}

module.exports = {
    name: 'catty.command.leave',
    description: 'catty.command.leave.desc',
    argsRequired: false,
    aliases: 'catty.command.leave.aliases',
    cooldown: 5,
    execute: commandLeave
}
