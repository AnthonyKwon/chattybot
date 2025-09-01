const { Locale, PermissionsBitField } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const I18nStringOption = require('../modules/discord/command/option/I18nStringOption').default;
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;

async function commandHandler(interaction) {
    const currLocale = interaction.guild.preferredLocale;
    let newLocale = interaction.options.getString(i18n.get('en-US', 'command.locale.opt1.name'));

    if (!newLocale) {
        // no new locale provided - print current guild locale and exit
        interaction.editReply(i18n.get(interaction.locale, 'message.discord_legacy.locale.guild_current')
            .format(interaction.guild.name,
                i18n.get(interaction.locale, 'locale.name'), interaction.locale,
                i18n.get(interaction.guild.preferredLocale, 'locale.name'), currLocale,
            ));
        return;
    }

    // new locale provided - set new guild locale
    // check if user has permission to use this command
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord_legacy.user.no_permission'));
        return;
    }

    // check if bot has permission to update the guild settings
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord_legacy.bot.no_permission')
            .format(i18n.get(interaction.locale, 'permissions.MANAGE_GUILD')));
        return;
    }

    // check if user provided valid locale parameter
    if (!Object.values(Locale).includes(newLocale)) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord_legacy.command.locale_invalid_params'));
        return;
    }

    // check if server locale is the same as before
    if (interaction.guild.preferredLocale === newLocale) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord_legacy.command.locale_already_set'))
        return;
    }

    // set parameter as new guild locale
    interaction.guild.edit({ preferredLocale: newLocale });
    interaction.editReply(i18n.get(interaction.locale, 'message.discord_legacy.locale.guild_set')
        .format(currLocale, newLocale));
}

module.exports = {
    data: new I18nCommandBuilder('locale')
        .setName()
        .setDescription()
        .addStringOption(new I18nStringOption('locale', 1)
            .setName()
            .setDescription()
            .setRequired(false)),
    ephemeral: true,
    execute: commandHandler
}