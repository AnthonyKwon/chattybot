const { existsSync } = require('fs');
const { getClient, verify } = require('./modules/tts/class/provider/GcpTtsProvider/AuthHandler');
const config = require('./modules/config')

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
            console.log('\x1b[33mGOOGLE_APPLICATION_CREDENTIALS\x1b[0m provided, pre-check might take longer.');

            try {
                // try to authenticate with provided credentials
                const client = await getClient();
                // verify if credentials working correctly
                await verify(client);
            } catch (err) {
                console.error(err);
                // credentials not working, show error and exit
                console.error('\x1b[41mFailed to authenticate with Workload Identity Federation credentials!\x1b[0m');
                console.error('Please check if \x1b[33mGOOGLE_APPLICATION_CREDENTIALS\x1b[0m environment variable is correctly set,');
                console.error('or there is any error inside credentials file.');
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

