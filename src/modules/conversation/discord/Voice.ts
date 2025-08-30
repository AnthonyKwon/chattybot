import { Readable } from 'node:stream';
import { VoiceChannel, Guild } from 'discord.js';
import * as voice from '@discordjs/voice';
import { InvalidChannelError } from '../error/InvalidChannelError';

/**
 * Join the specified {@link VoiceChannel}
 * @param channel - {@link VoiceChannel} for bot to join
 * @returns {@link Promise} of {@link voice.VoiceConnection} bot used to join voice channel.
 * @alpha
 */
export async function join(channel: VoiceChannel): Promise<voice.VoiceConnection> {
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
 * Leave the specified {@link VoiceChannel}
 * @param guildId - id of {@link Guild} to leave voice channel
 * @throws InvalidChannelError
 * when not connected to voice channel to leave.
 * @alpha
 */
export function leave(guildId: string): void {
    const connection: voice.VoiceConnection | undefined = voice.getVoiceConnection(guildId);

    // throw InvalidChannelError when connection not exists
    if (!connection) throw new InvalidChannelError("Can't find any voice connection to destroy.");

    // destroy the voice connection
    connection.destroy();
}

/**
 * check If bot is connected to voice channel in specified guild
 * @param guildId - id of the {@link Guild} to check connectivity
 * @returns result of connectivity check as {@link boolean}.
 */
export function connected(guildId: string): boolean {
    // get bot's current voice connection on guild
    const connection = voice.getVoiceConnection(guildId);
    return !!connection;
}

/**
 * Play audio to voice channel
 * @param guildId - id of {@link Guild} to play audio in voice channel
 * @param stream - {@link Readable} to play in voice channel
 * @returns {@link Promise} of {@link voice.AudioPlayer} used to play audio.
 * @throws InvalidChannelError
 * when not connected to voice channel to speak.
 * @alpha
 */
export function play(guildId: string, stream: Readable): Promise<voice.AudioPlayer> {
    // get bot's current voice connection on guild
    const connection: voice.VoiceConnection | undefined = voice.getVoiceConnection(guildId);

    // throw InvalidChannelError when connection not exists
    if (!connection) throw new InvalidChannelError("Can't find any voice connection to destroy.");

    // create audio player and resource
    const player: voice.AudioPlayer = voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Stop }});
    const resource: voice.AudioResource<null> = voice.createAudioResource(stream, { inputType: voice.StreamType.OggOpus });

    // link player to audio connection
    connection.subscribe(player);
    // register resource and play it to voice connection
    player.play(resource);

    // return the audio player
    return voice.entersState(player, voice.AudioPlayerStatus.Playing, 5_000);
}

/**
 * Handle disconnection event of {@link VoiceChannel}
 * @param guildId - id of {@link Guild} to fetch the voice channel
 * @param callback - callback function to run
 */
export function onDisconnected(guildId: string, callback: VoidFunction): void {
    // get bot's current voice connection on guild
    const connection: voice.VoiceConnection | undefined = voice.getVoiceConnection(guildId);

    // throw InvalidChannelError when connection not exists
    if (!connection) throw new InvalidChannelError("Can't find any voice connection to destroy.");

    // check for disconnection and handle disconnect event
    connection.on(voice.VoiceConnectionStatus.Disconnected, async (oldState, newState): Promise<void> => {
        try {
            await Promise.race([
                voice.entersState(connection, voice.VoiceConnectionStatus.Signalling, 5_000),
                voice.entersState(connection, voice.VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
        } catch(err) {
            callback();
        }
    });
}