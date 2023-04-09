import { SlashCommandBuilder } from 'discord.js';
import i18n from '@modules/i18n/main.mod';

async function commandHandler(interaction) {
    const locale = interaction.guild.i18n.locale;
    // If not joined to voice channel, show error message
    if (!interaction.client.voice.session.get(interaction.guild.id)) {
        interaction.reply(i18n.get(locale, 'error.discord.voice.not_joined'));
        return;
    }
    const voice = interaction.client.voice.session.get(interaction.guild.id);
    const response = await voice.leave();
    if (response) {
        interaction.editReply(i18n.get(locale, 'message.discord.voice.left').format(voice.channel.name));
        interaction.client.voice.session.delete(interaction.guild.id);
    } else {
        /* Is there a case that failed to leave voice channel? */
        throw new Error();
    }
    return;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.leave.name'))
        .setNameLocalizations(i18n.get('command.leave.name'))
        .setDescription(i18n.get('en-US', 'command.leave.desc'))
        .setDescriptionLocalizations(i18n.get('command.leave.desc')),
    extra: { },
    execute: commandHandler
}
