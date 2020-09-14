const event = require('events');
const { logger } = require('./common');
const string = require('./stringResolver');
const em = event.EventEmitter();
let connection = undefined; /* Discord.js VoiceConnection */
let _isInturrupted = false;
const isConnected = () => (!connection) ? false : true;
const isInturrupted = () => { /* get value of _isInturrupted */
    return _isInturrupted;
};
const isOccupied = () => { /* check if dispatcher is used */
    if (connection != undefined && connection.dispatcher) return true;
    else return false;
};

const join = async (message, channel=undefined) => {
    if (!message.member.voice.channel && !channel) return message.channel.send(string.get('joinVoiceChannelFirst'));
    const permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send(string.get('noVoiceChannelPermission'));
    try {
        if (message.member.voice.channel) connection = await message.member.voice.channel.join();
        else if (channel) {
            const channel = await message.client.channels.fetch(args[0]);
            connection = await channel.join();
        } else {
            logger.log('error', '[discord.js] Failed to parse voice channel id!');
            return;
        }
        if (!_isInturrupted) _isInturrupted = true;
        logger.log('verbose', `[discord.js] Joined voice channel ${connection.channel.id}`);
        return message.channel.send(string.get('joinedVoiceChannel').format(connection.channel.name));
    } catch (err) {
        if (err.message === 'Unknown Channel') {
            message.channel.send(string.get('unknownChannelError'));
        } else if (err.message.split(`\n`)[0] === 'Invalid Form Body') {
            message.channel.send(string.get('invalidFormBodyError'));
        }
        logger.log('error', `[discord.js] An error occured while connected to voice channel: \n${err.stack}`);
    }
}

const play = async (message, stream, option=undefined) => {
    if (!connection) await join(message);
    if (_isInturrupted) _isInturrupted = false;
    return await connection.play(stream, option);
}

const leave = (message, quiet=false) => {
    if (!connection) return;
    connection.disconnect();
    connection = undefined;
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
