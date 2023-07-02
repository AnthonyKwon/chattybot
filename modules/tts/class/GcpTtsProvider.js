const GcpTtsExt = require('@google-cloud/text-to-speech');
const path = require('node:path');
const { Readable } = require('node:stream');
const config = require('../../config.js');
const i18n = require('../../i18n/main.mod.js');

/*
 * @param binary Buffer
 * returns readableInstanceStream Readable
 * https://stackoverflow.com/a/54136803
 */
const bufferToStream = (binary) => {
    const readableInstanceStream = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}

// Google Cloud Text-to-Speech Engine Class
class GcpTts {
    constructor(locale, type, speed, pitch, volumeGain) {
        this._client = new GcpTtsExt.TextToSpeechClient({ projectId: config.projectId, keyFilename: path.join(path.dirname(require.main.filename), 'configs/gcp-credentials.json') });
        this._locale = locale;
        this._type = type;
        this._request = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'ko-KR', name: 'ko-KR-Standard-A', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: speed, pitch: pitch, volumeGainDb: volumeGain }
        };
    }

    /*
     * (static) TTS availability check variable
     * TTS subclass should return this as true
     */
    static get ttsAvailable() {
        return true;
    }

    // TTS initalization function
    // this function must be defined
    async init() {
        // get voice list of Google Cloud TTS
        const voiceList = await this._client.listVoices();
        // looking for matching voice profile with current bot setting
        const currentVoice = voiceList[0].voices.find(voice =>
            voice.languageCodes[0].includes(this._locale) &&
            voice.name.includes(this._type) &&
            voice.ssmlGender.toLowerCase() === config.ttsGender.toLowerCase()
            );
        // set current voice to matched voice profile
        this._request.voice.languageCode = currentVoice.languageCodes[0];
        this._request.voice.name = currentVoice.name;
        this._request.voice.ssmlGender = currentVoice.ssmlGender;
    }

    async speak(message, readAuthor=true) {
        // If message author or channel is different or authorId is not system(0), send TTS w/ prefix.
        if (readAuthor) {
            this._request.input = { ssml: '<speak><prosody pitch="-3st">' + i18n.get(config.locale, 'tts.speak.prefix')
                .format(await message.author.getUsername()) + '</prosody><break time="0.5s"/>' + message.content + '</speak>' };
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
    constructor(locale) {
        super(locale, 'Standard', '1.0', '0.0', '0.0');
    }
}
class GcpTtsWaveNet extends GcpTts {
    constructor(locale) {
        super(locale, 'Wavenet', '1.0', '0.0', '0.0');
    }
}

module.exports = { GcpTtsBasic, GcpTtsWaveNet }
