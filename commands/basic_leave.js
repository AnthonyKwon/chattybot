const { SlashCommandBuilder } = require('discord.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const i18n = require('../modules/i18n/main.mod.js');
const config = require('../modules/config.js');

async function commandHandler(interaction) {
    const voice = new DiscordVoice(interaction.guild.id);
    
    // If not joined to voice channel, show error message
    if (!voice) {
        interaction.reply(i18n.get(interaction.locale, 'error.discord.voice.not_joined'));
        return;
    }

    // leave from voice channel
    const channel = interaction.client.channels.cache.get(voice.channelId);
    await voice.leave();
    interaction.editReply(i18n.get(interaction.locale, 'message.discord.voice.left').format(channel));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.leave.name'))
        .setNameLocalizations(i18n.get('command.leave.name'))
        .setDescription(i18n.get('en-US', 'command.leave.desc'))
        .setDescriptionLocalizations(i18n.get('command.leave.desc')),
    execute: commandHandler
}
