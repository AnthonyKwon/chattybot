const GcpTts = require('@google-cloud/text-to-speech');
const path = require('path');
const configManager = require('./configManager.js');
const discord = require('./discord.js');
const string = require('./stringManager.js');
const { bufferToStream, getUsername, logger } = require('./common');

/* read config from file */
const config = configManager.read('project_id');

class TTSClass {
    constructor() {
        this._client = new GcpTts.TextToSpeechClient({ projectId: config.projectId, keyFilename: path.join(__dirname, '../configs/gcp-credentials.json') });
        this._lastAuthor = undefined;
        this._request = {
            input: { text: 'This is a sample text.' },
            voice: { languageCode: string.locale, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: '1.0', pitch: '1.0', volumeGainDb: '0.0' }
        };
    }

    /* get-set setting entry */
    get gender() {
        return this._request.voice.ssmlGender;
    }
    set gender(code) {
        switch (code) {
            case string.stringFromId('google.tts.gender.female'):
                this._request.voice.ssmlGender = "FEMALE";
                break;
            case string.stringFromId('google.tts.gender.male'):
                this._request.voice.ssmlGender = "MALE";
                break;
            case string.stringFromId('google.tts.gender.neutral'):
                this._request.voice.ssmlGender = "NEUTRAL";
                break;
        }
    }

    get locale() {
        return this._request.voice.languageCode;
    }
    set locale(code) {
        this._request.voice.languageCode = code;
    }

    get pitch() {
        return this._request.audioConfig.pitch;
    }
    set pitch(rate) {
        this._request.audioConfig.pitch = rate;
    }

    get speed() {
        return this._request.audioConfig.speakingRate;
    }
    set speed(rate) {
        this._request.audioConfig.speakingRate = rate;
    }

    get volume() {
        return this._request.audioConfig.volumeGainDb;
    }
    set volume(rate) {
        this._request.audioConfig.volumeGainDb = rate;
    }

    async speak(message, text, ssml=false) {
        const voice = discord.voiceMap.get(message.guild.id);
        /* If message author or channel is different, send TTS w/ prefix. */
        if (this._lastAuthor !== message.author) {
            this._request.input = { ssml: '<speak>' + string.stringFromId('catty.tts.prefix', getUsername(message)) + 
            '<break time="0.5s"/>' + text + '</speak>' };
        /* If not, send just text only */
        } else this._request.input = { text };
        this._lastAuthor = message.author;
        const [response] = await this._client.synthesizeSpeech(this._request);
        /* Google sends response as buffer. We need to convert it as ReadableStream. */
        const stream = bufferToStream(response.audioContent);
        return voice.play(stream, { type: 'ogg/opus' });
    }
}

module.exports = TTSClass;
