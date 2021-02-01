const fs = require('fs');
const { logger } = require('../common');
const discord = require('../discord.js');
const string = require('../stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

async function commandJoin(message, args) {
    let channelId = undefined;
    if (!discord.voiceMap.get(message.guild.id)) discord.voiceMap.set(message.guild.id, new discord.Voice(message.guild.id));
    const voice = discord.voiceMap.get(message.guild.id);
    if (args.length > 0) channelId = args[0];
    const response = await voice.join(message, channelId);
    if (response.result === 'SUCCESS')
        message.channel.send(string.stringFromId('discord.voice.joined', voice.channel.name));
    else if (response.result === 'FAIL') {
        let text = string.stringFromId('discord.error.exception.line1') + '\n';
        if (response.reason) {
            text = text + response.reason;
        } else if (response.stack) {
            if (devFlag === false) text += string.stringFromId('discord.error.exception.line2.prod');
            else text += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + response.stack + '```';
        }
        discord.voiceMap.delete(message.guild.id);
        message.channel.send(text);
    }
    return response;
}

module.exports = {
    name: 'catty.command.join',
    description: 'catty.command.join.name',
    aliases: 'catty.command.join.alias',
    usage: 'catty.command.join.usage',
    cooldown: 5,
    execute: commandJoin
}
