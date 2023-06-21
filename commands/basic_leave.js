const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const DiscordVoice = require('../modules/discordwrapper/class/DiscordVoice.js');
const i18n = require(path.join(path.dirname(require.main.filename), 'modules', 'i18n', 'main.mod.js'));

async function commandHandler(interaction) {
    const locale = interaction.guild.i18n.locale;
    const voice = new DiscordVoice(interaction.guild.id);
    
    // If not joined to voice channel, show error message
    if (!voice) {
        interaction.reply(i18n.get(locale, 'error.discord.voice.not_joined'));
        return;
    }

    // leave from voice channel
    const channel = interaction.client.channels.cache.get(voice.channelId);
    await voice.leave();
    interaction.editReply(i18n.get(locale, 'message.discord.voice.left').format(channel.name));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.leave.name'))
        .setNameLocalizations(i18n.get('command.leave.name'))
        .setDescription(i18n.get('en-US', 'command.leave.desc'))
        .setDescriptionLocalizations(i18n.get('command.leave.desc')),
    extra: { },
    execute: commandHandler
}
