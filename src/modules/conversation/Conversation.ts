import { CommandInteraction, ThreadChannel, VoiceChannel } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
import * as voice from "./discord/Voice";
import * as thread from "./discord/Thread";
import { ThreadOptions } from "./discord/ThreadOptions";
import { ObjectOccupiedError, OccupiedObject } from "./error/ObjectOccupiedError";

/**
 * Manages Text-to-Speech conversation, wrapping {@link VoiceChannel} and {@link ThreadChannel}.
 * @alpha
 */
export class ConversationManager {
    private readonly guildId: string;
    private readonly origin: CommandInteraction;
    private thread: ThreadChannel | undefined;
    private readonly voice: VoiceChannel;

    constructor(origin: CommandInteraction, voice: VoiceChannel) {
        this.guildId = voice.guild.id;
        this.origin = origin;
        this.voice = voice;
    }

    /**
     * Create new conversation.
     * @returns `true` when conversation created.
     * @throws {@link ObjectOccupiedError} when voice already created and in use for current guild.
     * @alpha
     */
    async create(): Promise<void> {
        // check if client is able to connect voice channel in specified guild
        if (voice.connected(this.guildId))
            throw new ObjectOccupiedError('Client already connected to voice channel in this guild.', OccupiedObject.Voice);

        // create new thread from origin interaction
        const threadOptions = new ThreadOptions('brand-new-test', 5, 1);
        this.thread = await thread.create(this.origin, threadOptions);
        // join voice channel
        await voice.join(this.voice);
    }

    /**
     * Destroy current conversation.
     * @param force - Force {@link VoiceConnection} and {@link ThreadChannel} to destroy.
     * @throws {@link ReferenceError} when conversation not created for current guild.
     * @alpha
     */
    async destroy(force: boolean = false): Promise<void> {
        // check if full conversation object already exists (unless forced to destroy)
        if (!force && (!this.thread || !await thread.validate(this.thread) || !voice.connected(this.guildId)))
            throw new ReferenceError('Conversation does not exist.');

        // leave voice channel in current guild
        if (voice.connected(this.guildId)) voice.leave(this.guildId);
        // destroy current thread
        if (this.thread && await thread.validate(this.thread)) thread.destroy(this.thread);
    }
}