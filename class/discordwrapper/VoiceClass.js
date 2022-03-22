class VoiceClass {
    constructor(guildId) {
        this._connection = undefined;
        this._channel = {
            id: 0,
            name: undefined
        }
        this._guildId = guildId;
        this._volume = 100;
    }

    get channel() {
        return this._channel;
    }

    /* return connection dispatcher if available */
    get dispatcher() {
        if (!this.connection || this._connection.status !== 0) return undefined;
        return this._connection.dispatcher;
    }

    /* get guild ID of class */
    get guildId() {
        return this.guildId;
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

    /* join discord voice connection */
    async join(channel) {
        this._connection = await channel.join();
        /* Set speaking status to none */
        this._connection.setSpeaking(0);
        /* set channel info */
        this._channel.id = this._connection.channel.id;
        this._channel.name = this._connection.channel.name;
        return true;
    }

    play(stream, option=undefined) {
        /* Join voice channel first if not */
        if (!this._connection || this._connection.status !== 0) {
            return false;
        }
        const output = this._connection.play(stream, option);
        this._connection.dispatcher.setVolume(this._volume / 100);
        return output;
    }

    /* leave discord voice connection */
    async leave() {
        if (this._connection.status !== 0) return;
        this._connection.disconnect();
        return true;
    }
}

module.exports = VoiceClass;
