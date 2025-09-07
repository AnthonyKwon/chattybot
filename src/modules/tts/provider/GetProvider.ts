import path from 'path';
import TTSProvider from "./TTSProvider";

/**
 * Get Text-to-Speech provider from its id.
 * @param id - id of the provider.
 * @returns Matching {@link TTSProvider} object.
 * @alpha
 */
export default async function getProvider(id: string): Promise<TTSProvider | undefined> {
    try {
        // try to import the Text-to-Speech provider
        const upperId: string = id.charAt(0).toUpperCase();  // convert to CamelCase
        const provider: any = (await import(path.join(__dirname, id, `${upperId}Provider.ts`))).default;

        // return provider when available
        if (provider && provider.available) return provider;
    } catch (err: any) {
        throw new Error('Matching TTS provider not found.');
    }
}