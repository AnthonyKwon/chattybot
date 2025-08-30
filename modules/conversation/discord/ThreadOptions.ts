/**
 * Options to create {@link ThreadChannel}.
 * @alpha
 */
export class ThreadOptions {
    /** Name of the thread */
    public name: string;
    /** Auto-archive duration */
    public autoArchiveDuration: number;
    /** Cooldown of the chat */
    public rateLimitPeruser: number;

    /**
     * Create new {@link ThreadOptions} object.
     * @param name - name of the thread
     * @param autoArchiveDuration - auto-archive duration
     * @param rateLimitPeruser - cooldown of the chat
     */
    constructor(name: string, autoArchiveDuration: number = 5, rateLimitPeruser: number = 0) {
        this.name = name;
        this.autoArchiveDuration = autoArchiveDuration;
        this.rateLimitPeruser = rateLimitPeruser;
    }
}