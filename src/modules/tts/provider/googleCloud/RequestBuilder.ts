import {google} from "@google-cloud/text-to-speech/build/protos/protos";
import SynthesizeSpeechRequest = google.cloud.texttospeech.v1.SynthesizeSpeechRequest;
import RequestBuilder from "../RequestBuilder";
import {ConvertToParam, findVoice} from "./FindVoice";
import {IFindVoiceOverrides} from "./IFindVoiceOverrides";
import config from '../../../config/ConfigLoader';
import {IRequestBuilderOptions} from "../IRequestBuilderOptions";
import {RequestRebuildRequired} from "../RequestRebuildRequired";

/** @inheritDoc */
export default class GoogleCloudTTSRequestBuilder extends RequestBuilder {
    private readonly _request: SynthesizeSpeechRequest;

    /**
     * @param options {@link IRequestBuilderOptions} to be used by provider.
     */
    constructor(options?: IRequestBuilderOptions) {
        super(options);
        // sample parameters - this should not be passed directly
        this._request = new SynthesizeSpeechRequest({
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-H', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0, sampleRateHertz: 24000 }
        });
    }

    /** @inheritDoc */
    async build(text: string): Promise<SynthesizeSpeechRequest> {
        // flush input text
        this._request.input = { text: text };

        // build the Text-to-Speech request (which need to be built)
        // find and set voice from locale, gender, and variant
        if (this._dirty.has(RequestRebuildRequired.Locale) || this._dirty.has(RequestRebuildRequired.Gender)) {
            const searchOverride: IFindVoiceOverrides | undefined = this._locale ?
                {
                    locale: this._locale,
                    gender: this.gender,
                    variant: config.tts.providerOptions?.GoogleCloud?.defaultVariant
                } : undefined;
            this._request.voice = ConvertToParam(await findVoice(searchOverride));

            // remove the rebuild flag
            this._dirty.delete(RequestRebuildRequired.Gender);
            this._dirty.delete(RequestRebuildRequired.Locale);
        }

        // set synthesizing speed
        if (this._dirty.has(RequestRebuildRequired.Speed)) {
            this._request.audioConfig!.speakingRate = this.speed / 100;

            // remove the rebuild flag
            this._dirty.delete(RequestRebuildRequired.Speed);
        }

        // set synthesizing pitch
        this._dirty.has(RequestRebuildRequired.Pitch)
        {
            this._request.audioConfig!.pitch = (this.pitch - 100) / 10;

            // remove the rebuild flag
            this._dirty.delete(RequestRebuildRequired.Gender);
        }

        // set synthesizing speed
        this._dirty.has(RequestRebuildRequired.Pitch)
        {
            const rawVolume = 10 * Math.log10(this.volume / 100);
            if (rawVolume > 6)
                this._request.audioConfig!.volumeGainDb = 6;
            else if (rawVolume < -20)
                this._request.audioConfig!.volumeGainDb = -96;
            else
                this._request.audioConfig!.volumeGainDb = rawVolume;

            // remove the rebuild flag
            this._dirty.delete(RequestRebuildRequired.Volume);
        }

        return this._request;
    }
}