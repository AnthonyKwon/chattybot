import { readFileSync } from 'fs';
import { resolve } from 'path';
import config from '../../config';
import { IMappedLocale } from './IMappedLocale';

let localeCache: IMappedLocale[] | undefined;    // locale map cache

/**
 * Gets Discord => Text-to-Speech provider locale mapping.
 * @param target Locale to get mapping. Gets value from config when not set.
 * @returns The {@link IMappedLocale} of specified locale. Returns US English when search failed.
 */
export function findLocale(target: string = config.locale): IMappedLocale {
    // load cache when not loaded
    if (!localeCache) {
        const data = readFileSync(resolve(globalThis.appRoot, 'assets/loconv-map.json'));
        localeCache = JSON.parse(data.toString());
    }

    // return matched locale from cache, or US English when failed
    return localeCache!.find(locale => target === locale.discord) ??
    { discord: 'en-US', google: 'en-US' };
}

/**
 * Gets Other provider => Text-to-Speech provider locale mapping.
 * @param provider Provider to get mapping.
 * @param target Locale to get mapping.
 * @returns The {@link IMappedLocale} of specified locale. Returns US English when search failed.
 */
export function findLocaleByProvider(provider: string, target: string): IMappedLocale {
    // load cache when not loaded
    if (!localeCache) {
        const data = readFileSync(resolve(globalThis.appRoot, 'assets/loconv-map.json'));
        localeCache = JSON.parse(data.toString());
    }

    // return matched locale from cache, or US English when failed
    return localeCache!.find(locale => target === locale[provider as keyof typeof locale]) ??
        { discord: 'en-US', google: 'en-US' };
}

