const voice = require('@discordjs/voice');
const localeMap = new Map();

// handle disconnect event
const onDisconnect = (connection, threadDestroyCallback) => {
    connection.on(voice.VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                voice.entersState(connection, voice.VoiceConnectionStatus.Signalling, 5_000),
                voice.entersState(connection, voice.VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
        } catch(err) {
            // Seems to be a real disconnect which SHOULDN'T be recovered from
            connection.destroy();
            // remove locale data from localeMap
            localeMap.delete(connection.joinConfig.guildId);
            // remove voice thread
            threadDestroyCallback();
        }
    });
};

class DiscordVoice {
    constructor(guildId) {
        this._guildId = guildId;
    }

    // (getter) return if object connected into voice channel
    get connected() {
        // get bot's current voice connection on guild
        const connection = voice.getVoiceConnection(this._guildId);
        return connection ? true : false;
    }

    // (getter) return current joined channel id
    get channelId() {
        // get bot's current voice connection on guild
        const connection = voice.getVoiceConnection(this._guildId);
        // return channel id if available, if not, return undefined
        return connection ? connection.joinConfig.channelId : undefined;
    }

    // (get/setter) locale for the voice channel
    get locale()  { return localeMap.get(this._guildId); }
    set locale(value)  { localeMap.set(this._guildId, value); }

    // handle disconnect event
    handleDisconnect(threadDestroyCallback) {
        const connection = voice.getVoiceConnection(this._guildId);
        if(!connection) return;
        return onDisconnect(connection, threadDestroyCallback);
    }

    // join into specified voice channel
    async join(channel) {
        // create voice connection and wait for it
        const connection = await voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        // wait until connected to voice channel
        await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 5_000);
        // set speaking status to none
        connection.setSpeaking(0);
    }

    // play voice stream to voice channel
    play(stream) {
        // get bot's current voice connection on guild
        const connection = voice.getVoiceConnection(this._guildId);
        // check if bot joined voice channel first
        if (!connection) return;
        
        // create audio player and resource
        const player = voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Stop }});
        const resource = voice.createAudioResource(stream, { inputType: voice.StreamType.OggOpus });
        connection.subscribe(player);  // link player to connection
        player.play(resource);  // play audio

        return voice.entersState(player, voice.AudioPlayerStatus.Playing, 5_000);
    }

    // leave from currently joined voice channel
    async leave() {
        // get bot's current voice connection on guild
        const connection = voice.getVoiceConnection(this._guildId);
        // check if bot joined voice channel first
        if (!connection) return;
        // destroy(disconnect) current connection
        connection.destroy();
        // remove locale data from localeMap
        localeMap.delete(this._guildId);
    }
}

module.exports = DiscordVoice;
