const { existsSync } = require('fs');
const { GoogleAuth } = require('google-auth-library');
const config = require('./modules/config.js')

// some call requires asynchronous call, warp code with async function
async function preCheck() {
    // pre-check: check if settings file exists
    if (!existsSync('./configs/settings.json5')) {
        console.error('\x1b[41mFailed to locate settings configuration!\x1b[0m');
        console.error('You can refer \x1b[33m"configs/settings.json5.example"\x1b[0m to create new one.');
        process.exit(1);
    }

    // pre-check: check if authorization method available for GCP-TTS (when uses it)
    if (config.ttsProvider === "GcpTts")
    {
        // check if Workload Identity Federation available
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log('\x1b[33mGOOGLE_APPLICATION_CREDENTIALS\x1b[0m provided, pre-check might take longer as testing credentials.');
            const auth = new GoogleAuth({
                scopes: 'https://www.googleapis.com/auth/cloud-platform'
            });

            // try to authenticate with provided credentials
            const client = await auth.getClient();
            // send the locale list request with invalid locale for testing
            // this should return empty voices list object like below
            // { voices: [] }
            const url = 'https://texttospeech.googleapis.com/v1beta1/voices?languageCode=ne-RD';
            const res = await client.request({ url });

            // check if API returned correct empty object
            if (!res || !res.data['voices']) {
                console.error('\x1b[41mFailed to authenticate with Workload Identity Federation credentials!\x1b[0m');
                console.error('Please check if, rename to \x1b[33mGOOGLE_APPLICATION_CREDENTIALS\x1b[0m environment variable is correctly set,');
                console.error('or check if there isn\'t any error inside credentials file.');
                process.exit(1);
            }
        }
        // check if Service Account Key available instead
        else if (!existsSync('./configs/gcp-credentials.json'))
        {
            console.error('\x1b[41mFailed to locate Google Cloud Platform credentials!\x1b[0m');
            console.error('Download your Google Cloud Platform credentials, rename to \x1b[33m"gcp-credentials.json"\x1b[0m and put it into configs directory.');
            process.exit(1);
        }
    }
}

// pre-check done. start main application
preCheck().then(() => require('./main'));

