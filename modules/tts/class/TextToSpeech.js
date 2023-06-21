const TTSMap = new Map();

// get Subclass dynamically
const getSubClass = name => {
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

class TTSClass {
    constructor(type, queue=undefined) {
        this._prevQueue = undefined; // previous message queue
        this._queue = queue;
        this._busy = false; // bot speaking check flag
        this._type = getSubClass(type); // TTS type
    }

    // (static) create TTS object from guild
    static create(guildId, type, queue=undefined) {
        const TTSobject = new TTSClass(type, queue);
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
    async addQueue(ttsUser, message) {
        // If queue is not initialize, initialize it first
        if (!this._queue) this._queue = [];
        this._queue.push(
            { 
                author: ttsUser,
                content: message 
            });
        // if TTS is not speaking, make it speak
        if (this._speaking === false) await this.speak();
    }
    get queue() {
        return this._queue;
    }

    // (getter,setter) Type: Get/Set an type of TTS engine
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = new ClassMap[value];
    }

    // (getter) return TTS busy checker
    get isBusy()  { return this._busy; }

    // Speak as TTS: call specified TTS engine and read text (in queue)
    async speak() {
        this._busy = true; // set speaking marker to true
        let stream = [];
        do {
            // check if previous speaker and current speaker in queue is same (will decide to speak header)
            const willSpeakHeader = true;
            if (this.prevQueue && this._prevQueue.author.id == this.queue[0].author.id)
                willSpeakHeader = false;

            // generate speech and add to array
            stream.push(await this._type.speak(this._queue[0], willSpeakHeader));
            
            // shift queue array and save previous queue to other variable (for author comparison)
            this._prevQueue = this._queue.shift();
        } while(this._queue.length > 0);

        this._busy = false; // set busy marker to false
        // return array of stream
        return stream;
    }
}

module.exports = TTSClass;
