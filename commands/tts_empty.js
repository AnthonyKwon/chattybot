const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const TextToSpeech = require('../modules/tts/class/TextToSpeech.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const config = require('../modules/config.js')

async function commandHandler(interaction) {
    // This command only can be used after TTS is initialized
    const voice = new DiscordVoice(interaction.guild.id);
    const tts = TextToSpeech.get(interaction.guild.id);
    if (!voice.connected || !tts) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord.voice.not_joined'));
        return;
    }

    // Re-initialize TTSClass with empty queue
    TextToSpeech.delete(interaction.guild.id);
    // Notify to user
    interaction.editReply(i18n.get(interaction.locale, 'message.tts_queue.empty'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.empty.name'))
        .setNameLocalizations(i18n.get('command.empty.name'))
        .setDescription(i18n.get('en-US', 'command.empty.desc'))
        .setDescriptionLocalizations(i18n.get('command.empty.desc')),
    execute: commandHandler
}