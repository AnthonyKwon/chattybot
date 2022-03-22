const { Permissions } = require('discord.js');
const common = require('../module/common.js');
const logger = require('../module/logger.js');
const localize = require('../module/localization.js');
const report = require('../module/errorreport/main.mod');
const VoiceClass = require('../class/discordwrapper/VoiceClass')

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

async function commandJoin(message, args) {
    let channelId = undefined;
    const voice = new VoiceClass(message.guild.id);

    // check if channel id is provided as argument
    if (args.length > 0) channelId = args[0];

    // check if user joined in any voice channel or passed channel id
    if (!channelId && !message.member.voice.channel) {
        logger.log('error', '[discord.js] Failed to join voice channel: channel id not provided');
        message.channel.send(localize.get('error.discord.voice.user_not_found', message.author));
        return false;
    }
    const selectedId = channelId ? channelId : message.member.voice.channel.id;
    // check if channel is available
    const channel = message.client.channels.cache.get(selectedId);
    if (!channel) {
        logger.log('error', '[discord.js] Failed to join voice channel: unknown channel id');
        message.channel.send(localize.get('error.discord.unknown_channel'));
        return false;
    }
    // check if bot already joined to same channel
    const prevsession = message.client.voice.session.get(message.guild.id);
    if (prevsession && prevsession.channel === channel.id) {
        logger.log('error', '[discord.js] Failed to join voice channel: tried to join already joined channel');
        message.channel.send(localize.get('error.discord.same_channel'));
        return false;
    }
    // check if bot has permission to join target channel
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has(Permissions.FLAGS.CONNECT) || !permissions.has(Permissions.FLAGS.SPEAK)) {
        logger.log('error', '[discord.js] Failed to join voice channel: bot has no permission to access channel');
        message.channel.send(localize.get('error.discord.bot_no_permission'));
        return false;
    }

    // try to join voice channel w/ provided channel id or used joined
    try {
        message.client.voice.session.set(message.guild.id, voice); // add voice object to voice session map
        const result = await voice.join(channel);
        logger.log('verbose', `[discord.js] Joined voice channel ${channel.id}.`);
        message.channel.send(localize.get('message.discord.voice.joined', voice.channel.name));
    } catch(err) {
        const result = report(err, message.author.id);
        logger.log('error', `[discord.js] Error occured while joining voice channel:\n  ${err.stack}\n`);
        // send error message to discord channel
        message.channel.send(localize.get('error.generic', result));
        return false;
    }
    return true;
}

module.exports = {
    name: 'join',
    cooldown: 8,
    execute: commandJoin
}
