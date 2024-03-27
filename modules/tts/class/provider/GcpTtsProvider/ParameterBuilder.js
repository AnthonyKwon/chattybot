const path = require('node:path')
const GcpTtsExt = require('@google-cloud/text-to-speech');
const localeMap = require('./locale.json');
const ParameterBuilder = require('../../ParameterBuilder.js');
const config = require('../../../../config.js');

async function getVoiceName(locale, preferredType, preferredCode) {
    const client = new GcpTtsExt.TextToSpeechClient({
        keyFilename: path.join(path.dirname(require.main.filename), 'configs/gcp-credentials.json')
    });
    const [result] = await client.listVoices({});
    // exact matching voice has found
    const voiceCallback = v => v.name === `${locale}-${preferredType}-${preferredCode}`;
    let voice = result.voices.find(voiceCallback);
    if (voice) return voice;
    // fall back to Neural2 from Studio
    if (preferredType === 'Studio') preferredType = 'Neural2';
    voice = result.voices.find(voiceCallback);
    if (voice) return voice;
    // fall back to Wavenet from Neural2
    if (preferredType === 'Neural2') preferredType = 'Wavenet';
    voice = result.voices.find(voiceCallback);
    if (voice) return voice;
    // fall back to Standard from Wavenet
    if (preferredType === 'Wavenet') preferredType = 'Standard';
    voice = result.voices.find(voiceCallback);
    if (voice) return voice;
    // all methods failed - fall back to "en-US-Standard-H"
    if (!voice) return {
        languageCodes: ['en-US'],
        name: 'en-US-Standard-H',
        ssmlGender: 'FEMALE',
        naturalSampleRateHertz: 24000
    }
}

// Paramter Builder for Google Cloud Text-to-Speech Engine
class GcpTtsParamBuilder extends ParameterBuilder {
    constructor() {
        super();
        // sample parameters - this should not be passed directly
        this._params = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-H', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0, sampleRateHertz: 48000 }
        };
    }

    async build() {
        // flush input text
        this._params.input = { ssml: '' };
        // set TTS voice configuration
        const voice = await getVoiceName(localeMap[this._locale], config.GcpTtsPreferredType, config.GcpTtsPreferredCode);
        this._params.voice.languageCode = voice.languageCodes[0];
        this._params.voice.name = voice.name;
        this._params.voice.ssmlGender = voice.ssmlGender.toUpperCase();
        // set TTS audio configuration
        this._params.audioConfig.speakingRate = this._speed / 100;
        this._params.audioConfig.pitch = (this._pitch - 100) / 10;
        this._params.audioConfig.volumeGainDb = this.volume > 100 ? ((this._volume - 100) / 100) * 10 : (this._volume / 100) * 96 - 96;

        return this._params;
    }
}

module.exports = GcpTtsParamBuilder