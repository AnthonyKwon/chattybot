import {GuildMember, Message} from 'discord.js';
import { ConversationManager } from "../Conversation";
import { play } from '../../discord/Voice';
import logger from "../../logger/main.mod";
import {IQueueableSpeech} from "../../tts/IQueueableSpeech";
import {fixMessage} from "../FixMessage";

/**
 * Handle message sent from user.
 * @param message - {@link Message} to handle.
 * @alpha
 */
export default async function onMessageReceive(message: Message) {
    // refresh inactive timer of current conversation
    const conversation = ConversationManager.get(message.guildId!)!;
    conversation.refresh();

    try {
        // create speech data to synthesize
        const author: GuildMember | null = message.member;
        const text: string = fixMessage(message);

        // ignore when author or invalid or text contains nothing
        if (!author || !text) return;

        // create queueable object and enqueue
        const speech: IQueueableSpeech = { author, text };
        await conversation.TTS.addQueue(speech);

        // create player callback TTS to use
        const voiceCallback = async function (stream: any) {
            // play audio stream
            const player = await play(message.guild!.id, stream);
            // wait until player finish playing stream
            await new Promise<void>(resolve => player.on('stateChange', () => resolve()));
        }
        // request TTS to speak
        logger.verbose({ topic: 'conversation', message: `<@${speech.author.id}> requested synthesize:` });
        logger.verbose({ topic: 'conversation', message: `${speech.text}` });
        await conversation.TTS.speak(voiceCallback);
    } catch (err: any) {
        logger.error({ topic: 'conversation', message: 'error occurred while requesting synthesize!' });
        logger.error({ topic: 'conversation', message: err.stack ? err.stack : err });
    }
}