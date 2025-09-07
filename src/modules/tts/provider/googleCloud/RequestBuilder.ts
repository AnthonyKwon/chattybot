import {google} from "@google-cloud/text-to-speech/build/protos/protos";
import SynthesizeSpeechRequest = google.cloud.texttospeech.v1.SynthesizeSpeechRequest;
import RequestBuilder from "../RequestBuilder";
import {ConvertToParam, findVoice} from "./FindVoice";
import {IFindVoiceOverrides} from "./IFindVoiceOverrides";
import config from "../../../config";

/**
 * @alpha
 */
export default class GoogleCloudTTSRequestBuilder extends RequestBuilder {
    private readonly params: SynthesizeSpeechRequest;

    constructor(locale?: string) {
        super(locale);
        // sample parameters - this should not be passed directly
        this.params = new SynthesizeSpeechRequest({
            input: { text: 'Hello world! This is a test sentence for TTS engine. If you heard this and not an geek programmer, it might be something wrong.' },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-H', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0, sampleRateHertz: 24000 }
        });
    }

    /** @inheritDoc */
    async build(): Promise<SynthesizeSpeechRequest> {
        // flush input text
        this.params.input = { text: '' };
        // set TTS voice configuration
        this.params.voice = ConvertToParam(await findVoice());
        // set TTS audio configuration
        this.params.audioConfig!.speakingRate = this._speed / 100;
        this.params.audioConfig!.pitch = (this._pitch - 100) / 10;
        const rawVolume = 10 * Math.log10(this._volume / 100);
        if (rawVolume > 6)
            this.params.audioConfig!.volumeGainDb = 6;
        else if (rawVolume < -20)
            this.params.audioConfig!.volumeGainDb = -96;
        else
            this.params.audioConfig!.volumeGainDb = rawVolume;

        return this.params;
    }
}