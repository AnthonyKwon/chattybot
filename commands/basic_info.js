const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const package = require(path.join(path.dirname(require.main.filename), 'package.json'));

async function commandHandler(interaction) {
    // get guild-specific locale
    const locale = interaction.guild.i18n.locale;
    let reply = i18n.get(locale, 'message.info.maintenance').format(interaction.client.user) + '\n';
    reply += i18n.get(locale, 'message.info').format(interaction.client.user, package.version, package.repository.url);
    interaction.editReply(reply);
}

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.info.name'))
        .setNameLocalizations(i18n.get('command.info.name'))
        .setDescription(i18n.get('en-US', 'command.info.desc'))
        .setDescriptionLocalizations(i18n.get('command.info.desc')),
    extra: { ephemeral: true },
    execute: commandHandler
}
