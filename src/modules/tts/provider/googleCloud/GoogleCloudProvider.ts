import {TextToSpeechClient} from '@google-cloud/text-to-speech';
import {google} from '@google-cloud/text-to-speech/build/protos/protos';
import {Readable} from 'node:stream';
import {getClient} from "./CredentialsManager";
import TTSProvider from '../TTSProvider';
import bufferToStream from '../../../tts_legacy/class/provider/GcpTtsProvider/bufferToStream';
import i18n from "../../../i18n/main.mod";
import SynthesizeSpeechRequest = google.cloud.texttospeech.v1.SynthesizeSpeechRequest;
import GoogleCloudTTSRequestBuilder from "./RequestBuilder";
import {findLocaleByProvider} from "../MappedLocale";
import {IMappedLocale} from "../IMappedLocale";

/**
 * This uses Google Cloud Text-to-Speech AI service provider.
 * @alpha
 */
export default class GoogleCloudProvider extends TTSProvider {
    private client: TextToSpeechClient;
    private readonly request: SynthesizeSpeechRequest;

    constructor() {
        super();
        this.client = getClient();
        this.request = new SynthesizeSpeechRequest();
    }

    /** @inheritDoc */
    static get available(): boolean { return true; }

    /** @inheritDoc */
    get RequestBuilder(): typeof GoogleCloudTTSRequestBuilder {
        return GoogleCloudTTSRequestBuilder;
    }

    /** @inheritDoc */
    async speakName(name: string): Promise<Readable> {
        // build name prompt based on current locale
        const locale: IMappedLocale = findLocaleByProvider('google');
        const prompt: string = i18n.get(locale.discord, 'tts.speak.prefix');

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

        // Google sends response as buffer. We need to convert it as ReadableStream.
        return bufferToStream(response.audioContent);
    }

    /** @intheritDoc */
    async speak(text: string): Promise<Readable> {
        this.request.input = { text };

        const [response] = await this.client.synthesizeSpeech(this.request);
        // Google sends response as buffer. We need to convert it as ReadableStream.
        return bufferToStream(response.audioContent);
    }
}