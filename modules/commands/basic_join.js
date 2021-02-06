const fs = require('fs');
const discord = require('../discord.js');
const logger = require('../logger.js');
const string = require('../stringManager.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

async function commandJoin(message, args) {
    let channelId = undefined;
    /* If voiceMap is not created, create it first */
    if (!discord.voiceMap.get(message.guild.id)) discord.voiceMap.set(message.guild.id, new discord.Voice(message.guild.id));
    const voice = discord.voiceMap.get(message.guild.id);
    /* check if channel id is provided as argument */
    if (args.length > 0) channelId = args[0];

    /* check if user joined in any voice channel or passed channel id */
    if (!channelId && !message.member.voice.channel) {
        logger.log('error', '[discord.js] Failed to join voice channel: channel id not provided');
        message.channel.send(string.stringFromId('discord.error.specify_or_join_channel'));
    }
    const selectedId = channelId ? channelId : message.member.voice.channel.id;
    /* check if channel is available */
    const channel = message.client.channels.cache.get(selectedId);
    if (!channel) {
        logger.log('error', '[discord.js] Failed to join voice channel: unknown channel id');
        message.channel.send(string.stringFromId('discord.error.unknown_channel'));
    }
    /* check if bot has permission to join target channel */
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        logger.log('error', '[discord.js] Failed to join voice channel: bot has no permission to access channel');
        message.channel.send(string.stringFromId('discord.error.no_permission'));
    }

    /* try to join voice channel w/ provided channel id or used joined */
    try {
        await voice.join(channel);
        logger.log('verbose', `[discord.js] Joined voice channel ${channel.id}.`);
        message.channel.send(string.stringFromId('discord.voice.joined', voice.channel.name));
    } catch(err) {
        logger.log('error', `[discord.js] Error occured while joining voice channel:\n${err.stack}\n`);
        /* send error message to discord channel */
        let text = string.stringFromId('discord.error.exception.line1') + '\n';
        if (devFlag === false) text += string.stringFromId('discord.error.exception.line2.prod');
        else text += string.stringFromId('discord.error.exception.line2.dev') + '\n```\n' + response.stack + '```';
        message.channel.send(text);
        return false;
    }
    return true;
}

module.exports = {
    name: 'chattybot.command.join',
    description: 'chattybot.command.join.name',
    aliases: 'chattybot.command.join.alias',
    usage: 'chattybot.command.join.usage',
    cooldown: 0,
    execute: commandJoin
}
