import path from 'node:path';
import fs from 'node:fs';
import json from '@modules/util/json';
import * as config from '@modules/config';
import { TTSMessage, ProviderDefInterface, ProviderParams } from './Interfaces';

export default class TTSClass {
    private busy: boolean;  // mark if provider is working on something
    private queue: Array<TTSMessage> = [];  // message queue
    private providerObj;  // TTS provider class object

    // property 'locale': origin(application) locale <=> TTS locale
    private _locale: string;
    get locale(): string {
        const localeList = json.read(path.join(__dirname, 'providers', this._provider, 'locales.json'));  // read locales.json file
        let originLocale = Object.keys(localeList).find(k => localeList[k] === this._locale);  // get origin(app) locale from tts provider locale
        if (!originLocale) originLocale = config['defaultLocale'];  // if not available, get default locale from configuration file
        return originLocale;  // return app locale
    }
    get providerLocale(): string {
        return this._locale;  // return provider locale
    }
    set locale(appLocale: string) {
        // get TTS prvider locale from locales.json
        const localeList = json.read(path.join(__dirname, 'providers', this._provider, 'locales.json'));  // read locales.json file
        this._locale = localeList[appLocale] ? localeList[appLocale] : localeList['default'];  // set tts locale to corresponding app locale. set to default value if not available
    }

    // property 'provider': TTS service provider
    private _provider: string;
    get provider(): string {
        return this._provider;  // return current service provider
    }
    set provider(provider: string) {
        this._provider = provider;  // save new service provider
        this.providerInit();
    }

    constructor(provider: string, locale: string) {
        this._provider = provider;  // define service provider
        this.busy = false;
        this.locale = locale;  // set locale of tts
        this.provider = provider;  // initialize service provider
    }

    // initialize provider object and set settings
    private providerInit() {
        // read definition file(def.json) for option checking
        const fileRawData: Buffer = fs.readFileSync(path.join(__dirname, 'providers', this._provider, 'def.json'));  // read provider definition file from location
        const providerInfo: ProviderDefInterface = JSON.parse(fileRawData.toString());  // convert buffer to object

        // generate TTS provider params based on defintion information
        let params: ProviderParams = { 
            locale: this._locale,  // set provider locale
            gender: 'NEUTRAL'  //TODO: implement gender properties
        };
        if (providerInfo.keyfile) params.keyfile = providerInfo.keyfile;  // set provider authentication key file path
        if (providerInfo.ssml === true) params.useSsml = true;  // always use ssml (if available)
        if (providerInfo.neural === true) params.useNeural = true;  //TODO: make user able to select neural engine

        // get TTS provider class from code.ts
        const ProviderClass = require(path.join(__dirname, 'providers', this.provider, 'code'));  // import code.ts file
        this.providerObj = new ProviderClass(params);  // create new object from class
    }

    addMsg(message: TTSMessage): void {
        /**
         * add message to synthesize queue, and synthesize if not working
         * 
         * @param message - author and content of the message
         */
        this.queue.push(message);  // add message to queue
    }

    synthesize(voice: any): void {
        /**
         * synthesize voice from chat
         * 
         * @param voice - VoiceClass object
         */
        if (this.busy === true) return;  // ignore if tts provider is busy
        this.busy = true;  // mark as busy

        (async(): Promise<void> => {
            while (this.queue.length > 0) {
                //TODO: implement tone-based user identifying
                //name-based user identifying(ex: ~님의 말) is moved to command level
                const currentMessage: TTSMessage = this.queue.shift();
                const stream: ReadableStream = await this.providerObj.synthesize(currentMessage.message);  // synthesize text to audio
                const audioPlayer = await voice.play(stream, { type: 'ogg/opus' });  // play audio to voice channel
                //TODO: check if result got return value false (failed to play audio)
                await new Promise(resolve => audioPlayer.on('idle', resolve));  // wait until voice.play finishes (https://stackoverflow.com/a/43084615)
            }
            this.busy = false;  // mark as free
        })();
    }
}