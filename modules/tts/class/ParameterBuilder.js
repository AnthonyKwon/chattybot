const { Locale } = require('discord.js');

// Parameter Builder for TTS Engine Manager
class ParameterBuilder {
    constructor() {
        // abstract class: prevent the class directly called
        // https://stackoverflow.com/a/48428063
        if (this.constructor === ParameterBuilder)
            throw new Error('Abstract classes can\'t be instantiated.');
        if (this.build === undefined || typeof (this.build) !== 'function')
            throw new Error('Method \'build()\' must be implemented.');

        this._gender = 'neutral';
        this._locale = Locale.EnglishUS;
        this._volume = 93;
        this._pitch = 100;
        this._speed = 100;
    }

    get gender() { return this._gender }
    get locale() { return this._locale }
    get volume() { return this._volume }
    get pitch() { return this._pitch }
    get speed() { return this._speed }

    set gender(value) {
        if (['male', 'female', 'neutral'].includes(value))
            this._gender = value;
        else
            throw new Error(`Gender "${gender}" is not available.`);
    }
    set locale(value) {
        if (Object.values(Locale).includes(value))
            this._locale = value;
        else
            throw new Error(`Locale "${value}" is not available.`);
    }
    set volume(value) {
        if (value >= 0 && value <= 200)
            this._volume = value
        else
            throw new Error(`Volume Gain "${value}" is out of range.`)
    }
    set pitch(value) {
        if (value >= 0 && value <= 200)
            this._pitch = value
        else
            throw new Error(`Pitch "${value}" is out of range.`)
    }
    set speed(value) {
        if (value >= 50 && value <= 200)
            this._speed = value
        else
            throw new Error(`Speed "${value}" is out of range.`)
    }
}

module.exports = ParameterBuilder;