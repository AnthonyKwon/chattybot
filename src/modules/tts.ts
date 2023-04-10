import fs from 'node:fs';
import path from 'node:path';
import TTSClass from './tts/TTSClass';
import * as config from '@modules/config';
export default { create };

// create new TTS object from class
function create(locale: string): TTSClass;  // overload: use default provider in configuration file
function create(provider: string, locale: string): TTSClass  // overload: set provider from parameter
function create(locale: string, provider?: string): TTSClass {
    const actualProvider = provider ? provider : config['defaultSpeechProvider'];  // get provider from parameter and configuration. parameter first
    const selectedProvider: Array<string> = fs.readdirSync(path.join(__dirname, './tts/providers/'));  // get TTS provider dirname from id
    if (!selectedProvider) throw new Error('Not a valid TTS provider!');  // test if chosen tts provider is valid

    //TODO: implement safety tests (write required test here)

    return new TTSClass(actualProvider, locale);
}