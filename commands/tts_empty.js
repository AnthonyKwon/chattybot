const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const i18n = require(path.join(path.dirname(require.main.filename), 'modules', 'i18n', 'main.mod.js'));
const TTSClass = require(path.join(path.dirname(require.main.filename), 'modules', 'tts', 'class', 'TTSClass'));

async function commandHandler(interaction) {
    const locale = interaction.guild.i18n.locale;
    /* This command only can be used after TTS is initialized */
    const voice = interaction.client.voice.session.get(interaction.guild.id);
    if (!voice || !voice.TTS) {
        interaction.editReply(i18n.get(locale, 'error.discord.voice.not_joined'));
        return;
    }

    /* Re-initialize TTSClass with empty queue */
    voice.TTS = new TTSClass('GcpTtsWaveNet', TTSClass.genQueueArr(undefined, i18n.get(locale, 'speak.tts_queue.empty')));
    /* Notify to user */
    interaction.editReply(i18n.get(locale, 'message.tts_queue.empty'));
    await voice.TTS.speak(message);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.empty.name'))
        .setNameLocalizations(i18n.get('command.empty.name'))
        .setDescription(i18n.get('en-US', 'command.empty.desc'))
        .setDescriptionLocalizations(i18n.get('command.empty.desc')),
    extra: { },
    execute: commandHandler
}