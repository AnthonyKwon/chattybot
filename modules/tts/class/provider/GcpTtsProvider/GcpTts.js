const GcpTtsExt = require('@google-cloud/text-to-speech');
const path = require('node:path');
const bufferToStream = require('./bufferToStream.js');
const config = require('../../../../config.js');
const i18n = require('../../../../i18n/main.mod.js');

// Google Cloud Text-to-Speech Engine Class
class GcpTts {
    constructor(type, speed, pitch, volumeGain) {
        this._client = new GcpTtsExt.TextToSpeechClient({ projectId: config.projectId, keyFilename: path.join(path.dirname(require.main.filename), 'configs/gcp-credentials.json') });
        this._type = type;
        this._request = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-A', ssmlGender: 'NEUTRAL' },
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

    // set locale of the TTS engine vendor
    async setLocale(locale) {
        // get voice list of Google Cloud TTS
        const voiceList = await this._client.listVoices();
        // looking for matching voice profile with current bot setting
        const currentVoice = voiceList[0].voices.find(voice =>
            voice.languageCodes[0].includes(locale) &&
            voice.name.includes(this._type) &&
            voice.ssmlGender.toLowerCase() === config.ttsGender.toLowerCase()
        );
        // set current voice to matched voice profile
        this._request.voice.languageCode = currentVoice.languageCodes[0];
        this._request.voice.name = currentVoice.name;
        this._request.voice.ssmlGender = currentVoice.ssmlGender;
        // save current discord locale
        this._messageLocale = locale;
    }

    async speak(message, readAuthor = true) {
        // If message author or channel is different or authorId is not system(0), send TTS w/ prefix.
        if (readAuthor) {
            this._request.input = {
                ssml: '<speak><prosody pitch="-3st">' + i18n.get(this._messageLocale, 'tts.speak.prefix')
                    .format(message.author.name) + '</prosody><break time="0.5s"/>' + message.content + '</speak>'
            };
        } else {
            this._request.input = { text: message.content };
        }

        const [response] = await this._client.synthesizeSpeech(this._request);
        // Google sends response as buffer. We need to convert it as ReadableStream.
        const stream = bufferToStream(response.audioContent);
        return stream;
    }
}

module.exports = GcpTts;