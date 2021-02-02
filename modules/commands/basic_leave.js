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
    name: 'chattybot.command.leave',
    description: 'chattybot.command.leave.desc',
    argsRequired: false,
    aliases: 'chattybot.command.leave.aliases',
    cooldown: 30,
    execute: commandLeave
}
