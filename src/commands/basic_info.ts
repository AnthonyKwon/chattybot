import { CommandInteraction } from 'discord.js';
import { getString } from '../modules/i18n/GetString';
import I18nCommandBuilder from '../modules/discord/command/I18nCommandBuilder';
import { version, repository } from '../../package.json';

async function commandHandler(interaction: CommandInteraction) {
    let reply = '';
    // add maintenance message to reply
    if (global.devMode) reply += getString(interaction.locale, 'message.inDevMode') + '\n';
    // set reply message
    reply += getString(interaction.locale, 'message.command.info', interaction.client.user.toString(), version, repository.url);
    await interaction.editReply(reply);
}

module.exports = {
    data: new I18nCommandBuilder('info')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}
