const { SlashCommandBuilder } = require('discord.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const DiscordThread = require('../modules/discordutils/class/DiscordThread.js');
const threads = require('../modules/discordutils/thread.js');
const i18n = require('../modules/i18n/main.mod.js');

async function commandHandler(interaction) {
    const thread = new DiscordThread(interaction.guild.id);
    const voice = new DiscordVoice(interaction.guild.id);
    const voiceChannel = interaction.client.channels.cache.get(voice.channelId);

    // remove thread and leave voice
    threads.remove(thread);

    // send reply to user interaction
    interaction.editReply(i18n.get(interaction.locale, 'message.discord.voice.left').format(voiceChannel));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.leave.name'))
        .setNameLocalizations(i18n.getAll('command.leave.name'))
        .setDescription(i18n.get('en-US', 'command.leave.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.leave.desc')),
    extra: { ephemeral: true },
    execute: commandHandler
}