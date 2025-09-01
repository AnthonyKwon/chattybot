import { EventEmitter } from 'node:events';
import { CommandInteraction, ThreadChannel, VoiceChannel } from "discord.js";
import * as voice from "../discord/Voice";
import * as thread from "../discord/thread/Thread";
import { ObjectOccupiedError, OccupiedObject } from "./error/ObjectOccupiedError";
import onMessageReceive from "./event/OnMessageReceive";
import onVoiceInactive from "./event/OnVoiceInactive";
import config from "../config";
import logger from "../logger/main.mod";

// cache for saving conversation data
const conversationCache: Map<string, ConversationManager> = new Map();

/**
 * Manages Text-to-Speech conversation, wrapping {@link VoiceChannel} and {@link ThreadChannel}.
 * @alpha
 * @todo Manage Text-to-Speech also here, but after TTS typescript rework.
 */
export class ConversationManager extends EventEmitter {
    private readonly guildId: string;
    private readonly origin: CommandInteraction;
    private thread: ThreadChannel | undefined;
    private timer: NodeJS.Timeout | undefined;
    private readonly channel: VoiceChannel;

    /**
     * @private
     * this constructor only meant to be called by {@link create},
     * do not use from outside.
     */
    private constructor(origin: CommandInteraction, channel: VoiceChannel) {
        super();
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
     * Test if target guild and channel matches with saved conversation data.
     * @param guildId - guild id to test.
     * @param channelId - channel id to test.
     */
    verify(guildId: string, channelId: string): boolean {
        // check if guild id matches
        if (guildId !== this.guildId) return false;

        // check if thread id matches
        if (!this.thread || channelId !== this.thread.id) return false;

        // return true when every test passes
        return true;
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
        voice.onDisconnected(this.guildId, async () => {
            logger.verbose({ topic: 'conversation', message: `Destroying session in ${this.guildId} as disconnected from voice channel.`});
            await this.destroy();
            await this.setOrigin(':cry:');
        }, this);

        // register conversation related events
        this.on(`message-${this.guildId}`, onMessageReceive);    // new message on thread
        this.on(`threadObsolete-${this.guildId}`, () => {
            logger.verbose({ topic: 'conversation', message: `Destroying session in ${this.guildId} as associated Thread got obsolete.`});
            this.destroy();
        });  // linked thread archived or deleted

        // register timeout on voice channel inactive
        this.timer = setTimeout(onVoiceInactive, config.awayTime * 60000, this.guildId);

        // create new thread from origin interaction
        this.thread = await thread.create(this.origin, threadOptions);

        // alter user that conversation session is started
        await this.setOrigin(':ballot_box_with_check:');
    }

    /**
     * Destroy current conversation.
     * @throws {@link ReferenceError} when conversation not created for current guild.
     * @alpha
     */
    async destroy(): Promise<VoiceChannel> {
        // destroy current thread
        if (this.thread && await thread.validate(this.thread)) await thread.destroy(this.thread);

        // unregister conversation event
        this.removeAllListeners(`message-${this.guildId}`);  // new message on thread
        this.removeAllListeners(`threadObsolete-${this.guildId}`);  // linked thread archived or deleted

        // unregister timeout on voice channel inactive
        clearTimeout(this.timer);

        // leave voice channel in current guild
        if (voice.isConnected(this.guildId)) voice.leave(this.guildId);

        // alert user that conversation session is destroyed
        await this.setOrigin(':wave:')

        // remove from conversation cache
        conversationCache.delete(this.guildId);

        return this.channel;
    }

    /** Refresh inactivity timer.  */
    refresh(): void {
        if (this.timer) this.timer.refresh();
    }

    /**
     * Set origin message with specified content.
     * @param text - content to set.
     */
    async setOrigin(text: string) {
        const epoch = Math.floor(Date.now() / 1000);  // unix epoch of current time
        await this.origin.editReply(`${this.channel} ${text} <t:${epoch}:R>`);
    }
}