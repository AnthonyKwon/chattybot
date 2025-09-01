const { ChannelType, PermissionsBitField } = require('discord.js');
const TTSUser = require('../modules/tts/class/TTSUser.js');
const i18n = require('../modules/i18n/main.mod.js');
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
    const optChannel = new I18nChannelOption('join', 1);
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
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to join channel: unknown channel' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.unknown_channel'));
        return false;
    }

    // is this a voice channel?
    if (channel.type !== ChannelType.GuildVoice) {
        // NOPE: this is not a voice channel
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to join channel: channel type is not a voice' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.not_a_voice_channel'));
        return false;
    }

    const permissions = interaction.channel.permissionsFor(interaction.client.user);  // permissions (for current channel)
    // can I join to that channel?
    if (!permissions.has(PermissionsBitField.Flags.Connect) ||
        !permissions.has(PermissionsBitField.Flags.Speak) ||
        !channel.joinable) {
        // NOPE: I can't join to that channel
        logger.error({ topic: 'discord_legacy.js', message: `Failed to join voice channel: bot does not have permission to access channel ${channel.id}!` });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.voice.no_permission').format(channel));
        return false;
    }

    // can I create or manage thread at the text channel where interaction was used?
    if (!permissions.has(PermissionsBitField.Flags.CreatePublicThreads) ||
        !permissions.has(PermissionsBitField.Flags.ManageThreads)) {
        // NOPE: I can't create thread on there
        logger.error({ topic: 'discord_legacy.js', message: `Failed to join voice channel: bot does not have permission to create thread in channel ${channel.id}!` });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.thread.no_permission').format(channel));
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
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.voice.already_joined').format(channel));
        return false;
    }

    // YEP: all checks passed. bot can join to this channel
    return true;
}

async function commandHandler(interaction) {
    // channel id from options (if available)
    let channel = interaction.options.getChannel(i18n.get('en-US', 'command.join.opt1.name'));

    // get channel from id (if available) or user's current joined channel
    if (!channel && interaction.member.voice.channel) channel = interaction.member.voice.channel;
    else if (!channel) {
        // NOPE: no channel provided, and user not joined into voice channel
        logger.error({ topic: 'discord_legacy.js', message: 'Failed to join voice channel: channel not provided' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.voice.user_not_found').format(interaction.user));
        return;
    }

    // check if channel is valid
    if (!verify(interaction, channel)) return;

    try {
        // use TTSUser class to parse username properly
        const ttsUser = new TTSUser(interaction.guild, interaction.user);
        // create thread for conversation
        const fetchedUser = await ttsUser.fetchUser();
        const threadName = `🧵 - ${fetchedUser.name} (${datetimePretty()})`;
        const options = new ThreadOptions(threadName, 60, 3);

        // try to start the conversation
        const conversation = ConversationManager.create(interaction, channel);
        await conversation.start(options);

        // send success reply to user
        logger.verbose({ topic: 'discord.js', message: `Joined voice channel ${channel}.` });
        interaction.followUp({
            content: i18n.get(interaction.locale, 'message.discord.voice.joined').format(channel),
            ephemeral: true
        });

        // handle away-from-keyboard situation
        // ideally, this should be based on discord_legacy's onArchive event,
        // but discord_legacy doesn't seems emit any event on thread archive
        //thread.awayHandler = setTimeout(() => require('../modules/discord_legacy/thread.js')
            //.onAway(thread), config.awayTime * 60000);
    } catch (err) {
        const result = report(err, interaction.user.id);
        logger.error({ topic: 'discord_legacy.js', message: 'error occured while joining voice channel!' });
        logger.error({ topic: 'discord_legacy.js', message: err.stack });
        // send error message to discord_legacy channel
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.generic').format(result));
    }
}

module.exports = {
    data: buildCommand(),
    execute: commandHandler
}
