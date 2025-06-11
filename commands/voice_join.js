const { ChannelType, PermissionsBitField, SlashCommandBuilder, SlashCommandChannelOption } = require('discord.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const DiscordThread = require('../modules/discordutils/class/DiscordThread.js');
const TTSUser = require('../modules/tts/class/TTSUser.js');
const threadEvent = require('../modules/discordutils/thread.js');
const config = require('../modules/config.js');
const i18n = require('../modules/i18n/main.mod.js');
const { datetimePretty } = require('../modules/common.js');
const logger = require('../modules/logger/main.mod.js');
const report = require('../modules/errorreport/main.mod.js');

function buildCommand() {
    const command = new SlashCommandBuilder();
    command.setName(i18n.get('en-US', 'command.join.name'));
    command.setNameLocalizations(i18n.getAll('command.join.name'));
    command.setDescription(i18n.get('en-US', 'command.join.desc'));
    command.setDescriptionLocalizations(i18n.getAll('command.join.desc'));

    // (optional) channel name as string option
    const optChannel = new SlashCommandChannelOption();
    optChannel.setName(i18n.get('en-US', 'command.join.opt1.name'));
    optChannel.setNameLocalizations(i18n.getAll('command.join.opt1.name'));
    optChannel.setDescription(i18n.get('en-US', 'command.join.opt1.desc'));
    optChannel.setDescriptionLocalizations(i18n.getAll('command.join.opt1.desc'));
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
        logger.error({ topic: 'discord.js', message: 'Failed to join channel: unknown channel' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.unknown_channel'));
        return false;
    }

    // is this a voice channel?
    if (channel.type !== ChannelType.GuildVoice) {
        // NOPE: this is not a voice channel
        logger.error({ topic: 'discord.js', message: 'Failed to join channel: channel type is not a voice' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.not_a_voice_channel'));
        return false;
    }

    const permissions = interaction.channel.permissionsFor(interaction.client.user);  // permissions (for current channel)
    // can I join to that channel?
    if (!permissions.has(PermissionsBitField.Flags.Connect) ||
        !permissions.has(PermissionsBitField.Flags.Speak) ||
        !channel.joinable) {
        // NOPE: I can't join to that channel
        logger.error({ topic: 'discord.js', message: `Failed to join voice channel: bot does not have permission to access channel ${channel.id}!` });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.voice.no_permission').format(channel));
        return false;
    }

    // can I create or manage thread at the text channel where interaction was used?
    if (!permissions.has(PermissionsBitField.Flags.CreatePublicThreads) ||
        !permissions.has(PermissionsBitField.Flags.ManageThreads)) {
        // NOPE: I can't create thread on there
        logger.error({ topic: 'discord.js', message: `Failed to join voice channel: bot does not have permission to create thread in channel ${channel.id}!` });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.thread.no_permission').format(channel));
        return false;
    }

    // get currently joined voice channel (if has one) 
    const voice = require('@discordjs/voice');
    const connection = voice.getVoiceConnection(interaction.guild.id);
    const currChannelId = connection ? connection.joinConfig.channelId : undefined;

    // am I trying to join different channel from before?
    if (currChannelId === channel.id) {
        // NOPE: I'm trying to join same channel
        logger.error({ topic: 'discord.js', message: 'Failed to join voice channel: user tried to join bot into same channel currently in!' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.voice.already_joined').format(channel));
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
        logger.error({ topic: 'discord.js', message: 'Failed to join voice channel: channel not provided' });
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.voice.user_not_found').format(interaction.user));
        return;
    }

    // check if channel is valid
    if (!verify(interaction, channel)) return;

    const voice = new DiscordVoice(interaction.guild.id);  // voice class (of current guild)
    const thread = new DiscordThread(interaction.guild.id);

    try {
        // leave from previous voice channel (if has one)
        if (voice.connected) await threadEvent.remove(thread);

        // try to join voice channel
        voice.locale = interaction.guild.preferredLocale;
        await voice.join(channel);

        // send a message for starting a thread
        const epoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
        const headupMsg = await interaction.editReply(`${channel} :ballot_box_with_check: <t:${epoch}:R>`);

        // send success reply to user
        logger.verbose({ topic: 'discord.js', message: `Joined voice channel ${channel}.` });
        interaction.followUp({
            content: i18n.get(interaction.locale, 'message.discord.voice.joined').format(channel),
            ephemeral: true
        });

        // use TTSUser class to parse username properly
        const ttsUser = new TTSUser(interaction.guild, interaction.user);
        // create thread for conversation
        const fetchedUser = await ttsUser.fetchUser();
        const threadName = `🧵 - ${fetchedUser.name} (${datetimePretty()})`;
        const threadOpt = {
            autoArchiveDuration: 60,
            name: threadName,
            rateLimitPerUser: 3
        }
        const newThread = await thread.create(headupMsg, threadOpt);
        logger.verbose({ topic: 'discord.js', message: `Created thread channel ${newThread}.` });

        // handle disconnect event
        voice.handleDisconnect(() => require('../modules/discordutils/thread.js')
            .onVoiceDisconnect(thread, channel));

        // handle away-from-keyboard situation
        // ideally, this should be based on discord's onArchive event,
        // but discord doesn't seems emit any event on thread archive
        thread.awayHandler = setTimeout(() => require('../modules/discordutils/thread.js')
            .onAway(thread), config.awayTime * 60000);
    } catch (err) {
        const result = report(err, interaction.user.id);
        logger.error({ topic: 'discord.js', message: 'Error occured while joining voice channel!' });
        logger.error({ topic: 'discord.js', message: err.stack });
        // send error message to discord channel
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.generic').format(result));
        return;
    }
}

module.exports = {
    data: buildCommand(),
    extra: { ephemeral: false },
    execute: commandHandler
}
