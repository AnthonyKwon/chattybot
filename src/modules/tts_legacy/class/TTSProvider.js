class TTSProvider {
    constructor() {
        // abstract class: prevent the class directly called
        // https://stackoverflow.com/a/48428063
        if (this.constructor === TTSProvider)
            throw new Error('Abstract classes can\'t be instantiated.');
        if (this.speak === undefined)
            throw new Error('Method \'speak()\' must be implemented.');
    }

    // (static) TTS availability check, should always return true
    static get ttsAvailable() { return true }
    // (static) parameter builder for TTS engine
    static get ParameterBuilder() { throw new Error('Method \'ParameterBuilder()\' must be implemented.') }
}

module.exports = TTSProvider;