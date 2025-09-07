import path from 'path';
import TTSProvider from "./TTSProvider";
import {InvalidProviderError} from "../error/InvalidProviderError";

/**
 * Get Text-to-Speech provider from its id.
 * @param id - id of the provider.
 * @param locale - locale to pass at provider.\
 * @returns Matching {@link TTSProvider} object.
 * @alpha
 */
export default async function getProvider(id: string, locale?: string): Promise<TTSProvider> {
    // try to import the Text-to-Speech provider
    const upperId: string = id.charAt(0).toUpperCase() + id.slice(1);  // convert to CamelCase
    const provider = (await import(path.join(__dirname, id, `${upperId}Provider`))).default;

    // return provider when available
    if (provider && provider.available) return provider.create(locale);
    else throw new InvalidProviderError();
}