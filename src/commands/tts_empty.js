const { getString } = require('../modules/i18n/GetString');
const { ConversationManager } = require("../modules/conversation/Conversation");
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;

async function commandHandler(interaction) {
    // This command only can be used when session is available
    const conversation = ConversationManager.get(interaction.guildId);

    if (!conversation) {
        interaction.editReply(getString(interaction.guild.preferredLocale, 'error.botNotInVC'));
        return;
    }

    // Re-initialize TTSClass with empty queue
    await conversation.reset();

    // Notify to user
    interaction.editReply(getString(interaction.guild.preferredLocale, 'message.command.queueReset'));
}

module.exports = {
    data: new I18nCommandBuilder('empty')
        .setName()
        .setDescription(),
    execute: commandHandler
}