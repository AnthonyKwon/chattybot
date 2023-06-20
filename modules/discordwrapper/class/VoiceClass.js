const path = require('node:path');
const voice = require('@discordjs/voice');
const logger = require(path.join(path.dirname(require.main.filename), 'modules', 'logger', 'main.mod.js'));

class VoiceClass {
    constructor(guildId) {
        this._connection = undefined;
        this._channel = {
            id: 0,
            name: undefined
        }
        this._guildId = guildId;
        this._tts = undefined;
        this._volume = 100;
    }

    get channel() {
        return this._channel;
    }

    /* get guild ID of class */
    get guildId() {
        return this.guildId;
    }

    // get-set TTS class
    get TTS() {
        return this._tts;
    }
    set TTS(value) {
        this._tts = value;
    }

    /* get-set voice volume */
    get volume() {
        return this._volume;
    }
    set volume(rate) {
        if (rate <= 200 && rate >= 0) {
            this._volume = rate;
            if (this._connection.dispatcher)
                this._connection.dispatcher.setVolume(this._volume / 100);
        }
    }

    // join discord voice connection
    async join(channel) {
        // create voice connection and wait for it
        this._connection = await voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        await voice.entersState(this._connection, voice.VoiceConnectionStatus.Ready, 5_000);

        // set speaking status to none
        this._connection.setSpeaking(0);
        // set channel info
        this._channel.id = channel.id;
        this._channel.name = channel.name;
        return true;
        
    }

    play(stream, option=undefined) {
        //TODO: check if bot joined voice channel first
        const player = voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Stop }});
        const resource = voice.createAudioResource(stream, { inputType: voice.StreamType.OggOpus });

        this._connection.subscribe(player);
        player.play(resource);

        //TODO: set volume
        return voice.entersState(player, voice.AudioPlayerStatus.Playing, 5_000);
    }

    /* leave discord voice connection */
    async leave() {
        //TODO: check if bot join voice channel first
        this._connection.destroy();
        return true;
    }
}

module.exports = VoiceClass;
