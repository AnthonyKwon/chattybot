import {TextToSpeechClient} from '@google-cloud/text-to-speech';
import {google} from '@google-cloud/text-to-speech/build/protos/protos';
import {Readable} from 'node:stream';
import {getClient} from "./CredentialsManager";
import TTSProvider from '../TTSProvider';
import {getString} from "../../../i18n/GetString";
import GoogleCloudTTSRequestBuilder from "./RequestBuilder";
import SynthesizeSpeechRequest = google.cloud.texttospeech.v1.SynthesizeSpeechRequest;
import {IRequestBuilderOptions} from "../IRequestBuilderOptions";

/** This uses Google Cloud Text-to-Speech AI service provider. */
export default class GoogleCloudProvider extends TTSProvider {
    private _builder: GoogleCloudTTSRequestBuilder;
    private _client: TextToSpeechClient;

    constructor(options?: IRequestBuilderOptions) {
        super();
        this._builder = new GoogleCloudTTSRequestBuilder(options);
        this._client = getClient();
    }

    /** @inheritDoc */
    static get available(): boolean { return true; }

    /** @inheritDoc */
    async speakName(name: string): Promise<Readable> {
        // build name prompt based on current locale
        const prompt: string = getString(this._builder.locale.discord, 'tts.prefix', name);

        // change pitch while synthesizing name
        let originalPitch: number = this._builder.pitch;
        this._builder.pitch -= 40;

        // create request with current name prompt
        const request: SynthesizeSpeechRequest = await this._builder.build(prompt);

        // send synthesize request
        const [response] = await this._client.synthesizeSpeech(request);

        // restore pitch to its original value
        this._builder.pitch = originalPitch;

        // throw error when response is empty
        if (!response.audioContent) throw new Error('Audio content not found on response.');

        // Google sends response as buffer. We need to convert it as ReadableStream.
        return Readable.from(response.audioContent);
    }

    /** @intheritDoc */
    async speak(text: string): Promise<Readable> {
        // create request with text to synthesize
        const request: SynthesizeSpeechRequest = await this._builder.build(text);

        // send synthesize request
        const [response] = await this._client.synthesizeSpeech(request);

        // throw error when response is empty
        if (!response.audioContent) throw new Error('Audio content not found on response.');

        // Google sends response as buffer. We need to convert it as ReadableStream.
        return Readable.from(response.audioContent);
    }
}