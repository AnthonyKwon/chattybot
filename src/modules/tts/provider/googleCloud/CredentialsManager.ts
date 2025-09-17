import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as path from 'node:path';

// Text-to-Speech client cache
const cache: unique symbol = Symbol.for("ChattyBot:GoogleCloudClientCache");
const getCache = () => (global as any)[cache];
const setCache = (value: TextToSpeechClient) => (global as any)[cache] = value;

/**
 * Create google cloud Text-to-Speech client.<br/>
 * (or retrieve from cache when available)
 * @returns New or cached {@link TextToSpeechClient}.
 */
export function getClient(): TextToSpeechClient {
    let client: TextToSpeechClient = getCache();
    // check if cache is available
    if (!client) {
        let clientOptions: {} | undefined;

        // check if additional options needed (for Service Account Key auth)
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            clientOptions = {
                projectId: require('configs/gcp-credentials.json').project_id,
                keyFilename: path.join(appRoot, 'configs/gcp-credentials.json')
            };
        }

        // try to authenticate with provided credentials and save it in cache
        client = setCache(new TextToSpeechClient(clientOptions));
    }

    // return client saved in cache
    return client;
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