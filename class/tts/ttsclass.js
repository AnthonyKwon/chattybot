const { once } = require('events');
const discord = require('../../module/discordwrapper'); //TODO: remove direct access to discord module
//TODO: implement voice class

// get Subclass dynamically
const getSubClass = name => {
    const fs = require('fs');
    const path = require('path');
    const scripts = fs.readdirSync(__dirname).filter(file => file.match('^tts-.*\.js$'));

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

// Get server username from user's ID
const getUsername = (client, guild, userId) => {
	const username = client.guilds.cache.get(guild.id).member(userId).displayName;
    return username.split('_').join(' ');
}

class TTSClass {
    constructor(message, type, queue, waitForFinish=true) {
        this._client = message.client;
        this._guild = message.guild;
        this._voice = message.client.voice.session.get(message.guild.id);

        this._lastAuthor = undefined; // last message sender
        this._queue = queue;
        this._speaking = false; // bot speaking check flag
        this._type = getSubClass(type); // TTS type
        this._waitForFinish = waitForFinish; // decide wait or inturrupt when next message has received while speaking 
    }

    // (static) Generate Queue Array: Create and return queue array
    static genQueueArr(...queueArgs) {
        const authorInfo = queueArgs.filter((element, index) => index % 2  === 0);
        const message = queueArgs.filter((element, index) => index % 2 === 1);
        const queueArr = [];
        for (let i = 0; i < authorId.length; i++) {
            queueArr.push(
                {
                    author: {
                        id: authorInfo[i].id,
                        name: getUsername(this._client, this._guild, authorInfo[i].id)
                    },
                    content: message[i] 
                });
        }
        return queueArr;
    }

    // Get/Set Queue: Get/Set an queue array
    async addQueue(author, message) {
        // If queue is not initialize, initialize it first
        if (!this._queue) this._queue = [];
        this._queue.push(
            { 
                author: {
                    id: author.id,
                    name: getUsername(this._client, this._guild, author.id)
                },
                content: message 
            });
        // if TTS is not speaking, make it speak
        if (this._speaking === false) await this.speak();
    }
    get queue() {
        return this._queue;
    }

    // Get/Set Type: Get/Set an type of TTS engine
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = new ClassMap[value];
    }

    // Speak as TTS: call specified TTS engine and read text (in queue if enabled)
    async speak() {
        this._speaking = true;
        do {
            /* If message author or channel is different or authorId is not system(0), send TTS w/ prefix. */
            let stream = undefined;
            if (this._lastAuthor !== this._queue[0].author.id && this._queue[0].author.id !== 0)
                stream = await this._type.speak(this._queue[0], true);
            else stream = await this._type.speak(this._queue[0], false);
            this._lastAuthor = this._queue[0].author.id;
            const result = this._voice.play(stream, { type: 'ogg/opus' });
            /* await until voice.play finishes (https://stackoverflow.com/a/43084615) */
            if (this._waitForFinish === true) await once(result, 'finish');
            this._queue.shift();
        } while(this._queue.length > 0)
        this._speaking = false;
        return;
    }
}

module.exports = TTSClass;
