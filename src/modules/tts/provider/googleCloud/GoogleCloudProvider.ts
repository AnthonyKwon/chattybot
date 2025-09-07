import {TextToSpeechClient} from '@google-cloud/text-to-speech';
import {google} from '@google-cloud/text-to-speech/build/protos/protos';
import {Readable} from 'node:stream';
import {getClient} from "./CredentialsManager";
import TTSProvider from '../TTSProvider';
import {getString} from "../../../i18n/GetString";
import GoogleCloudTTSRequestBuilder from "./RequestBuilder";
import {findLocaleByProvider} from "../../../i18n/MappedLocale";
import {IMappedLocale} from "../../../i18n/IMappedLocale";
import SynthesizeSpeechRequest = google.cloud.texttospeech.v1.SynthesizeSpeechRequest;

/**
 * This uses Google Cloud Text-to-Speech AI service provider.
 * @alpha
 */
export default class GoogleCloudProvider extends TTSProvider {
    private client: TextToSpeechClient;
    private readonly request: SynthesizeSpeechRequest;

    protected constructor(request: SynthesizeSpeechRequest) {
        super();
        this.client = getClient();
        this.request = request;
    }

    /** @inheritDoc */
    static get available(): boolean { return true; }

    /** @inheritDoc */
    static async create(locale?: string): Promise<GoogleCloudProvider> {
        const builder = new GoogleCloudTTSRequestBuilder(locale);
        const request = await builder.build();

        return new GoogleCloudProvider(request);
    }

    /** @inheritDoc */
    async speakName(name: string): Promise<Readable> {
        // build name prompt based on current locale
        const locale: IMappedLocale = findLocaleByProvider('google', this.request.voice?.languageCode ?? 'en-US');
        const prompt: string = getString(locale.discord, 'tts.prefix', name);

        // set request text to name prompt
        this.request.input = { text: prompt };
        // decrease or increase pitch
        if (this.request.audioConfig?.pitch && this.request.audioConfig.pitch >= -16.0)
            this.request.audioConfig.pitch -= 4.0;
        else if (this.request.audioConfig?.pitch && this.request.audioConfig.pitch < -16.0)
            this.request.audioConfig.pitch = this.request.audioConfig.pitch + 36.0;

        // send synthesize request
        const [response] = await this.client.synthesizeSpeech(this.request);

        // restore pitch to its original value
        if (this.request.audioConfig?.pitch  && this.request.audioConfig.pitch <= 16.0)
            this.request.audioConfig.pitch += 4.0;
        else if (this.request.audioConfig?.pitch && this.request.audioConfig.pitch > 16.0)
            this.request.audioConfig.pitch = this.request.audioConfig.pitch - 36.0;

        // throw error when response is empty
        if (!response.audioContent) throw new Error('Audio content not found on response.');

        // Google sends response as buffer. We need to convert it as ReadableStream.
        return Readable.from(response.audioContent);
    }

    /** @intheritDoc */
    async speak(text: string): Promise<Readable> {
        this.request.input = { text };

        // send synthesize request
        const [response] = await this.client.synthesizeSpeech(this.request);

        // throw error when response is empty
        if (!response.audioContent) throw new Error('Audio content not found on response.');

        // Google sends response as buffer. We need to convert it as ReadableStream.
        return Readable.from(response.audioContent);
    }
}