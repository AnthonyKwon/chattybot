const { ConversationManager } = require('../modules/conversation/Conversation');
const i18n = require('../modules/i18n/main.mod.js');
const I18nCommandBuilder = require("../modules/discord/command/I18nCommandBuilder").default;

async function commandHandler(interaction) {
    // check if bot has joined session
    if (!ConversationManager.has(interaction.guild.id)) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord.voice.not_joined'));
        return;
    }

    // get conversation from cache and leave
    const conversation = ConversationManager.get(interaction.guild.id);
    const channel = await conversation.destroy();

    // send reply to user interaction
    interaction.editReply(i18n.get(interaction.locale, 'message.discord.voice.left').format(channel));
}

module.exports = {
    data: new I18nCommandBuilder('leave')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}