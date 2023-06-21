const voice = require('@discordjs/voice');

class VoiceClass {
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
        return connection.joinConfig.channelId;
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
    }
}

module.exports = VoiceClass;
