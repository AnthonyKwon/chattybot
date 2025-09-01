const i18n = require('../modules/i18n/main.mod.js');
const logger = require('../modules/logger/main.mod.js');
const MessageFixer = require('../modules/tts/messageFixer.js');
const report = require('../modules/errorreport/main.mod.js');
const { play } = require('../modules/discord/Voice');
const TTSClass = require('../modules/tts/class/TextToSpeech.js');
const TTSUser = require('../modules/tts/class/TTSUser.js');
const config = require('../modules/config.js');
const I18nCommandBuilder = require('../modules/discord/command/I18nCommandBuilder').default;
const I18nStringOption = require('../modules/discord/command/option/I18nStringOption').default;

async function commandHandler(interaction) {
    // This command only can be used when session is available
    const conversation = ConversationManager.get(interaction.guildId);

    // check if message text length is less than 1000
    const text = interaction.options.getString(i18n.get('en-US', 'command.say.opt1.name'));
    if (text.length > config.ttsMaxLength) {
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.tts.text_too_long').format(config.ttsMaxLength));
        return;
    }

    // does user joined voice channel?
    if (!conversation) {
        // NOPE: user does not joined voice channel
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.discord_legacy.voice.not_joined'));
        return;
    }

    // If TTS is not initialized, do it first
    const tts = await TTSClass.getOrCreate(interaction.guild.id);
    // Fix message for TTS-readable
    interaction.content = text;
    const fixedText = await MessageFixer.fix(interaction);
    if (fixedText !== text) logger.warn({ topic: 'tts', message: `Message ${text} will be spoken as ${fixedText}.` });
    try {
        // get account username (guild username if command used on guild && user has guild-specific username) of the user
        const user = interaction.member ? interaction.member : interaction.user;
        // Send message and TTS to discord
        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'tts.speak.text').format(interaction.user, text));
        tts.addQueue(new TTSUser(interaction.guild, user), fixedText);
        const voiceCallback = async function (stream) {
            // play audio stream
            const player = await play(stream);
            // wait until player finish playing stream
            await new Promise(resolve => player.on('stateChange', () => resolve()));
        }
        await tts.requestSpeak(voiceCallback);
        logger.verbose({ topic: 'tts', message: `${interaction.user} spoken: ${text}` });
    } catch (err) {
        const result = report(err, interaction.user.id);
        logger.error({ topic: 'tts', message: 'error occurred while synthesizing!' });
        logger.error({ topic: 'tts', message: err.stack ? err.stack : err });

        interaction.editReply(i18n.get(interaction.guild.preferredLocale, 'error.generic').format(result));
    }
    return;
}

module.exports = {
    data: new I18nCommandBuilder('say')
        .setName()
        .setDescription()
        .addStringOption(new I18nStringOption('say', 1)
            .setName()
            .setDescription()
            .setRequired(true)),
    execute: commandHandler
}