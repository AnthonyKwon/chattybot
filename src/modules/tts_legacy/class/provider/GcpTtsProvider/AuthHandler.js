const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const path = require("node:path");
let clientCache;

function getClient() {
    // check if cache is available
    if (!clientCache) {
        const clientOptions = {
            projectId: undefined,
            keyFilename: undefined
        };

        // check if additional options needed (for Service Account Key auth)
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            clientOptions.projectId = require('configs/gcp-credentials.json').project_id;
            clientOptions.keyFilename = path.join(appRoot, 'configs/gcp-credentials.json');
        }

        // try to authenticate with provided credentials
        clientCache = new TextToSpeechClient(clientOptions);
    }

    // return client saved in cache
    return clientCache;
}

async function verify(client) {
    // send the locale list request with invalid locale for testing
    // this should return empty voices list object like below
    // { voices: [] }
    const [result] = await client.listVoices({ languageCode: 'ne-RD' });
    // check if API returned correct empty object
    if (!result || !result.voices)
        throw new Error('Failed to verify client credentials.');
}

module.exports = {
    getClient,
    verify
}