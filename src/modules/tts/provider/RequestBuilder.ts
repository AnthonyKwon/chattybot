import { IMappedLocale } from '../../i18n/IMappedLocale';
import { findLocale } from '../../i18n/MappedLocale';

/**
 * @alpha
 */
export default abstract class RequestBuilder {
    protected _gender: string;
    protected _locale: IMappedLocale;
    protected _pitch: number;
    protected _speed: number;
    protected _volume: number;

    constructor(locale?: string) {
        // abstract class: prevent the class directly called
        // https://stackoverflow.com/a/48428063
        if (this.constructor === RequestBuilder)
            throw new Error('Abstract classes can\'t be instantiated.');

        this._gender = 'neutral';
        this._locale = findLocale(locale ?? 'en-US');
        this._volume = 100;
        this._pitch = 100;
        this._speed = 100;
    }

    get locale(): IMappedLocale { return this._locale; }
    get gender() { return this._gender }
    get volume() { return this._volume }
    get pitch() { return this._pitch }
    get speed() { return this._speed }

    set locale(value: IMappedLocale) {
        this._locale = value;
    }
    set gender(value) {
        if (['male', 'female', 'neutral'].includes(value))
            this._gender = value;
        else
            throw new Error(`Gender "${value}" is not available.`);
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

    /** Build TTS request. **/
    abstract build(): any;
}