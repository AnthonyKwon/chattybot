import { ThreadChannel, VoiceChannel } from "discord.js";
import { ObjectOccupiedError, OccupiedObject } from "./error/ObjectOccupiedError";

/**
 * Manages Text-to-Speech conversation, wrapping {@link VoiceChannel} and {@link ThreadChannel}.
 * @alpha
 */
export class ConversationManager {
    private guildId: string;
    private voice: VoiceChannel;
    private thread: ThreadChannel;

    constructor(voice: VoiceChannel, thread: ThreadChannel) {
        this.guildId = voice.guild.id;
        this.voice = voice;
        this.thread = thread;
    }

    /**
     * Create new conversation
     * @returns `true` when conversation created.
     * @throws {@link ObjectOccupiedError} when thread or voice already created and in use for current guild.
     * @alpha
     */
    create(): boolean {
        return false;
    }

    /**
     * Destroy existing conversation
     * @throws {@link ReferenceError} when conversation not created for current guild.
     * @alpha
     */
    destroy(): void {
    }
}