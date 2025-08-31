const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const appInfo = require('../../package.json');

async function commandHandler(interaction) {
    let reply = '';
    // add maintenance message to reply
    if (process.env.NODE_ENV == "development") reply += i18n.get(interaction.locale, 'message.info.maintenance').format(interaction.client.user) + '\n';
    // set reply message
    reply += i18n.get(interaction.locale, 'message.info').format(interaction.client.user, appInfo.version, appInfo.repository.url);
    interaction.editReply(reply);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.info.name'))
        .setNameLocalizations(i18n.getAll('command.info.name'))
        .setDescription(i18n.get('en-US', 'command.info.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.info.desc')),
    extra: { ephemeral: true },
    execute: commandHandler
}
