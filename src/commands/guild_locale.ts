import {ChatInputCommandInteraction, Locale, PermissionsBitField} from 'discord.js';
import {getString} from '../modules/i18n/GetString';
import I18nStringOption from '../modules/discord/command/option/I18nStringOption';
import I18nCommandBuilder from '../modules/discord/command/I18nCommandBuilder';
import {getDiscordLocale} from "../modules/i18n/GetCurrentLocale";
import {ICommand} from "../modules/discord/command/ICommand";

async function commandHandler(interaction: ChatInputCommandInteraction) {
    const currLocale = interaction.guild!.preferredLocale;
    let newLocale = interaction.options.getString(getString(Locale.EnglishUS, 'command.locale.options.0.name'));

    // show current guild locale and exit when new locale not specified
    if (!newLocale) {
        // append message if user has permission to modify
        let modifiableMessage: string = '';
        if ((interaction.member!.permissions as Readonly<PermissionsBitField>).has(PermissionsBitField.Flags.ManageGuild))
            modifiableMessage = '\n' + getString(interaction.locale, 'message.guildOptions.locale.modifiable');

        // show message to user
        await interaction.editReply(getString(interaction.locale, 'message.guildOptions.locale.current',
            interaction.guild!.name,
            getString(interaction.locale, 'li.name'), interaction.locale,
            getString(interaction.guild!.preferredLocale, 'li.name'), currLocale,
            modifiableMessage,
            getString('en-US', 'li.name')
            ));
        return;
    }

    // new locale provided - set new guild locale
    // check if user has permission to use this command
    if (!(interaction.member!.permissions as Readonly<PermissionsBitField>).has(PermissionsBitField.Flags.ManageGuild)) {
        await interaction.editReply(getString(interaction.locale, 'error.userNoPermission'));
        return;
    }

    // check if bot has permission to update the guild settings
    if (!interaction.guild!.members!.me!.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        await interaction.editReply(getString(interaction.locale, 'error.botNoPermission',
            getString(interaction.locale, 'message.discord.permissions.ManageGuild')));
        return;
    }

    // check if user provided valid locale parameter
    if (!Object.keys(Locale).find(l => Locale[l as keyof typeof Locale] === newLocale)) {
        await interaction.editReply(getString(interaction.locale, 'error.localeInvalid'));
        return;
    }

    // check if server locale is the same as before
    if (interaction.guild!.preferredLocale === newLocale) {
        await interaction.editReply(getString(interaction.locale, 'error.localeAlreadySet'))
        return;
    }

    // set parameter as new guild locale
    await interaction.guild!.edit({ preferredLocale: getDiscordLocale(newLocale) });
    await interaction.editReply(getString(interaction.locale, 'message.guildOptions.locale.successfullySet', currLocale, newLocale));
}

const command: ICommand =  {
    data: new I18nCommandBuilder('locale')
        .setName()
        .setDescription()
        .addStringOption(new I18nStringOption('locale', 0)
            .setName()
            .setDescription()
            .setRequired(false)),
    ephemeral: true,
    execute: commandHandler
}

export default command;