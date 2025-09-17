import { ConversationManager } from '../Conversation';
import logger from '../../logger/main.mod';

/**
 *
 * @param guildId
 */
export default async function onVoiceInactive(guildId: string): Promise<void> {
    // get conversation from current guild
    const conversation = ConversationManager.get(guildId);

    // ignore when conversation is already destroyed
    if (!conversation) return;

    // destroy the current conversation session
    logger.verbose({ topic: 'conversation', message: `Destroying session in ${guildId} as it inactive for too long.`});
    await conversation.destroy(true);

    // alert user that conversation session is destroyed
    await conversation.setOrigin(':sleeping:');
}