import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import IVoice = google.cloud.texttospeech.v1.IVoice;
import IListVoicesResponse = google.cloud.texttospeech.v1.IListVoicesResponse;
import IVoiceSelectionParams = google.cloud.texttospeech.v1.IVoiceSelectionParams;
import config from '../../../config';
import { IFindVoiceOverrides } from './IFindVoiceOverrides';
import { getClient } from './CredentialsManager';
import { findLocale } from '../../../i18n/MappedLocale';
import { IMappedLocale } from '../../../i18n/IMappedLocale';
import { InvalidLocaleError } from '../../error/InvalidLocaleError';
let voiceListCache: IListVoicesResponse | undefined;

/**
 * Find matching voice by its exact name.
 * @param voiceName `name` of the target voice.
 * @returns The {@link IVoice} of provided `voiceName`.
 */
async function findVoiceExact(voiceName: string): Promise<IVoice | undefined> {
    // load voice list from API when cache miss
    if (!voiceListCache) {
        const client = getClient();
        [voiceListCache] = voiceListCache ?? await client.listVoices({});
    }

    // load voice list again if cache is invalid
    if (!voiceListCache.voices) {
        const client = getClient();
        [voiceListCache] = await client.listVoices({});
        
        // throw error if it's still invalid
        if (!voiceListCache.voices) throw new Error();
    }

    // return lookup result
    return voiceListCache.voices
        .find((voice: IVoice) => voice.name === voiceName);
}

/**
 * Find voice by its properties.
 * @param locale `locale` of the target voice.
 * @param type `type` of the target voice.
 * @param gender `ssmlGender` of the target voice.
 * @param variant preferred `variant` of the target voice.
 * @returns The {@link IVoice} of provided properties.
 */
async function findVoiceByProp(locale: IMappedLocale, type: string, gender: string): Promise<IVoice | undefined> {
    // load voice list from API when cache miss
    if (!voiceListCache) {
        const client = getClient();
        [voiceListCache] = voiceListCache ?? await client.listVoices({});
    }

    // load voice list again if cache is invalid
    if (!voiceListCache.voices) {
        const client = getClient();
        [voiceListCache] = await client.listVoices({});
        
        // throw error if it's still invalid
        if (!voiceListCache.voices) throw new Error();
    }

    // return lookup result
    return voiceListCache.voices
        .find((voice: IVoice) => {
            // return false when voice or type not match
            if (!voice.name || !voice.name.startsWith(`${locale.google}-${type}`))
                return false;

            // return false when gender not match (except for NEUTRAL)
            if (gender !== 'NEUTRAL') {
                if (!voice.ssmlGender || voice.ssmlGender.toString() !== gender)
                    return false;
            }

            return true;
        });
}

/**
 * Find voice from properties.
 * @returns The {@link IListVoicesResponse} by conditions below.  
 * - `variant` set: Search by voice name.  
 * - `variant` not set: Search by voice properties.  
 * When search fails, function will try to search for every other `type` user have set.  
 * When all `type` search fails, fallback {@link IListVoicesResponse}(en-US-Standard-A) will return.
 */
export async function findVoice(overrides?: IFindVoiceOverrides): Promise<IVoice> {
    // get provider information from config
    const locale: IMappedLocale | undefined = overrides?.locale ?? findLocale();
    const types: string[] = config.tts.providerOptions.GoogleCloud.preferredTypes;

    // check if locale is valid
    if (!locale)
        throw new InvalidLocaleError('Locale is not valid!');

    // when user specified the variant of the voice
    if ((!overrides && config.tts.providerOptions.GoogleCloud.defaultVariant) ||
        (overrides && overrides.variant)) {
        // get provider variant from config
        const variant: string = overrides?.variant ?? config.tts.providerOptions.GoogleCloud.defaultVariant;

        // check for every voice type
        for (const type of types) {
            // find voice from its name
            const voice: IVoice | undefined = await findVoiceExact(`${locale.google}-${type}-${variant}`);

            // return when matching one found
            if (voice)
                return voice;
        }
    }

    // when user don't specify or match failed
    const gender: string = overrides?.gender.toUpperCase() ?? config.tts.gender.toUpperCase();
    
    // check for every voice type
    for (const type of types) {
        // find voice from its properties
        const voice: IVoice | undefined = await findVoiceByProp(locale, type, gender);

        // return when matching one found
        if (voice)
            return voice;
    }

    // return generic IVoice object on all test fail
    return {
        languageCodes: ["en-US"],
        name: "en-US-Standard-A",
        ssmlGender: "MALE",
        naturalSampleRateHertz: 24000
    };
}

export function ConvertToParam(voice: IVoice): IVoiceSelectionParams {
    let languageCode: string | undefined;

    //
    if (!voice) return {};

    //
    if (voice.languageCodes && voice.languageCodes.length >= 0)
        languageCode = voice.languageCodes[0];

    return {
        languageCode: languageCode,
        name: voice.name,
        ssmlGender: voice.ssmlGender
    };
}
