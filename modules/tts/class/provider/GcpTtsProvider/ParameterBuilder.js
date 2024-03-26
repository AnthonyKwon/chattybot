// Paramter Builder for Google Cloud Text-to-Speech Engine
class ParameterBuilder {
    constructor() {
        // sample parameters - this should not be passed directly
        this.params = {
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-A', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: 1.0, pitch: 0, volumeGainDb: 0, sampleRateHertz: 48000 }
        };
        this.gender = 'female';
        this.locale = 'en-US';
        this.pitch = 1;
        this.speed = 1;
        this.volumeGain = 0;
    }

    build() {
        //
    }
}

module.exports = ParameterBuilder