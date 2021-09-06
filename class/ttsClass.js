const GcpTtsExt = require('@google-cloud/text-to-speech');
const path = require('path');
const { once } = require('events');
const config = require('../module/config.js');
const discord = require('../module/discordwrapper.js');
const localize = require('../module/localization.js');
const { bufferToStream, getUsername } = require('../module/common');

// Get server username from user's ID.
const getUsername = (client, guild, userId) => {
    const username = client.guilds.cache.get(guild.id).member(userId).displayName;
    return username.split('_').join(' ');
}

// Google Cloud Text-to-Speech Engine Class
class GcpTts {
    constructor(locale, type, gender, speed, pitch, volumeGain) {
        this._client = new GcpTtsExt.TextToSpeechClient({ projectId: config.projectId, keyFilename: path.join(__dirname, '../configs/gcp-credentials.json') });
        this._request = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: locale, name: type, ssmlGender: gender },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: speed, pitch: pitch, volumeGainDb: volumeGain }
        };
    }

    async speak(message, readAuthor=true) {
        /* If message author or channel is different or authorId is not system(0), send TTS w/ prefix. */
        if (readAuthor) {
            this._request.input = { ssml: '<speak><prosody pitch="-3st">' + localize.get('tts.speak.prefix',
                message.author.name) + '</prosody><break time="0.5s"/>' + message.content + '</speak>' };
        } else {
            this._request.input = { text: message.content };
        }
        const [response] = await this._client.synthesizeSpeech(this._request);
        /* Google sends response as buffer. We need to convert it as ReadableStream. */
        const stream = bufferToStream(response.audioContent);
        return stream;
    }
}
class GcpTtsBasic extends GcpTts {
    constructor() {
        super('ko-KR', 'ko-KR-Standard-A', 'NEUTRAL', '1.0', '0.0', '0.0');
    }
}
class GcpTtsWaveNet extends GcpTts {
    constructor() {
        super('ko-KR', 'ko-KR-Wavenet-A', 'NEUTRAL', '1.0', '0.0', '0.0');
    }
}

// Class Map for Dynamic Calling
const ClassMap = { GcpTtsBasic, GcpTtsWaveNet }

// Text-To-Speech Class
class TTSClass {
    constructor(message, type, queue, waitForFinish=true) {
        this._client = message.client;
        this._guild = message.guild;
        this._voice = discord.voiceMap.get(message.guild.id);

        this._lastAuthor = undefined;
        this._queue = queue;
        this._speaking = false;
        this._type = new ClassMap[type];
        this._waitForFinish = waitForFinish;
    }

    // (static) Generate Queue Array: Create and return queue array
    static genQueueArr(...queueArgs) {
        const authorInfo = queueArgs.filter((element, index) => index % 2 === 0);
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
