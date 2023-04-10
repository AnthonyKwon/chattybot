import { SlashCommandBuilder } from 'discord.js';
//import TTSClass from '@modules/tts-deprecated/class/TTSClass';
import tts from '@modules/tts';
import util from 'node:util';
import common from '@modules/common';
import i18n from '@modules/i18n/main.mod';
import logger from '@modules/logger/main.mod';
import report from '@modules/errorreport/main.mod';
import join from '@commands/basic_join';

const regexMention = /<(#|@!)[0-9]{18}>/g;
const regExSpecial = /[\{\}\[\]\/;:|\)*`^_~<>\#\\\=\(]/gi;

function messageFix(interaction, content) {
    const locale = interaction.guild.i18n.locale;
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
    const locale = interaction.guild.i18n.locale;
    let voice = interaction.client.voice.session.get(interaction.guild.id);

    // check if bot joined to the voice channel and join if not
    if (!voice || !voice.dispatcher) {
        const result = await join.execute(interaction);
        if (!result) return false; // join failed, stop function
        voice = interaction.client.voice.session.get(interaction.guild.id); // re-define voice value
    }

    // If TTS is not initalized, do it first
    if (!voice.TTS) voice.TTS = tts.create(locale);  // create TTS class object if not available
    //if (!voice.TTS) voice.TTS = new TTSClass(interaction, 'GcpTtsWaveNet');
    /* Fix message for TTS-readable */
    const text = interaction.options.getString(i18n.get('en-US', 'command.say.opt1.name'));
    const fixedText = await messageFix(interaction, text);
    voice.TTS.addMsg({ author: interaction.user ,message: fixedText });  // add message to queue
    logger.warn('tts', `Message ${text} will be spoken as ${fixedText}.`);
    try {
        /* Send message and TTS to discord */
        interaction.editReply(i18n.get(locale, 'tts.speak.text').format(interaction.user, text));
        //await voice.TTS.addQueue(interaction.user, fixedText);
        await voice.TTS.synthesize(voice);  // synthesize and play voice to channel
        logger.verbose('tts', `${interaction.user} spoken: ${text}`);
    } catch(err) {
        const result = report(err, interaction.user.id);
        logger.verbose('tts', `Error occured while synthesizing:\n  ${err.stack}\n`);
        interaction.editReply(i18n.get(locale, 'error.generic').format(result));
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
    extra: { },
    execute: commandHandler
}