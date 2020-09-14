const event = require('events');
const { logger } = require('./common');
const string = require('./stringResolver');
const em = event.EventEmitter();
let connection = new Map(); /* Discord.js VoiceConnection */
/* get connection by guild id */
const getConnection = guildId => {
    return connection.get(guildId);
}
let _isInturrupted = false;
const isConnected = guildId => (!connection.get(guildId)) ? false : true;
/* get value of _isInturrupted */
const isInturrupted = () => {
    return _isInturrupted;
};
/* check if dispatcher is used */
const isOccupied = guildId => { /* check if dispatcher is used */
    if (connection.get(guildId) != undefined && connection.get(guildId).dispatcher) return true;
    else return false;
};

const join = async (message, channel=undefined) => {
    if (!message.member.voice.channel && !channel) return message.channel.send(string.get('joinVoiceChannelFirst'));
    const permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send(string.get('noVoiceChannelPermission'));
    try {
        if (message.member.voice.channel) {
            connection.set(message.guild.id, await message.member.voice.channel.join());
        } else if (channel) {
            const channel = await message.client.channels.fetch(args[0]);
            connection.set(message.guild.id, await channel.join());
        } else {
            logger.log('error', '[discord.js] Failed to parse voice channel id!');
            return undefined;
        }
        if (!_isInturrupted) _isInturrupted = true;
        logger.log('verbose', `[discord.js] Joined voice channel ${connection.get(message.guild.id).channel.id}`);
        message.channel.send(string.get('joinedVoiceChannel').format(connection.get(message.guild.id).channel.name));
        return message.guild.id;
    } catch (err) {
        if (err.message === 'Unknown Channel') {
            message.channel.send(string.get('unknownChannelError'));
        } else if (err.message.split(`\n`)[0] === 'Invalid Form Body') {
            message.channel.send(string.get('invalidFormBodyError'));
        }
        logger.log('error', `[discord.js] An error occured while connected to voice channel: \n${err.stack}`);
        return undefined;
    }
}

const play = async (message, stream, option=undefined) => {
    if (!connection.get(message.guild.id)) await join(message);
    if (_isInturrupted) _isInturrupted = false;
    return await connection.get(message.guild.id).play(stream, option);
}

const leave = (message, quiet=false) => {
    if (!connection.get(message.guild.id)) return;
    connection.get(message.guild.id).disconnect();
    connection.set(message.guild.id, undefined);
    _isInturrupted = true;
    logger.log('verbose', `[discord.js] Left voice channel.`);
    if (!quiet) message.channel.send(string.get('leftVoiceChannel'));
}

module.exports = {
    getConnection,
    isConnected,
    isInturrupted,
    isOccupied,
    join,
    play,
    leave
}
