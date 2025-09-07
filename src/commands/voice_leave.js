const { ConversationManager } = require('../modules/conversation/Conversation');
const { getString } = require('../modules/i18n/GetString');
const I18nCommandBuilder = require("../modules/discord/command/I18nCommandBuilder").default;

async function commandHandler(interaction) {
    // check if bot has joined session
    if (!ConversationManager.has(interaction.guild.id)) {
        interaction.editReply(getString(interaction.locale, 'error.botNotInVC'));
        return;
    }

    // get conversation from cache and leave
    const conversation = ConversationManager.get(interaction.guild.id);
    const channel = await conversation.destroy();

    // send reply to user interaction
    interaction.editReply(getString(interaction.locale, 'message.conversation.left', `<#${channel}>`));
}

module.exports = {
    data: new I18nCommandBuilder('leave')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}