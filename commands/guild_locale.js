const { Locale, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');

async function commandHandler(interaction) {
    const currLocale = interaction.guild.preferredLocale;
    let newLocale = interaction.options.getString(i18n.get('en-US', 'command.locale.opt1.name'));

    if (!newLocale) {
        // no new locale provided - print current guild locale and exit
        interaction.editReply(i18n.get(currLocale, 'message.discord.locale.guild_current')
            .format(currLocale));
        return;
    }

    // new locale provided - set new guild locale
    // check if user has permission to use this command
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        interaction.editReply(i18n.get(currLocale, 'error.discord.user.no_permission'));
        return;
    }

    // check if bot has permission to update the guild settings
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        interaction.editReply(i18n.get(currLocale, 'error.discord.bot.no_permission'));
        return;
    }

    // check if user provided valid locale parameter
    if (!Object.values(Locale).includes(newLocale)) {
        interaction.editReply(i18n.get(currLocale, 'error.discord.command.locale_invalid_params'));
        return;
    }

    // check if server locale is the same as before
    if (interaction.guild.preferredLocale === locale) {
        interaction.editReply(i18n.get(currLocale, 'error.discord.command.locale_already_set'))
        return;
    }

    // set parameter as new guild locale
    interaction.guild.edit({ preferredLocale: newLocale });
    interaction.editReply(i18n.get(newLocale, 'message.discord.locale.guild_set')
        .format(currLocale, newLocale));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.locale.name'))
        .setNameLocalizations(i18n.getAll('command.locale.name'))
        .setDescription(i18n.get('en-US', 'command.locale.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.locale.desc'))
        .addStringOption(option => option.setName(i18n.get('en-US', 'command.locale.opt1.name'))
            .setNameLocalizations(i18n.getAll('command.locale.opt1.name'))
            .setDescription(i18n.get('en-US', 'command.locale.opt1.desc'))
            .setDescriptionLocalizations(i18n.getAll('command.locale.opt1.desc'))
            .setRequired(false)),
    extra: { ephemeral: true },
    execute: commandHandler
}