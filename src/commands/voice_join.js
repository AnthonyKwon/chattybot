const { ChannelType, PermissionsBitField, Locale} = require('discord.js');
const { getString } = require('../modules/i18n/GetString');
const { datetimePretty } = require('../modules/common.js');
const logger = require('../modules/logger/main.mod.js');
const report = require('../modules/errorreport/main.mod.js');
const { ConversationManager } = require("../modules/conversation/Conversation");
const { ThreadOptions } = require("../modules/discord/thread/Thread");
const I18nCommandBuilder = require("../modules/discord/command/I18nCommandBuilder").default;
const I18nChannelOption = require("../modules/discord/command/option/I18nChannelOption").default;

function buildCommand() {
    const command = new I18nCommandBuilder('join');
    command.setName();
    command.setDescription();

    // (optional) channel name as string option
    const optChannel = new I18nChannelOption('join', 0);
    optChannel.setName();
    optChannel.setDescription();
    optChannel.addChannelTypes(ChannelType.GuildVoice);
    optChannel.setRequired(false);
    command.addChannelOption(optChannel);

    return command;
}

// channel verification: lots of checks before joining to voice channel
function verify(interaction, channel) {
    // is this channel exists?
    if (!channel) {
        // NOPE: channel does not exists or invalid channel id
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to get channel info: unknown channel' });
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.unknownChannel'));
        return false;
    }

    // is this a voice channel?
    if (channel.type !== ChannelType.GuildVoice) {
        // NOPE: this is not a voice channel
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to get channel info: channel type is not a voice' });
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.invalidChannel'));
        return false;
    }

    const permissions = interaction.channel.permissionsFor(interaction.client.user);  // permissions (for current channel)
    // can I join to that channel?
    if (!permissions.has(PermissionsBitField.Flags.Connect) ||
        !permissions.has(PermissionsBitField.Flags.Speak) ||
        !channel.joinable) {
        // NOPE: I can't join to that channel
        logger.error({ topic: 'discord_legacy.js', message: `Failed to get voice channel info: bot does not have permission to access channel ${channel.id}!` });
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.botNoPermission', channel));
        return false;
    }

    // can I create or manage thread at the text channel where interaction was used?
    if (!permissions.has(PermissionsBitField.Flags.CreatePublicThreads) ||
        !permissions.has(PermissionsBitField.Flags.ManageThreads)) {
        // NOPE: I can't create thread on there
        logger.error({ topic: 'discord_legacy.js', message: `Failed to join voice channel: bot does not have permission to create thread in channel ${channel.id}!` });
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.botNoPermission', channel));
        return false;
    }

    // get currently joined voice channel (if has one) 
    const voice = require('@discordjs/voice');
    const connection = voice.getVoiceConnection(interaction.guild.id);
    const currChannelId = connection ? connection.joinConfig.channelId : undefined;

    // am I trying to join different channel from before?
    if (currChannelId === channel.id) {
        // NOPE: I'm trying to join same channel
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to join voice channel: user tried to join bot into same channel currently in!' });
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.alreadyJoined', channel));
        return false;
    }

    // YEP: all checks passed. bot can join to this channel
    return true;
}

async function commandHandler(interaction) {
    // channel id from options (if available)
    let channel = interaction.options.getChannel(getString(Locale.EnglishUS, 'command.join.options.0.name'));

    // get channel from id (if available) or user's current joined channel
    if (!channel && interaction.member.voice.channel) channel = interaction.member.voice.channel;
    else if (!channel) {
        // NOPE: no channel provided, and user not joined into voice channel
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to join voice channel: channel not provided' });
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.userNotInVC', interaction.user));
        return;
    }

    // check if channel is valid
    if (!verify(interaction, channel)) return;

    try {
        // use TTSUser class to parse username properly
        const threadName = `🧵 - ${interaction.member.displayName} (${datetimePretty()})`;
        const options = new ThreadOptions(threadName, 60, 3);

        // try to start the conversation
        const conversation = ConversationManager.create(interaction, channel);
        await conversation.start(options);

        // send success reply to user
        logger.verbose({ topic: 'discord.js', message: `Joined voice channel ${channel}.` });
        interaction.followUp({
            content: getString(interaction.locale, 'message.conversation.joined', `<#${channel.id}>`),
            ephemeral: true
        });
    } catch (err) {
        const result = report(err, interaction.user.id);
        logger.error({ topic: 'discord_legacy.js', message: 'error occurred while joining voice channel!' });
        logger.error({ topic: 'discord_legacy.js', message: err.stack });
        // send error message to discord_legacy channel
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.generic', result));
    }
}

module.exports = {
    data: buildCommand(),
    execute: commandHandler
}
