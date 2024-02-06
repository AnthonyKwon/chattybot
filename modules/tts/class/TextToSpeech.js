const TTSMap = new Map();

// get provider subclass dynamically
const getProvider = name => {
    const fs = require('fs');
    const path = require('path');
    const scripts = fs.readdirSync(__dirname).filter(file => file.match('^.*TtsProvider\.js$'));

    for (const file of scripts) {
        const subClass = require(path.join(__dirname, file));
        try {
            if (subClass[name] && subClass[name].ttsAvailable)
                return new subClass[name];
        } catch(err) {
            // TTS not available
            console.error(err.stack);
        }
    }
}

class TextToSpeech {
    constructor(providerId, queue=undefined) {
        this._prevQueue = undefined; // previous message queue
        this._queue = queue;
        this._provider = getProvider(providerId); // TTS provider
    }

    // (static) create TTS object from guild
    static async create(guildId, type, queue=undefined) {
        const TTSobject = new TextToSpeech(type, queue);
        TTSMap.set(guildId, TTSobject);
        return TTSobject;
    }

    // (static) get TTS object from guild
    static get(guildId) {
        const TTSobject = TTSMap.get(guildId);
        return TTSobject;
    }

    // (static) delete TTS object from guild
    static delete(guildId) {
        TTSMap.delete(guildId);
    }

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
    get queue()  { return this._queue; }
    // (getter,setter) Type: Get/Set an type of TTS engine
    get provider()  { return this._provider; }

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
        } while(this._queue.length > 0);
    }
}

module.exports = TextToSpeech;
