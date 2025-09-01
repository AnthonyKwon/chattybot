import { Message, VoiceChannel } from 'discord.js';
import TTSClass from "../tts/class/TextToSpeech";
import TTSUser from "../tts/class/TTSUser";
import MessageFixer from "../discord_legacy/messageFixer";
import DiscordVoice from "../discord_legacy/class/DiscordVoice";
import logger from "../logger/main.mod";

/**
 * Handle message sent from user.x
 * @param channel - {@link VoiceChannel} to send TTS stream.
 * @param message - {@link Message} to handle.
 * @alpha
 * @todo revisit after TTS typescript rework
 */
export default async function MessageHandler(channel: VoiceChannel, message: Message) {
    await message.reply({ content: "FIXME", allowedMentions: { repliedUser: false } });
    try {
        // get params to initialize TTS module
        const paramBuilder = new TTSClass.ParameterBuilder();
        paramBuilder.locale = message.guild!.preferredLocale;
        const params = await paramBuilder.build();

        // initialize TTS module wrapper
        const tts = await TTSClass.getOrCreate(message.guild!.id, params);
        const user = new TTSUser(message.guild, message.member);  // profile of the user

        // fix and build message
        const text = MessageFixer.fix(message);
        // is fixed message has anything?
        if (text == '') return;  // NOPE: stop and exit

        // add message to TTS speak queue
        const voice = new DiscordVoice(message.guild!.id);
        await tts.addQueue(user, text);
        // create player callback TTS to use
        const voiceCallback = async function (stream: any) {
            // play audio stream
            const player = await voice.play(stream);
            // wait until player finish playing stream
            await new Promise<void>(resolve => player!.on('stateChange', () => resolve()));
        }
        // request TTS to speak
        logger.verbose({ topic: 'tts', message: `${message.author} spoken: ${text}` });
        await tts.requestSpeak(voiceCallback);
    } catch (err: any) {
        logger.error({ topic: 'tts', message: 'error occurred while synthesizing!' });
        logger.error({ topic: 'tts', message: err.stack ? err.stack : err });
    }
}