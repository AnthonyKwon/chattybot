import { EventEmitter } from 'node:events';
import {CommandInteraction, Message, ThreadChannel, VoiceChannel} from "discord.js";
import * as voice from "../discord/Voice";
import * as thread from "../discord/thread/Thread";
import { ObjectOccupiedError, OccupiedObject } from "./error/ObjectOccupiedError";
import onMessageReceive from "./event/OnMessageReceive";
import onVoiceInactive from "./event/OnVoiceInactive";
import config from "../config/ConfigLoader";
import logger from "../log/Logger";
import TextToSpeech from "../tts/TextToSpeech";
import {IRequestBuilderOptions} from "../tts/provider/IRequestBuilderOptions";

// cache for saving conversation data
const conversationCache: Map<string, ConversationManager> = new Map();

/**
 * Manages Text-to-Speech conversation, wrapping {@link VoiceChannel} and {@link ThreadChannel}.
 * @alpha
 */
export class ConversationManager extends EventEmitter {
    private _destroyed: boolean = false;
    private readonly _guildId: string;
    private readonly _originInteraction: CommandInteraction;
    private _origin: Message | undefined;
    private _thread: ThreadChannel | undefined;
    private _timer: NodeJS.Timeout | undefined;
    private readonly _channel: VoiceChannel;
    private _tts: TextToSpeech | undefined;

    /**
     * @private
     * this constructor only meant to be called by {@link create},
     * do not use from outside.
     */
    private constructor(origin: CommandInteraction, channel: VoiceChannel) {
        super();
        // build new conversation data
        this._guildId = channel.guild.id;
        this._originInteraction = origin;
        this._channel = channel;
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
        if (guildId !== this._guildId) return false;

        // check if thread id matches
        if (!this._thread || channelId !== this._thread.id) return false;

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
        if (voice.isConnected(this._guildId))
            throw new ObjectOccupiedError('Client already connected to voice channel in this guild.', OccupiedObject.Voice);

        // join voice channel
        await voice.join(this._channel);

        // register VC on disconnection event
        voice.onDisconnected(this._guildId, async () => {
            logger.verbose({ topic: 'conversation', message: `Destroying session in ${this._guildId} as disconnected from voice channel.`});
            await this.destroy(true);
            await this.setOrigin(':cry:');
        }, this);

        // register conversation related events
        this.on(`message-${this._guildId}`, onMessageReceive);    // new message on thread
        this.on(`threadObsolete-${this._guildId}`, () => {
            logger.verbose({ topic: 'conversation', message: `Destroying session in ${this._guildId} as associated Thread got obsolete.`});
            this.destroy();
        });  // linked thread archived or deleted

        // register timeout on voice channel inactive
        this._timer = setTimeout(onVoiceInactive, config.inactiveTimeout * 60000, this._guildId);

        // fetch message object from origin interaction
        this._origin = await this._originInteraction.fetchReply();

        // create new thread from origin interaction
        this._thread = await thread.create(this._origin, threadOptions);

        // create new Text-to-Speech synthesizer
        const locale: string = this._channel.guild.preferredLocale ?? config.defaultLocale;
        const options: IRequestBuilderOptions = { locale: locale };
        this._tts = await TextToSpeech.create(options);

        // alter user that conversation session is started
        const epoch = Math.floor(Date.now() / 1000);  // unix epoch of current time
        await this._originInteraction.editReply(`${this._channel} :ballot_box_with_check: <t:${epoch}:R>`);  // swap origin to Message object
    }

    /** Tells if current conversation is destroyed. */
    get destroyed(): boolean { return this._destroyed; }

    /**
     * Destroy current conversation.
     * @param quiet If true, origin message will not be updated.
     * @throws {@link ReferenceError} when conversation not created for current guild.
     * @alpha
     */
    async destroy(quiet: Boolean = false): Promise<VoiceChannel> {
        // mark this conversation as destroyed
        this._destroyed = true;

        // destroy current thread
        if (this._thread && await thread.validate(this._thread)) await thread.destroy(this._thread);

        // unregister conversation event
        this.removeAllListeners(`message-${this._guildId}`);  // new message on thread
        this.removeAllListeners(`threadObsolete-${this._guildId}`);  // linked thread archived or deleted

        // unregister timeout on voice channel inactive
        clearTimeout(this._timer);

        // leave voice channel in current guild
        if (voice.isConnected(this._guildId)) voice.leave(this._guildId);

        // alert user that conversation session is destroyed
        if (!quiet) await this.setOrigin(':wave:')

        // remove from conversation cache
        conversationCache.delete(this._guildId);

        return this._channel;
    }

    async reset() {
        // re-initialize the Text-to-Speech engine
        const locale: string = this._channel.guild.preferredLocale ?? config.defaultLocale;
        const options: IRequestBuilderOptions = { locale: locale };
        this._tts = await TextToSpeech.create(options);

        // stop the current player
        voice.stop(this._guildId);
    }

    /** Text-to-Speech synthesizer of this conversation. */
    get TTS() {
        // throw error when tts object not found
        if (!this._tts) throw new Error(`TTS object not found.`);
        return this._tts;
    }

    /** Refresh inactivity timer.  */
    refresh(): void {
        if (this._timer) this._timer.refresh();
    }

    /**
     * Set origin message with specified content.
     * @param text - content to set.
     */
    async setOrigin(text: string) {
        // ignore if type of origin is not Message (conversation is not started yet)
        if (!this._origin) return;

        const epoch = Math.floor(Date.now() / 1000);  // unix epoch of current time
        await this._origin.edit(`${this._channel} ${text} <t:${epoch}:R>`);
    }
}