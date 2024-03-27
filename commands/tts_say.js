const { SlashCommandBuilder } = require('discord.js');
const i18n = require('../modules/i18n/main.mod.js');
const logger = require('../modules/logger/main.mod.js');
const MessageFixer = require('../modules/discordutils/messageFixer.js');
const report = require('../modules/errorreport/main.mod.js');
const TTSClass = require('../modules/tts/class/TextToSpeech.js');
const TTSUser = require('../modules/tts/class/TTSUser.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const config = require('../modules/config.js');

async function commandHandler(interaction) {
    let voice = new DiscordVoice(interaction.guild.id);

    // check if message text length is less than 1000
    const text = interaction.options.getString(i18n.get('en-US', 'command.say.opt1.name'));
    if (text.length > config.ttsMaxLength) {
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.tts.text_too_long').format(config.ttsMaxLength));
        return;
    }

    // does user joined voice channel?
    if (!voice.connected) {
        // NOPE: user does not joined voice channel
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord.voice.not_joined'));
        return;
    }

    // If TTS is not initalized, do it first
    const tts = await TTSClass.getOrCreate(interaction.guild.id);
    // Fix message for TTS-readable
    interaction.content = text;
    const fixedText = await MessageFixer.fix(interaction);
    if (fixedText !== text) logger.warn('tts', `Message ${text} will be spoken as ${fixedText}.`);
    try {
        // get account username (guild username if command used on guild && user has guild-specific username) of the user
        const user = interaction.member ? interaction.member : interaction.user;
        // Send message and TTS to discord
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'tts.speak.text').format(interaction.user, text));
        tts.addQueue(new TTSUser(user), interaction.locale, fixedText);
        const voiceCallback = async function (stream) {
            // play audio stream
            const player = await voice.play(stream);
            // wait until player finish playing stream
            await new Promise(resolve => player.on('stateChange', () => resolve()));
        }
        await tts.requestSpeak(voiceCallback);
        logger.verbose('tts', `${interaction.user} spoken: ${text}`);
    } catch (err) {
        const result = report(err, interaction.user.id);
        logger.error('tts', 'Error occured while synthesizing!');
        logger.error('tts', err.stack ? err.stack : err);

        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.generic').format(result));
    }
    return;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.say.name'))
        .setNameLocalizations(i18n.getAll('command.say.name'))
        .setDescription(i18n.get('en-US', 'command.say.desc'))
        .setDescriptionLocalizations(i18n.getAll('command.say.desc'))
        .addStringOption(option => option.setName(i18n.get('en-US', 'command.say.opt1.name'))
            .setNameLocalizations(i18n.getAll('command.say.opt1.name'))
            .setDescription(i18n.get('en-US', 'command.say.opt1.desc'))
            .setDescriptionLocalizations(i18n.getAll('command.say.opt1.desc'))
            .setRequired(true)),
    execute: commandHandler
}