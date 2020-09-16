const { logger } = require('./common');
const string = require('./stringResolver');
/* Discord.js VoiceConnection */
let connection = new Map();

const isConnected = guildId => (!connection.get(guildId)) ? false : true;
/* isInturrupted checks if voice connection state changed */
let _isInturrupted = false;
const isInturrupted = () => {
    return _isInturrupted;
};
/* check if dispatcher is used */
const isOccupied = guildId => {
    if (connection.get(guildId) != undefined && connection.get(guildId).dispatcher) return true;
    else return false;
};

const join = async (message, channel=undefined) => {
    /* If user joined in any voice channel or passed channel id */
    if (!message.member.voice.channel && !channel) return message.channel.send(string.get('joinVoiceChannelFirst'));
    const permissions = message.member.voice.channel.permissionsFor(message.client.user);
    /* If bot has permission to connect specified voice channel */
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send(string.get('noVoiceChannelPermission'));
    try {
        /* Join specified voice channed */
        if (message.member.voice.channel) {
            connection.set(message.guild.id, await message.member.voice.channel.join());
        } else if (channel) {
            const channel = await message.client.channels.fetch(args[0]);
            connection.set(message.guild.id, await channel.join());
        } else {
            /* Unknown error, throw UnknwonChannelId exception. */
            logger.log('error', '[discord.js] Failed to parse voice channel id!');
            throw new Error();
        }
        /* VC connection state changed. Mark as inturrupted. */
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
    /* Join VC first if not */
    if (!connection.get(message.guild.id)) await join(message);
    /* Voice played in same VC more than one time. Remove mark. */
    if (_isInturrupted) _isInturrupted = false;
    return await connection.get(message.guild.id).play(stream, option);
}

const leave = (message, quiet=false) => {
    /* Disconnecting w/o connecting is non-sense... */
    if (!connection.get(message.guild.id)) return;
    connection.get(message.guild.id).disconnect();
    connection.set(message.guild.id, undefined);
    /* VC connection state changed. Mark as inturrupted. */
    _isInturrupted = true;
    logger.log('verbose', `[discord.js] Left voice channel.`);
    if (!quiet) message.channel.send(string.get('leftVoiceChannel'));
}

module.exports = {
    isConnected,
    isInturrupted,
    isOccupied,
    join,
    play,
    leave
}
