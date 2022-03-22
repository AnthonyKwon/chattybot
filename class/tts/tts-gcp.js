const GcpTtsExt = require('@google-cloud/text-to-speech');
const path = require('path');
const { Readable } = require('stream');
const config = require('../../module/config.js');
const localize = require('../../module/localization.js');

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
    constructor(locale, type, gender, speed, pitch, volumeGain) {
        this._client = new GcpTtsExt.TextToSpeechClient({ projectId: config.projectId, keyFilename: path.join(__dirname, '../../configs/gcp-credentials.json') });
        this._request = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: locale, name: type, ssmlGender: gender },
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

module.exports = { GcpTtsBasic, GcpTtsWaveNet }
