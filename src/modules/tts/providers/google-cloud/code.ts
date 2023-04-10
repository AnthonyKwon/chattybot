import path from 'node:path';
import json from '@modules/util/json';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { bufferToStream } from '@modules/util/bufferToStream';
import { ProviderParams } from '@modules/tts/Interfaces';
import { RequestBody } from './type';

module.exports = class TTSProviderClass {
    private keyfile: string;  // path of the API authentication key file
    private locale: string = 'en-US';  // locale of the synthesized voice
    private audioFormat: string = 'OGG_OPUS'; // format of the synthesized audio stream
    private gender: string = 'NEUTRAL';  // gender of the synthesized voice
    private useNeural: boolean = false; // whether to use wavenet or not(standard)
    private useSsml: boolean = false;  // whether to use ssml or not
    private voiceType: string = 'A';  //TODO: implement voice type
    private request: RequestBody;  // request object
    private client: TextToSpeechClient;

    constructor(params: ProviderParams) {
        // get project id from keyfile
        const projectId: string = json.read(path.join(path.dirname(require.main.filename), '..', params.keyfile))['projectId'];

        // Initialize Google TTS Engine
        this.client = new TextToSpeechClient({ projectId: projectId, keyFilename: path.join(path.dirname(require.main.filename), '../configs/gcp-credentials.json') });

        // initialize properties
        this.keyfile = params.keyfile;
        this.locale = params.locale;
        this.gender = params.gender;
        this.useSsml = params.useSsml;
        this.useNeural = params.useNeural;
    }

    private setRequestBody(input: string) {
        // create temporary requestBody variable
        this.request = {
            input: { ssml: undefined, text: undefined },
            voice: {
                languageCode: this.locale,  // set synthesized locale
                name: `${this.locale}-${this.useNeural ? 'Wavenet' : 'Standard'}-${this.voiceType}`,  // set voice name based on options
                ssmlGender: this.gender
            },
            audioConfig: {
                audioEncoding: this.audioFormat,  // set audio format 
            }
        };

        if (this.useSsml) this.request.input.ssml = input;  // set input text (as ssml if chosen)
        else this.request.input.text = input;               // set input text (as plain text if chosen)
    }

    //TODO: pitch conversion
    //TODO: speed conversion

    async synthesize(input: string): Promise<ReadableStream<any>>{
        this.setRequestBody(input);  // get request body
        const [response] = await this.client.synthesizeSpeech(Object.assign(this.request));
        // Google sends response as buffer. We need to convert it as ReadableStream
        const stream = bufferToStream(response.audioContent);  // convert buffer output(UInt8) to ReadableStream
        return stream;
    }
}