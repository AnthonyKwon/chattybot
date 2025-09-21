import {IMappedLocale} from '../../i18n/IMappedLocale';
import {findLocale} from '../../i18n/MappedLocale';
import {IRequestBuilderOptions} from './IRequestBuilderOptions';
import config from '../../config/ConfigLoader';
import {RequestRebuildRequired} from "./RequestRebuildRequired";

/** Builds Text-to-Speech request, to be used by provider. */
export default abstract class RequestBuilder {
    protected _gender: string | undefined;
    protected _locale: IMappedLocale | undefined;
    protected _pitch: number | undefined;
    protected _speed: number | undefined;
    protected _volume: number | undefined;

    /** Returns element type of request data needs to be rebuilt. */
    protected _dirty: Set<RequestRebuildRequired> = new Set([
        RequestRebuildRequired.Gender,
        RequestRebuildRequired.Locale,
        RequestRebuildRequired.Pitch,
        RequestRebuildRequired.Speed,
        RequestRebuildRequired.Volume
    ]);

    /**
     * @param options {@link IRequestBuilderOptions} to be used by provider.
     */
    constructor(options?: IRequestBuilderOptions) {
        // abstract class: prevent the class directly called
        // https://stackoverflow.com/a/48428063
        if (this.constructor === RequestBuilder)
            throw new Error('Abstract classes can\'t be instantiated.');

        // assign properties from user-provided options
        this._gender = options?.gender ?? config.tts.gender ?? 'neutral';
        this._locale = options?.locale ? findLocale(options.locale) : undefined;
        this._volume = options?.volume ?? config.tts.volume ?? 100;
        this._pitch = options?.pitch ?? config.tts.pitch ?? 100;
        this._speed = options?.speed ?? config.tts.speed ?? 100;
    }

    get locale(): IMappedLocale { return this._locale ?? findLocale('en-US'); }
    get gender(): string { return this._gender ?? 'neutral' }
    get volume(): number { return this._volume ?? 100 }
    get pitch(): number { return this._pitch ?? 100 }
    get speed(): number { return this._speed ?? 100 }

    /**
     * @param value Locale to set
     */
    set locale(value: IMappedLocale) {
        // mark request need to be rebuilt
        if (!this._dirty.has(RequestRebuildRequired.Locale))
            this._dirty.add(RequestRebuildRequired.Locale);

        // set locale to parameter value
        this._locale = value;
    }

    /**
     * @param value Gender to set. Must be one of "male", "female", or "neutral".
     */
    set gender(value: string) {
        // mark request need to be rebuilt
        if (!this._dirty.has(RequestRebuildRequired.Gender))
            this._dirty.add(RequestRebuildRequired.Gender);

        // set gender to parameter value
        // fallback to 'neutral' when out of range
        if (['male', 'female', 'neutral'].includes(value))
            this._gender = value;
        else
            this._gender = 'neutral';
    }

    /**
     * @param value Volume to set. Must be between 0 ~ 200.
     */
    set volume(value: number) {
        // mark request need to be rebuilt
        if (!this._dirty.has(RequestRebuildRequired.Volume))
            this._dirty.add(RequestRebuildRequired.Volume);

        // set gender to parameter value
        // fallback to possible value or '100' when out of range
        if (value >= 0 && value <= 200)
            this._volume = value
        else if (value > 200)
            this._volume = 200
        else if (value < 0)
            this._volume = 0
        else
            this._volume = 100
    }

    /**
     * @param value Pitch to set. Must be between 0 ~ 200.
     */
    set pitch(value: number) {
        // mark request need to be rebuilt
        if (!this._dirty.has(RequestRebuildRequired.Pitch))
            this._dirty.add(RequestRebuildRequired.Pitch);

        // set gender to parameter value
        // fallback to possible value or '100' when out of range
        if (value >= 0 && value <= 200)
            this._pitch = value
        else if (value > 200)
            this._volume = 200
        else if (value < 0)
            this._volume = 0
        else
            this._volume = 100
    }

    /**
     * @param value Speed to set. Must be between 50 ~ 200.
     */
    set speed(value: number) {
        // mark request need to be rebuilt
        if (!this._dirty.has(RequestRebuildRequired.Speed))
            this._dirty.add(RequestRebuildRequired.Speed);

        // set gender to parameter value
        // fallback to possible value or '100' when out of range
        if (value >= 50 && value <= 200)
            this._speed = value
        else if (value > 200)
            this._volume = 200
        else if (value < 50)
            this._volume = 0
        else
            this._volume = 100
    }

    /**
     * Build the request based on options.
     * @param text Text to request synthesize.
     **/
    abstract build(text: string): any;
}