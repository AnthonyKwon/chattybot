const { getClient } = require('./AuthHandler.js');
const localeMap = require('./locale.json');
const ParameterBuilder = require('../../ParameterBuilder.js');
const config = require('../../../../config.js');
let voiceListCache;

async function getVoiceName(locale, preferredType, preferredCode) {
    // load voice list from cache, or API request (if cache not available)
    if (!voiceListCache) {

        const client = await getClient();
        [voiceListCache] = voiceListCache ?? await client.listVoices({});
    }
    // exact matching voice has found
    const voiceCallback = v => v.name === `${locale}-${preferredType}-${preferredCode}`;
    let voice = voiceListCache.voices.find(voiceCallback);
    if (voice) return voice;
    // fall back to Neural2 from Studio
    if (preferredType === 'Studio') preferredType = 'Neural2';
    voice = voiceListCache.voices.find(voiceCallback);
    if (voice) return voice;
    // fall back to Wavenet from Neural2
    if (preferredType === 'Neural2') preferredType = 'Wavenet';
    voice = voiceListCache.voices.find(voiceCallback);
    if (voice) return voice;
    // fall back to Standard from Wavenet
    if (preferredType === 'Wavenet') preferredType = 'Standard';
    voice = voiceListCache.voices.find(voiceCallback);
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
        const rawVolume = 10 * Math.log10(this._volume / 100);
        if (rawVolume > 6)
            this._params.audioConfig.volumeGainDb = 6;
        else if (rawVolume < -20)
            this._params.audioConfig.volumeGainDb = -96;
        else
            this._params.audioConfig.volumeGainDb = rawVolume;

        return this._params;
    }
}

module.exports = GcpTtsParamBuilder