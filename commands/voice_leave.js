const { SlashCommandBuilder } = require('discord.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const DiscordThread = require('../modules/discordutils/class/DiscordThread.js');
const i18n = require('../modules/i18n/main.mod.js');
const logger = require('../modules/logger/main.mod.js');

// channel verification: lots of checks before leaving voice channel
function verify(interaction, voice, thread) {
        // am I in voice channel?
        if (!voice) {
            // NOPE: I'm not in voice channel
            interaction.reply(i18n.get(interaction.locale, 'error.discord.voice.not_joined'));
            return false;
        }

        // YEP: all checks passed. safe to continue
        return true;
}

async function commandHandler(interaction) {
    const voice = new DiscordVoice(interaction.guild.id);
    const thread = new DiscordThread(interaction.guild.id);
    if(!verify(interaction, voice, thread)) return; // check if channel is valid

    // leave from voice channel
    const voiceChannel = interaction.client.channels.cache.get(voice.channelId);
    await voice.leave();
    logger.verbose('discord.js', `Left voice channel ${voiceChannel}.`);
    interaction.editReply(i18n.get(interaction.locale, 'message.discord.voice.left').format(voiceChannel));

    // remove voice thread
    const epoch = Math.floor(Date.now() / 1000);  // unix timestamp of current time
    thread.delete();
    thread.headup.edit(`${voiceChannel} :wave: <t:${epoch}:R>`);
    logger.verbose('discord.js', `Removed thread channel ${thread.get()}.`);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.leave.name'))
        .setNameLocalizations(i18n.getAll('command.leave.name'))
        .setDescription(i18n.get('en-US', 'command.leave.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.leave.desc')),
    extra: { ephemeral: true },
    execute: commandHandler
}