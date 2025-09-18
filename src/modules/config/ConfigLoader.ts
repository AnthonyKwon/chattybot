import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { IGeneralConfig } from "./def/IGeneralConfig";
import { ITTSConfig } from "./def/ITTSConfig";

function initialize() {
    // path to config files
    const filePath = resolve(global.appRoot, 'configs');

    // open 'general.json' config file
    const generalConfig: IGeneralConfig = JSON.parse(readFileSync(join(filePath, 'general.json'), 'utf8'));

    // open 'tts.json' config file
    const ttsConfig: ITTSConfig = JSON.parse(readFileSync(join(filePath, 'tts.json'), 'utf8'));

    // return the merged object
    return { ...generalConfig, tts: { ...ttsConfig } };
}

export default initialize();