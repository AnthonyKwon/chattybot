const config = require('../../config.js');

// TTS object map
const TTSMap = new Map();

// create TTS object from guild
const createTTSObject = (guildId, params) => {
    const TTSobject = new TextToSpeech(config.ttsProvider, params);
    TTSMap.set(guildId, TTSobject);
    return TTSobject;
}

// get TTS object from guild
const getTTSObject = guildId => TTSMap.get(guildId)

// get provider subclass dynamically
const getTTSProvider = (id, params) => {
    const fs = require('fs');
    const path = require('path');
    const scripts = fs.readdirSync(path.join(__dirname, 'provider')).filter(file => file.match('^.*Provider\.js$'));

    for (const file of scripts) {
        const subClass = require(path.join(__dirname, 'provider', file));
        try {
            if (subClass[id] && subClass[id].ttsAvailable)
                return new subClass[id](params);
        } catch (err) {
            // TTS not available
            console.error(err.stack);
        }
    }
}

class TextToSpeech {
    constructor(providerId, params) {
        this._prevQueue = undefined; // previous message queue
        this._queue = undefined;
        this._provider = getTTSProvider(providerId, params); // TTS provider
    }

    // (static) get object, create one if not exists
    static getOrCreate(guildId, params = undefined) {
        let TTSobject = getTTSObject(guildId);
        if (!TTSobject) TTSobject = createTTSObject(guildId, params);
        return TTSobject;
    }

    // (static) parameter builder for TTS engine
    get ParameterBuilder() { return this._provider.ParameterBuilder }

    // (static) delete TTS object from guild
    static delete(guildId) { TTSMap.delete(guildId) }

    // (getter,setter) Queue: Get/Set an queue array
    //TODO: create TTSUser and TTSQueue type on typescript transform
    async addQueue(ttsUser, locale, message) {
        // If queue is not initialize, initialize it first
        if (!this._queue) this._queue = [];
        this._queue.push(
            {
                author: ttsUser,
                locale: locale,
                content: message
            });
        // if TTS is not speaking, make it speak
        //if (this._speaking === false) await this.speak();
    }
    get queue() { return this._queue }

    // request TTS provider to synthesize and stream to callback
    requestSpeak(voiceCallback) {
        // check if queue if empty (prevent simultaneous execution)
        if (this.queue.length > 1) return;
        return this.speak(voiceCallback);
    }

    // Speak as TTS: call specified TTS engine and read text (in queue)
    async speak(voiceCallback) {
        do {
            // set working locale of current TTS provider
            await this._provider.setLocale(this.queue[0].locale);

            // check if previous speaker and current speaker in queue is same (will decide to speak header)
            let willSpeakHeader = true;
            if (this._prevQueue && this._prevQueue.author.id == this.queue[0].author.id)
                willSpeakHeader = false;

            // generate speech and send it to voice callback
            const stream = await this._provider.speak(this._queue[0], willSpeakHeader);
            await voiceCallback(stream);

            // shift queue array and save previous queue to other variable (for author comparison)
            this._prevQueue = this._queue.shift();
        } while (this._queue.length > 0);
    }
}

module.exports = TextToSpeech;
