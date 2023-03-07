const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const localize = require('../module/localization.js');
const package = require(path.join(path.dirname(require.main.filename), 'package.json'));

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(localize.get('command.info.name'))
        .setDescription(localize.get('command.info.desc')),
    async execute(interaction) {
        let reply = localize.get('message.info.maintenance', interaction.client.user) + '\n';
        reply += localize.get('message.info', interaction.client.user, package.version, package.repository.url);
        interaction.reply(reply);
        return;
    },
}
