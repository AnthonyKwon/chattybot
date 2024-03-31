const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const TextToSpeech = require('../modules/tts/class/TextToSpeech.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');

async function commandHandler(interaction) {
    // This command only can be used when session is available
    const voice = new DiscordVoice(interaction.guild.id);
    if (!voice.connected) {
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.voice.not_joined'));
        return;
    }

    // Re-initialize TTSClass with empty queue
    TextToSpeech.delete(interaction.guild.id);
    // Notify to user
    interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'message.tts_queue.empty'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.empty.name'))
        .setNameLocalizations(i18n.getAll('command.empty.name'))
        .setDescription(i18n.get('en-US', 'command.empty.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.empty.desc')),
    execute: commandHandler
}