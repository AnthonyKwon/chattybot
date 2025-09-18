import { IMappedLocale } from '../../i18n/IMappedLocale';
import { findLocale } from '../../i18n/MappedLocale';
import { IRequestBuilderOptions } from './IRequestBuilderOptions';

/**
 * @alpha
 */
export default abstract class RequestBuilder {
    protected _gender: string | undefined;
    protected _locale: IMappedLocale | undefined;
    protected _pitch: number | undefined;
    protected _speed: number | undefined;
    protected _volume: number | undefined;

    constructor(options?: IRequestBuilderOptions) {
        // abstract class: prevent the class directly called
        // https://stackoverflow.com/a/48428063
        if (this.constructor === RequestBuilder)
            throw new Error('Abstract classes can\'t be instantiated.');

        // assign properties from user-provided options
        if (options) {
            this._gender = options.gender;
            this._locale = options.locale ? findLocale(options.locale) : undefined;
            this._volume = options.volume;
            this._pitch = options.pitch;
            this._speed = options.speed;
        }
    }

    get locale(): IMappedLocale { return this._locale ?? findLocale('en-US'); }
    get gender(): string { return this._gender ?? 'neutral' }
    get volume(): number { return this._volume ?? 100 }
    get pitch(): number { return this._pitch ?? 100 }
    get speed(): number { return this._speed ?? 100 }

    set locale(value: IMappedLocale) {
        this._locale = value;
    }
    set gender(value: string) {
        if (['male', 'female', 'neutral'].includes(value))
            this._gender = value;
        else
            throw new Error(`Gender "${value}" is not available.`);
    }
    set volume(value: number) {
        if (value >= 0 && value <= 200)
            this._volume = value
        else
            throw new Error(`Volume Gain "${value}" is out of range.`)
    }
    set pitch(value: number) {
        if (value >= 0 && value <= 200)
            this._pitch = value
        else
            throw new Error(`Pitch "${value}" is out of range.`)
    }
    set speed(value: number) {
        if (value >= 50 && value <= 200)
            this._speed = value
        else
            throw new Error(`Speed "${value}" is out of range.`)
    }

    /** Build TTS request. **/
    abstract build(): any;
}