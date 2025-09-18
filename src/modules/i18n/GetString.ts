import { readdirSync, readFileSync,  } from 'fs';
import { resolve } from "path";
import {ILocalizedString} from "./ILocalizedString";
import path from "node:path";
import logger from "../log/Logger";
let localeCache: Map<string, ILocalizedString> | undefined;

// I think I need some time to understand it. TypeScript is too hard :(
//ref: https://stackoverflow.com/a/47058976

function loadToCache(): void {
    // initialize the locale cache
    localeCache = new Map<string, ILocalizedString>();

    // get list of files to load
    const filePath = resolve(globalThis.appRoot, 'assets', 'i18n', 'lt');
    const files = readdirSync(filePath).filter(file => file.endsWith('.json'));

    // load all locale data to cache
    for (const file of files) {
        const fullPath = path.join(filePath, file);
        const data: ILocalizedString = JSON.parse(readFileSync(fullPath, 'utf8'));
        localeCache.set(data.li.id, data)
    }
}

/**
 * Get localization for specified string.
 * @param locale locale to get localized string.
 * @param id id of the localized string.
 * @param param additional strings to format localized string.
 * @returns Localized string when found. `id` will return when not found or on Error.
 */
export function getString(locale: string, id: string, ...param: string[]): string {
    let returnString: string;

    // load cache when it's not loaded
    if (!localeCache) loadToCache();

    // get current locale from cache
    const data: ILocalizedString | undefined = localeCache!.get(locale);
    if (!data) return id;  // fallback to id on error

    try {
        // find the target string
        const localizedString: string | string[] = id.split('.').reduce((k: any, v) => k[v as keyof typeof id], data);

        // merge the multi-line result, or return id when result not found
        if (typeof localizedString === 'object') returnString = localizedString.join('\n');
        else if (typeof localizedString === 'undefined') returnString = id;
        else returnString = localizedString;

        // format the string when additional format strings are set
        //ref: https://stackoverflow.com/a/4673436
        if (param) {
            returnString = String(returnString).replace(/{(\d+)}/g, function(match, index) {
                return typeof param[index] === 'string'
                    ? param[index]
                    : match
            });
        }
    } catch(err: any) {
        // fallback to id on error
        logger.error({ topic: 'i18n', message: `Error occurred while parsing locale!` });
        logger.error({ topic: 'i18n', message: err.stack ? err.stack : err });
        returnString = id;
    }

    // return fully processed string
    return returnString;
}

/**
 * Get localization for specified string, for every locale.
 * @param id id of the localized string.
 * @param param additional strings to format localized string.
 * @returns Map of localized strings when found. Map will just contain `id` when not found or on Error.
 */
export function getAllString(id: string, ...param: string[]) {
    const localized: Map<string, string> = new Map();

    // load cache when it's not loaded
    if (!localeCache) loadToCache();

    // iterate for every locale available
    localeCache?.forEach(locale => localized.set(locale.li.id, getString(locale.li.id, id, ...param)));

    // return group of localized strings
    return Object.fromEntries(localized);
}