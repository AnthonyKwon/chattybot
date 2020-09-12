const fs = require('fs');
const { getTtsConnection, setTtsConnection, getYtConnection, setYtConnection, logger } = require('../common');
const string = require('../stringResolver');

const sayInternal = async (message, args) => {
    try {
        if (!getTtsConnection() && message.member.voice.channel) {
            setTtsConnection(await message.member.voice.channel.join());
            setYtConnection(await message.member.voice.channel.join());
            logger.log('verbose', `[discord.js] Joined voice channel ${getTtsConnection().channel.id}`);
            return message.channel.send(string.get('joinedVoiceChannel').format(getTtsConnection().channel.name));
        } else if (!getTtsConnection() && args) {
            const channel = await message.client.channels.fetch(args[0]);
            setTtsConnection(await channel.join());
            setYtConnection(await channel.join());
            logger.log('verbose', `[discord.js] Joined voice channel ${getTtsConnection().channel.id}`);
            return message.channel.send(string.get('joinedVoiceChannel').format(getTtsConnection().channel.name));
        } else {
            return string.get('joinVoiceChannelFirst');
        }
    } catch (err) {
        if (err.message === 'Unknown Channel') {
            message.channel.send(string.get('unknownChannelError'));
        } else if (err.message.split(`\n`)[0] === 'Invalid Form Body') {
            message.channel.send(string.get('invalidFormBodyError'));
        }
        logger.log('error', `[discord.js] An error occured while connected to voice channel: \n${err.stack}`);
    }
}

module.exports = {
    name: 'join',
    description: string.get('joinCommandDesc'),
    argsRequired: false,
    aliases: [string.get('joinCommandAliases')],
    usage: string.get('joinCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        return sayInternal(message, args);
    }
}
