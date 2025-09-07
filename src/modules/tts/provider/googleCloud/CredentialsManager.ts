import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as path from'node:path';
let clientCache: TextToSpeechClient | undefined;

/**
 * Create google cloud Text-to-Speech client.<br/>
 * (or retrieve from cache when available)
 * @returns New or cached {@link TextToSpeechClient}.
 */
export function getClient(): TextToSpeechClient {
    // check if cache is available
    if (!clientCache) {
        let clientOptions: {} | undefined;

        // check if additional options needed (for Service Account Key auth)
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            clientOptions = {
                projectId: require('configs/gcp-credentials.json').project_id,
                keyFilename: path.join(appRoot, 'configs/gcp-credentials.json')
            };
        }

        // try to authenticate with provided credentials and save it in cache
        clientCache = new TextToSpeechClient(clientOptions);
    }

    // return client saved in cache
    return clientCache;
}

/**
 * Authenticate and verify Text-to-Speech client.
 * @param client - {@link TextToSpeechClient} to verify.
 */
export async function verify(client: TextToSpeechClient): Promise<void> {
    // send the locale list request with invalid locale for testing
    // this should return empty voices list object like below
    // { voices: [] }
    const [result] = await client.listVoices({ languageCode: 'ne-RD' });
    // check if API returned correct empty object
    if (!result || !result.voices)
        throw new Error('Failed to verify client credentials.');
}