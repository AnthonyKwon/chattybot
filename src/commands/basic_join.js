const path = require('node:path');
const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const i18n = require(path.join(path.dirname(require.main.filename), 'modules', 'i18n', 'main.mod.js'));
const logger = require(path.join(path.dirname(require.main.filename), 'modules', 'logger', 'main.mod.js'));
const report = require(path.join(path.dirname(require.main.filename), 'modules', 'errorreport', 'main.mod.js'));
const VoiceClass = require(path.join(path.dirname(require.main.filename), 'modules', 'discordwrapper', 'class', 'VoiceClass'));

async function commandHandler(interaction) {
    const locale = interaction.guild.i18n.locale;
    // define channelId variable and get from option (if available)
    let channel = interaction.options.getString(i18n.get('en-US', 'command.join.opt1.name'));

    if (channel) {
        // user provided channel id, get id from option
        channel = interaction.client.channels.cache.get(channel);
        // verify validity of the channel
        if (!channel) {
            // channel is not valid
            logger.error('discord.js', 'Failed to join voice channel: unknown channel id');
            interaction.editReply(i18n.get(locale, 'error.discord.unknown_channel'));
            return false;
        }
    }
    else if (!channel && interaction.member.voice.channel) {
        // user does not provided any channel id, but joined into voice channel, get id from there
        channel = interaction.member.voice.channel
    } 
    else if (!channel && !interaction.member.voice.channel) {
        // user does not provided any channel id, neither joined any voice channel, show error and exit
        logger.error('discord.js', 'Failed to join voice channel: channel id not provided');
        interaction.editReply(i18n.get(locale, 'error.discord.voice.user_not_found').format(interaction.user));
        return false;
    }

    // check if bot already joined to same channel
    const currSession = interaction.client.voice.session.get(interaction.guild.id);
    if (currSession && currSession.channel === channel.id) {
        logger.error('discord.js', 'Failed to join voice channel: user tried to join bot into same channel currently in!');
        interaction.editReply(i18n.get(locale, 'error.discord.same_channel'));
        return false;
    }
    // check if bot has permission to join target channel
    const permissions = channel.permissionsFor(interaction.client.user);
    if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
        logger.error('discord.js', `Failed to join voice channel: bot does not have permission to access channel ${channel.id}!`);
        interaction.editReply(i18n.get(locale, 'error.discord.bot_no_permission'));
        return false;
    }

    // try to join voice channel w/ provided channel id or used joined
    try {
        const voice = new VoiceClass(interaction.guild.id);
        interaction.client.voice.session.set(interaction.guild.id, voice); // add voice object to voice session map
        const result = await voice.join(channel);
        logger.verbose('discord.js', `Joined voice channel ${channel.id}.`);
        interaction.editReply(i18n.get(locale, 'message.discord.voice.joined').format(voice.channel.name));
    } catch(err) {
        const result = report(err, interaction.user.id);
        logger.error('discord.js', `Error occured while joining voice channel:\n  ${err.stack}\n`);
        // send error message to discord channel
        interaction.editReply(i18n.get(locale, 'error.generic').format(result));
        return false;
    }
    return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.join.name'))
        .setNameLocalizations(i18n.get('command.join.name'))
        .setDescription(i18n.get('en-US', 'command.join.desc'))
        .setDescriptionLocalizations(i18n.get('command.join.desc'))
        .addStringOption(option => option.setName(i18n.get('en-US', 'command.join.opt1.name'))
                                         .setNameLocalizations(i18n.get('command.join.opt1.name'))
                                         .setDescription(i18n.get('en-US', 'command.join.opt1.desc'))
                                         .setDescriptionLocalizations(i18n.get('command.join.opt1.desc'))
                                         .setRequired(false)),
    extra: { },
    execute: commandHandler
}
