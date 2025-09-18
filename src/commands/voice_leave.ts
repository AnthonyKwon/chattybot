import {CommandInteraction, VoiceBasedChannel} from 'discord.js';
import { ConversationManager } from '../modules/conversation/Conversation';
import { getString } from '../modules/i18n/GetString';
import I18nCommandBuilder from "../modules/discord/command/I18nCommandBuilder";
import {ICommand} from "../modules/discord/command/ICommand";

async function commandHandler(interaction: CommandInteraction) {
    const conversation: ConversationManager | undefined = ConversationManager.get(interaction.guild!.id);

    // check if bot has joined session
    if (!conversation) {
        await interaction.editReply(getString(interaction.locale, 'error.botNotInVC'));
        return;
    }

    // get conversation from cache and leave
    const channel: VoiceBasedChannel = await conversation.destroy();

    // check channel availability before sending reply
    // (in case of user sending command to destroying conversation)
    if (!interaction.channel) return;

    // send reply to user interaction
    await interaction.editReply(getString(interaction.locale, 'message.conversation.left', channel.toString()));
}

const command: ICommand = {
    data: new I18nCommandBuilder('leave')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}

export default command;