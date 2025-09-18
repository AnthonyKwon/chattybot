import { CommandInteraction } from 'discord.js';
import { getString } from '../modules/i18n/GetString';
import { ConversationManager } from "../modules/conversation/Conversation";
import I18nCommandBuilder from '../modules/discord/command/I18nCommandBuilder';
import {ICommand} from "../modules/discord/command/ICommand";

async function commandHandler(interaction: CommandInteraction) {
    // This command only can be used when session is available
    const conversation = ConversationManager.get(interaction.guildId!);

    if (!conversation) {
        await interaction.editReply(getString(interaction.guild!.preferredLocale, 'error.botNotInVC'));
        return;
    }

    // Re-initialize TTSClass with empty queue
    await conversation.reset();

    // Notify to user
    await interaction.editReply(getString(interaction.guild!.preferredLocale, 'message.command.queueReset'));
}

const command: ICommand = {
    data: new I18nCommandBuilder('empty')
        .setName()
        .setDescription(),
    execute: commandHandler
}

export default command;