const { getString } = require('../modules/i18n/GetString');
const appInfo = require('../../package.json');
const {isDevMode} = require("../modules/common");
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;

async function commandHandler(interaction) {
    let reply = '';
    // add maintenance message to reply
    if (isDevMode()) reply += getString(interaction.locale, 'message.inDevMode') + '\n';
    // set reply message
    reply += getString(interaction.locale, 'message.command.info', interaction.client.user, appInfo.version, appInfo.repository.url);
    interaction.editReply(reply);
}

module.exports = {
    data: new I18nCommandBuilder('info')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}
