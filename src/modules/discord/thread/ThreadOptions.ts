import { ThreadAutoArchiveDuration, ThreadChannel } from 'discord.js';

/** Options to create {@link ThreadChannel}. */
export class ThreadOptions {
    /** Name of the thread */
    public name: string;
    /** Auto-archive duration */
    public autoArchiveDuration: ThreadAutoArchiveDuration;
    /** Cooldown of the chat */
    public rateLimitPeruser: number;

    /**
     * Create new {@link ThreadOptions} object.
     * @param name name of the thread
     * @param autoArchiveDuration auto-archive duration
     * @param rateLimitPeruser cooldown of the chat
     */
    constructor(name: string, autoArchiveDuration: ThreadAutoArchiveDuration = ThreadAutoArchiveDuration.OneHour, rateLimitPeruser: number = 0) {
        this.name = name;
        this.autoArchiveDuration = autoArchiveDuration;
        this.rateLimitPeruser = rateLimitPeruser;
    }
}