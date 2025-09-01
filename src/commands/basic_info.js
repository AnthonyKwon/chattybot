const i18n = require('../modules/i18n/main.mod.js');
const appInfo = require('../../package.json');
const {isDevMode} = require("../modules/common");
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;

async function commandHandler(interaction) {
    let reply = '';
    // add maintenance message to reply
    if (isDevMode()) reply += i18n.get(interaction.locale, 'message.info.maintenance').format(interaction.client.user) + '\n';
    // set reply message
    reply += i18n.get(interaction.locale, 'message.info').format(interaction.client.user, appInfo.version, appInfo.repository.url);
    interaction.editReply(reply);
}

module.exports = {
    data: new I18nCommandBuilder('info')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}
