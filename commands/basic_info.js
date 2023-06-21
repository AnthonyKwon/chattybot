const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const package = require('../package.json');
const config = require('../modules/config.js');

async function commandHandler(interaction) {
    let reply = i18n.get(config.locale, 'message.info.maintenance').format(interaction.client.user) + '\n';
    reply += i18n.get(config.locale, 'message.info').format(interaction.client.user, package.version, package.repository.url);
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
