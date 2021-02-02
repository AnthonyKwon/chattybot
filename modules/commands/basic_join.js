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
        switch (response.reason) {
            case 'no_permission':
            case 'specify_or_join_channel':
            case 'unknown_channel':
                text = string.stringFromId('discord.error.' + response.reason);
                break;
            case 'exception':
                if (devFlag === false) text += string.stringFromId('discord.error.exception.line2.prod');
                else text += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + response.stack + '```';
                break;
            default:
                text = text + response.reason;
        }
        discord.voiceMap.delete(message.guild.id);
        message.channel.send(text);
    }
    return response;
}

module.exports = {
    name: 'chattybot.command.join',
    description: 'chattybot.command.join.name',
    aliases: 'chattybot.command.join.alias',
    usage: 'chattybot.command.join.usage',
    cooldown: 30,
    execute: commandJoin
}
