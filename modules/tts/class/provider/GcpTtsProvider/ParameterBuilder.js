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
    let voice = result.voices.find(v => {
        const findVoice = () => {
            if (v === `${locale}-${preferredType}-${preferredCode}`)
                return true;
        }

        // exact matching voice has found
        findVoice();
        // fall back to Studio
        if (preferredType === 'Studio') preferredType = 'Neural2';
        findVoice();
        // fall back to Neural2
        if (preferredType === 'Neural2') preferredType = 'Wavenet';
        findVoice();
        // fall back to Wavenet
        if (preferredType === 'Wavenet') preferredType = 'Standard';
        findVoice();
        // all methods failed
        return false;
    });

    // all methods failed - fall back to "en-US-Standard-A"
    if (!voice) return {
        languageCodes: ['en-US'],
        name: 'en-US-Standard-A',
        ssmlGender: 'FEMALE',
        naturalSampleRateHertz: 24000
    }
    else return voice;
}

// Paramter Builder for Google Cloud Text-to-Speech Engine
class GcpTtsParamBuilder extends ParameterBuilder {
    constructor() {
        // sample parameters - this should not be passed directly
        this._params = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-A', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0, sampleRateHertz: 48000 }
        };

        this._x_preferred_type = 'Wavenet';
        this._x_preferred_code = 'A';

        super();
    }

    get x_preferred_type() { return this._x_preferred_type }
    get x_preferred_code() { return this._x_preferred_code }

    set x_preferred_type(value) { this._x_preferred_type = value }
    set x_preferred_code(value) { this._x_preferred_code = value }

    async build() {
        // flush input text
        this._params.input = { ssml: '' };
        // set TTS voice configuration
        const voice = await getVoiceName(localeMap[this._locale], this._x_preferred_type, this._x_preferred_code);
        this._params.voice.languageCode = voice.languageCodes[0];
        this._params.voice.name = voice.name;
        this._params.voice.ssmlGender = voice.ssmlGender;
        // set TTS audio configuration
        this._params.audioConfig.speakingRate = this._speed / 100;
        this._params.audioConfig.pitch = (this._pitch - 100) / 10;
        this._params.audioConfig.volumeGainDb = this.gain > 100 ? ((this.gain - 100) / 100) * 10 : (this.gain / 100) * 96 - 96;

        return this._params;
    }
}

module.exports = GcpTtsParamBuilder