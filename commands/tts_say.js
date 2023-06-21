const util = require('node:util');
const { SlashCommandBuilder } = require('discord.js');
const join = require('./basic_join.js');
const common = require('../modules/common.js');
const i18n = require('../modules/i18n/main.mod.js');
const logger = require('../modules/logger/main.mod.js');
const report = require('../modules/errorreport/main.mod.js');
const TTSClass = require('../modules/tts/class/TextToSpeech.js');
const TTSUser = require('../modules/tts/class/TTSUser.js');
const DiscordVoice = require('../modules/discordutils/class/DiscordVoice.js');
const config = require('../modules/config.js');

const regexMention = /<(#|@!)[0-9]{18}>/g;
const regExSpecial = /[\{\}\[\]\/;:|\)*`^_~<>\#\\\=\(]/gi;

function messageFix(interaction, content) {
    /* replace raw mention id to discord mention */
    let finalMsg = content.replace(regexMention, (match, $1) => {
        let id = common.replaceAll(match, /[<>]/g, '');
        if (id.includes('@!')) {
            id = interaction.guild.members.cache.get(id.replace('@!', '')).displayName;
            return id;
        } else if (id.includes('#')) {
            const asyncFetchChannel = util.promisify(interaction.client.channels.fetch);
            const channel = asyncFetchChannel(id.replace('#', ''));
            id = channel.name;
            return id;
        }
    });

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, '@', i18n.get('tts.replacement.@'));

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, '&', i18n.get('tts.replacement.&'));

    /* Replace TTS unreadable charater to whitespace */
    finalMsg = common.replaceAll(finalMsg, regExSpecial, ' ');
    return finalMsg;
}

async function commandHandler(interaction) {
    let voice = new DiscordVoice(interaction.guild.id);

    // check if message text length is less than 1000
    const text = interaction.options.getString(i18n.get('en-US', 'command.say.opt1.name'));
    if (text.length > config.ttsMaxLength) {
        interaction.editReply(i18n.get(config.locale, 'error.discord.tts.text_too_long').format(config.ttsMaxLength));
        return;
    }

    // check if bot joined to the voice channel and join if not
    if (!voice.connected) {
        voice = await join.execute(interaction);
        if (!voice) return; // join failed, stop function
    }

    /* If TTS is not initalized, do it first */
    let tts = TTSClass.get(interaction.guild.id);
    if (!tts) tts = await TTSClass.create(interaction.guild.id, 'GcpTtsWaveNet');
    /* Fix message for TTS-readable */
    const fixedText = await messageFix(interaction, text);
    logger.warn('tts', `Message ${text} will be spoken as ${fixedText}.`);
    try {
        /* Send message and TTS to discord */
        interaction.editReply(i18n.get(config.locale, 'tts.speak.text').format(interaction.user, text));
        tts.addQueue(new TTSUser(interaction.user, interaction.guild), fixedText);
        const voiceCallback = async function(stream) {
            // play audio stream
            const player = await voice.play(stream);
            // wait until player finish playing stream
            await new Promise(resolve => player.on('stateChange', () => resolve()));
        }
        await tts.requestSpeak(voiceCallback);
        logger.verbose('tts', `${interaction.user} spoken: ${text}`);
    } catch(err) {
        const result = report(err, interaction.user.id);
        logger.verbose('tts', `Error occured while synthesizing:\n  ${err.stack}\n`);
        interaction.editReply(i18n.get(config.locale, 'error.generic').format(result));
    }
    return;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(i18n.get('en-US', 'command.say.name'))
        .setNameLocalizations(i18n.get('command.say.name'))
        .setDescription(i18n.get('en-US', 'command.say.desc'))
        .setDescriptionLocalizations(i18n.get('command.say.desc'))
        .addStringOption(option => option.setName(i18n.get('en-US', 'command.say.opt1.name'))
                                         .setNameLocalizations(i18n.get('command.say.opt1.name'))
                                         .setDescription(i18n.get('en-US', 'command.say.opt1.desc'))
                                         .setDescriptionLocalizations(i18n.get('command.say.opt1.desc'))
                                         .setRequired(true)),
    execute: commandHandler
}