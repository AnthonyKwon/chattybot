import { Readable } from 'node:stream';
import { VoiceBasedChannel, Guild } from 'discord.js';
import * as voice from '@discordjs/voice';
import { InvalidChannelError } from './error/InvalidChannelError';

// cache for saving player data
const playerCache: Map<string, voice.AudioPlayer> = new Map();

/**
 * Join the specified {@link VoiceBasedChannel}
 * @param channel - {@link VoiceBasedChannel} for bot to join
 * @returns {@link Promise} of {@link voice.VoiceConnection} bot used to join voice channel.
 */
export async function join(channel: VoiceBasedChannel): Promise<voice.VoiceConnection> {
    // destroy existing voice connection (when have one)
    if (voice.getVoiceConnection(channel.guildId)) leave(channel.guildId);

    // create voice connection and wait for it
    const connection: voice.VoiceConnection = voice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator as voice.DiscordGatewayAdapterCreator
    });
    // wait until connected to voice channel
    await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 5_000);
    // set speaking status to none
    connection.setSpeaking(false);

    // return the voice connection
    return connection;
}

/**
 * Leave the specified {@link VoiceBasedChannel}
 * @param guildId - id of {@link Guild} to leave voice channel
 * @throws InvalidChannelError
 * when not connected to voice channel to leave.
 */
export function leave(guildId: string): void {
    const connection: voice.VoiceConnection | undefined = voice.getVoiceConnection(guildId);

    // throw InvalidChannelError when connection not exists
    if (!connection) throw new InvalidChannelError("Can't find any voice connection to destroy.");

    // destroy the voice connection
    connection.destroy();
}

/**
 * Stop the audio player.
 * @param guildId id of the {@link Guild} to get player.
 */
export function stop(guildId: string): void {
    const player: voice.AudioPlayer | undefined = playerCache.get(guildId);

    // throw InvalidChannelError when player not exists
    if (!player) throw new InvalidChannelError("Can't find any voice player to reset.");

    // stop the target player
    player.stop();
}

/**
 * check If bot is connected to voice channel in specified guild
 * @param guildId - id of the {@link Guild} to check connectivity
 * @returns result of connectivity check as {@link boolean}.
 */
export function isConnected(guildId: string): boolean {
    // get bot's current voice connection on guild
    return !!voice.getVoiceConnection(guildId);
}

/**
 * Play audio to voice channel
 * @param guildId - id of {@link Guild} to play audio in voice channel
 * @param stream - {@link Readable} to play in voice channel
 * @returns {@link Promise} of {@link voice.AudioPlayer} used to play audio.
 * @throws InvalidChannelError
 * when not connected to voice channel to speak.
 */
export function play(guildId: string, stream: Readable): Promise<voice.AudioPlayer> {
    // get bot's current voice connection on guild
    const connection: voice.VoiceConnection | undefined = voice.getVoiceConnection(guildId);

    // throw InvalidChannelError when connection not exists
    if (!connection) throw new InvalidChannelError("Can't find any voice connection to play.");

    // create audio player and resource
    const player: voice.AudioPlayer = playerCache.get(guildId) ??
        voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Stop }});
    const resource: voice.AudioResource<null> = voice.createAudioResource(stream, { inputType: voice.StreamType.OggOpus });

    // link player to audio connection
    connection.subscribe(player);
    // register resource and play it to voice connection
    player.play(resource);

    // save current player to cache
    playerCache.set(guildId, player);

    // return the audio player
    return voice.entersState(player, voice.AudioPlayerStatus.Playing, 5_000);
}

/**
 * Handle disconnection event of {@link VoiceBasedChannel}
 * @param guildId - id of {@link Guild} to fetch the voice channel
 * @param callback - callback function to run
 * @param thisArg - {@link this} value to use in callback
 * @param params - parameters to use in callback
 * @throws InvalidChannelError
 * when not connected to voice channel to handle event.
 * @beta
 * @todo Needs to investigate the issue that event does not fire when no one in Voice Channel.
 */
export function onDisconnected(guildId: string, callback: Function, thisArg: any, ...params: any): void {
    // get bot's current voice connection on guild
    const connection: voice.VoiceConnection | undefined = voice.getVoiceConnection(guildId);

    // throw InvalidChannelError when connection not exists
    if (!connection) throw new InvalidChannelError("Can't find any voice connection to handle event.");

    // check for disconnection and handle disconnect event
    connection.on(voice.VoiceConnectionStatus.Disconnected, async (oldState, newState): Promise<void> => {
        try {
            await Promise.race([
                voice.entersState(connection, voice.VoiceConnectionStatus.Signalling, 5_000),
                voice.entersState(connection, voice.VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
        } catch(err) {
            callback.apply(thisArg, params);
        }
    });
}