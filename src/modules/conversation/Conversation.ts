import { CommandInteraction, Message, ThreadChannel, VoiceChannel } from "discord.js";
import * as voice from "../discord/Voice";
import * as thread from "../discord/thread/Thread";
import { ObjectOccupiedError, OccupiedObject } from "./error/ObjectOccupiedError";
import MessageHandler from "./MessageHandler";

// cache for saving conversation data
const conversationCache: Map<string, ConversationManager> = new Map();

/**
 * @classDesc Manages Text-to-Speech conversation, wrapping {@link VoiceChannel} and {@link ThreadChannel}.
 * @class
 * @alpha
 */
export class ConversationManager {
    private readonly guildId: string;
    private readonly origin: CommandInteraction;
    private thread: ThreadChannel | undefined;
    private readonly channel: VoiceChannel;

    /**
     * @private
     * this constructor only meant to be called by {@link create},
     * do not use from outside.
     */
    private constructor(origin: CommandInteraction, channel: VoiceChannel) {
        // build new conversation data
        this.guildId = channel.guild.id;
        this.origin = origin;
        this.channel = channel;
    }

    /**
     * Create a new conversation session.
     * @param origin - Interaction message where conversation has started
     * @param channel - Voice channel to connect
     * @returns new {@link ConversationManager} with provided parameters.
     * @alpha
     */
    static create(origin: CommandInteraction, channel: VoiceChannel): ConversationManager {
        // return conversation session from cache if exists
        if (conversationCache.has(channel.guild.id))
            return conversationCache.get(channel.guild.id)!;

        // create new conversation session
        const conversation = new ConversationManager(origin, channel);
        conversationCache.set(channel.guild.id, conversation);
        return conversation;
    }

    /**
     * Check if conversation data exists in cache.
     * @param guildId - {@link Guild} to test cache.
     * @returns true if conversation data exists in cache, false if not.
     */
    static has(guildId: string | undefined): boolean {
        if (guildId === undefined) return false;
        return conversationCache.has(guildId);
    }

    /**
     * Get conversation data from cache.
     * @param guildId - {@link Guild} to get cache.
     * @returns Cached {@link ConversationManager} object if found, {@link undefined} if not.
     */
    static get(guildId: string | undefined): ConversationManager | undefined {
        if (guildId === undefined) return undefined;
        return conversationCache.get(guildId);
    }

    /**
     * Start current conversation session.
     * @throws {@link ObjectOccupiedError} when voice already created and in use for current guild.
     * @alpha
     */
    async start(threadOptions: thread.ThreadOptions): Promise<void> {
        // check if client is able to connect voice channel in specified guild
        if (voice.isConnected(this.guildId))
            throw new ObjectOccupiedError('Client already connected to voice channel in this guild.', OccupiedObject.Voice);

        // join voice channel
        await voice.join(this.channel);

        // register VC on disconnection event
        voice.onDisconnected(this.guildId, this.destroy, this);

        // create new thread from origin interaction
        this.thread = await thread.create(this.origin, threadOptions);

        // alter user that conversation session is started
        const epoch = Math.floor(Date.now() / 1000);  // unix epoch of current time
        await this.origin.editReply(`${this.channel} :ballot_box_with_check: <t:${epoch}:R>`);
    }

    /**
     * Destroy current conversation.
     * @throws {@link ReferenceError} when conversation not created for current guild.
     * @alpha
     */
    async destroy(): Promise<VoiceChannel> {
        // destroy current thread
        if (this.thread && await thread.validate(this.thread)) await thread.destroy(this.thread);

        // leave voice channel in current guild
        if (voice.isConnected(this.guildId)) voice.leave(this.guildId);

        // alert user that conversation session is destroyed
        const epoch = Math.floor(Date.now() / 1000);  // unix epoch of current time
        await this.origin.editReply(`${this.channel} :wave: <t:${epoch}:R>`);

        // remove from conversation cache
        conversationCache.delete(this.guildId);

        return this.channel;
    }

    /**
     * Handle message sent from user.
     * @param message - message to handle.
     */
    async onMessage(message: Message) {
        // ignore message not sent from current guild
        if (message.guildId !== this.guildId) return;

        // ignore message not sent from current thread
        if (!this.thread || message.channelId !== this.thread.id) return;

        // call external handler function
        await MessageHandler(this.channel, message);
    }
}