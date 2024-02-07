const { ChannelType, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const DiscordThread = require('../modules/discordutils/class/DiscordThread.js');
const threads = require('../modules/discordutils/thread.js');
const i18n = require('../modules/i18n/main.mod.js');
const logger = require('../modules/logger/main.mod.js');
const report = require('../modules/errorreport/main.mod.js');

// channel verification: lots of checks before joining to voice channel
function verify(interaction, channel) {
    // is this channel exists?
    if (!channel) {
        // NOPE: channel does not exists or invalid channel id
        logger.error('discord.js', 'Failed to join channel: unknown channel id');
        interaction.editReply(i18n.get(interaction.locale, 'error.discord.unknown_channel'));
        return false;
    }

    // is this a voice channel?
    if (channel.type !== ChannelType.GuildVoice) {
        // NOPE: this is not a voice channel
        logger.error('discord.js', 'Failed to join channel: channel type is not a voice');
        interaction.editReply(i18n.get(interaction.locale, 'error.discord.not_a_voice_channel'));
        return false;
    }

    const permissions = interaction.channel.permissionsFor(interaction.client.user);  // permissions (for current channel)
    // can I join to that channel?
    if (!permissions.has(PermissionsBitField.Flags.Connect) ||
        !permissions.has(PermissionsBitField.Flags.Speak) ||
        !channel.joinable) {
            // NOPE: I can't join to that channel
            logger.error('discord.js', `Failed to join voice channel: bot does not have permission to access channel ${channel.id}!`);
            interaction.editReply(i18n.get(interaction.locale, 'error.discord.voice.no_permission').format(channel));
            return false;
    }

    // can I create or manage thread at the text channel where interaction was used?
    if (!permissions.has(PermissionsBitField.Flags.CreatePublicThreads) ||
        !permissions.has(PermissionsBitField.Flags.ManageThreads) ||
        !permissions.has(PermissionsBitField.Flags.SendMessagesInThreads)) {
            // NOPE: I can't create thread on there
            logger.error('discord.js', `Failed to join voice channel: bot does not have permission to create thread in channel ${channel.id}!`);
            interaction.editReply(i18n.get(interaction.locale, 'error.discord.thread.no_permission').format(channel));
            return false;
    }

    // get currently joined voice channel (if has one) 
    const voice = require('@discordjs/voice');
    const connection = voice.getVoiceConnection(interaction.guild.id);
    const currChannelId = connection ? connection.joinConfig.channelId : undefined;

    // am I trying to join different channel from before?
    if (currChannelId === channel.id) {
        // NOPE: I'm trying to join same channel
        logger.error('discord.js', 'Failed to join voice channel: user tried to join bot into same channel currently in!');
        interaction.editReply(i18n.get(interaction.locale, 'error.discord.voice.already_joined').format(channel));
        return false;
    }

    // YEP: all checks passed. bot can join to this channel
    return true;
}

async function commandHandler(interaction) {
    // channel id from options (if available)
    let channel = interaction.options.getString(i18n.get('en-US', 'command.join.opt1.name'));
    
    // get channel from id (if available) or user's current joined channel
    if(channel) channel = interaction.client.channels.cache.get(channel);
    else if(!channel && interaction.member.voice.channel) channel = interaction.member.voice.channel;
    else {
        // NOPE: no channel id provided, and user not joined into voice channel
        logger.error('discord.js', 'Failed to join voice channel: channel id not provided');
        interaction.editReply(i18n.get(interaction.locale, 'error.discord.voice.user_not_found').format(interaction.user));
        return;
    }

    // check if channel is valid
    if(!verify(interaction, channel)) return;
    
    const voice = new DiscordVoice(interaction.guild.id);  // voice class (of current guild)
    const thread = new DiscordThread(interaction.guild.id);

    try {
        // leave from previous voice channel (if has one)
        if(voice.connected) await threads.remove(thread);

        // try to join voice channel
        voice.locale = interaction.locale;
        await voice.join(channel);

        // send success reply to user
        logger.verbose('discord.js', `Joined voice channel ${channel}.`);
        interaction.editReply(i18n.get(interaction.locale, 'message.discord.voice.joined').format(channel));

        // send a message for starting a thread
        const epoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
        const headupMsg = await interaction.channel.send(`${channel} :ballot_box_with_check: <t:${epoch}:R>`);

        // create thread for conversation
        const threadIdRaw = `${interaction.client.user.username}${interaction.user.displayName}${Date.now()}`;
        const threadOpt = {
            autoArchiveDuration: 60,
            name: Buffer.from(threadIdRaw).toString('base64').substring(0, 24),
            rateLimitPerUser: 3
        }
        const newThread = await thread.create(headupMsg, threadOpt);
        logger.verbose('discord.js', `Created thread channel ${newThread}.`);

        // handle disconnect event
        voice.handleDisconnect(async () => {
            logger.warn('discord.js', `Bot kicked from channel ${channel} by someone. Removing thread...`);
            // remove voice thread
            //TODO: integrate code w/ threads.remove()
            const leaveEpoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
            thread.headup.edit(`${channel} :wave: <t:${leaveEpoch}:R>`);
            logger.verbose('discord.js', `Removed thread channel ${thread.get()}.`);
            await thread.setLocked(true);
            await thread.delete();
        });
    } catch (err) {
        const result = report(err, interaction.user.id);
        logger.error('discord.js', `Error occured while joining voice channel:\n  ${err.stack}\n`);
        // send error message to discord channel
        interaction.editReply(i18n.get(interaction.locale, 'error.generic').format(result));
        return;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.join.name'))
        .setNameLocalizations(i18n.getAll('command.join.name'))
        .setDescription(i18n.get('en-US', 'command.join.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.join.desc'))
        .addStringOption(option => option.setName(i18n.get('en-US', 'command.join.opt1.name'))
                                         .setNameLocalizations(i18n.getAll('command.join.opt1.name'))
                                         .setDescription(i18n.get('en-US', 'command.join.opt1.desc'))
                                         .setDescriptionLocalizations(i18n.getAll('command.join.opt1.desc'))
                                         .setRequired(false)),
    extra: { ephemeral: true },
    execute: commandHandler
}
