const i18n = require('../modules/i18n/main.mod.js');
const TextToSpeech = require('../modules/tts_legacy/class/TextToSpeech.js');
const { ConversationManager } = require("../modules/conversation/Conversation");
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;

async function commandHandler(interaction) {
    // This command only can be used when session is available
    const conversation = ConversationManager.get(interaction.guildId);

    if (!conversation) {
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.voice.not_joined'));
        return;
    }

    // Re-initialize TTSClass with empty queue
    TextToSpeech.delete(interaction.guild.id);
    // Notify to user
    interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'message.tts_queue.empty'));
}

module.exports = {
    data: new I18nCommandBuilder('empty')
        .setName()
        .setDescription(),
    execute: commandHandler
}