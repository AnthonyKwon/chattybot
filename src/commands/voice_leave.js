const DiscordVoice = require('../modules/discord_legacy/class/DiscordVoice.js');
const DiscordThread = require('../modules/discord_legacy/class/DiscordThread.js');
const threads = require('../modules/discord_legacy/thread.js');
const i18n = require('../modules/i18n/main.mod.js');
const I18nCommandBuilder = require("../modules/discord/command/I18nCommandBuilder").default;

async function commandHandler(interaction) {
    const thread = new DiscordThread(interaction.guild.id);
    const voice = new DiscordVoice(interaction.guild.id);

    // check if bot has joined session
    if (!await thread.available() || !voice.connected) {
        interaction.editReply(i18n.get(interaction.locale, 'error.discord_legacy.voice.not_joined'));
        return;
    }

    // cache information of the voice channel
    const voiceChannel = interaction.client.channels.cache.get(voice.channelId);

    // remove thread and leave voice
    threads.remove(thread);

    // send reply to user interaction
    interaction.editReply(i18n.get(interaction.locale, 'message.discord_legacy.voice.left').format(voiceChannel));
}

module.exports = {
    data: new I18nCommandBuilder('leave')
        .setName()
        .setDescription(),
    ephemeral: true,
    execute: commandHandler
}