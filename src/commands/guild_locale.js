const { Locale, PermissionsBitField } = require('discord.js');
const { getString } = require('../modules/i18n/GetString');
const I18nStringOption = require('../modules/discord/command/option/I18nStringOption').default;
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;

async function commandHandler(interaction) {
    const currLocale = interaction.guild.preferredLocale;
    let newLocale = interaction.options.getString(getString(Locale.EnglishUS, 'command.locale.options.0.name'));

    if (!newLocale) {
        // no new locale provided - print current guild locale and exit
        interaction.editReply(getString(interaction.locale, 'message.guildOptions.locale.current',
            interaction.guild.name,
                getString(interaction.locale, 'locale.li.name'), interaction.locale,
                getString(interaction.guild.preferredLocale, 'locale.li.name'), currLocale,
            ));
        return;
    }

    // new locale provided - set new guild locale
    // check if user has permission to use this command
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        interaction.editReply(getString(interaction.locale, 'error.userNoPermission'));
        return;
    }

    // check if bot has permission to update the guild settings
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        interaction.editReply(getString(interaction.locale, 'error.botNoPermission',
            getString(interaction.locale, 'message.discord.permissions.ManageGuild')));
        return;
    }

    // check if user provided valid locale parameter
    if (!Object.values(Locale).includes(newLocale)) {
        interaction.editReply(getString(interaction.locale, 'error.localeInvalid'));
        return;
    }

    // check if server locale is the same as before
    if (interaction.guild.preferredLocale === newLocale) {
        interaction.editReply(getString(interaction.locale, 'error.localeAlreadySet'))
        return;
    }

    // set parameter as new guild locale
    interaction.guild.edit({ preferredLocale: newLocale });
    interaction.editReply(getString(interaction.locale, 'message.guildOptions.locale.successfullySet', currLocale, newLocale));
}

module.exports = {
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