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

    // check channel availability before sending reply
    // (in case of user sending command to destroying conversation)
    if (!interaction.channel) return;

    // send reply to user interaction
    interaction.editReply(getString(interaction.locale, 'message.conversation.left', channel.toString()));
}

module.exports = {
    data: new I18nCommandBuilder('leave')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}