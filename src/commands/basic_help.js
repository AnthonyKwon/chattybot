import { SlashCommandBuilder } from 'discord.js';
import * as i18n from '@modules/i18n/main.mod.js';

async function commandHandler(interaction) {
    const commands = interaction.client.commands;
    const requestedCommand = interaction.options.getString(i18n.get('en-US', 'command.help.opt1.name'));

    // get guild-specific locale
    const locale = interaction.guild.i18n.locale;

    // test if user requested for specific-command help
    if (requestedCommand) {
        // show help page for specific command
        const command = commands.get(requestedCommand) ||
                            commands.find(cmd => i18n.test(locale, cmd.data.name_localizations[locale]));

        // Show unknown command message and return
        if (!command) {
            interaction.editReply(i18n.get(locale, 'error.discord.unknown_command'));
            return;
        }

        interaction.editReply(i18n.get(locale, 'message.help.detail'));

    } else {
        // show help page for all commands
        const commandList = Array.from(commands.keys());
        console.log();
        interaction.editReply(i18n.get(locale, 'message.help.all').format(commandList.join(', '),
                                commands.get(i18n.get('en-US', 'command.help.name')).data.name_localizations[locale],
                                i18n.get(locale, 'command.help.opt1.desc')));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.help.name'))
        .setNameLocalizations(i18n.get('command.help.name'))
        .setDescription(i18n.get('en-US', 'command.help.desc'))
        .setDescriptionLocalizations(i18n.get('command.help.desc'))
        .addStringOption(option => option.setName(i18n.get('en-US', 'command.help.opt1.name'))
                                         .setNameLocalizations(i18n.get('command.help.opt1.name'))
                                         .setDescription(i18n.get('en-US', 'command.help.opt1.desc'))
                                         .setDescriptionLocalizations(i18n.get('command.help.opt1.desc'))
                                         .setRequired(false)),
    extra: { ephemeral: true },
    execute: commandHandler
}
