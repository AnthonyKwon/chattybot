const { existsSync } = require('fs');
const { join, resolve } = require("node:path");

// pre-check: check if user transpiled typescript
if (!existsSync('./build/main.js')) {
    console.error('\x1b[41mFailed to locate application core!\x1b[0m');
    console.error('Check if you have run \x1b[33m"npm run build"\x1b[0m.');
    console.error('This is required to application to work correctly.');
    process.exit(1);
}

// define the application path
global.devMode = !!process.env.DEV_MODE;
global.appRoot = resolve(__dirname);

// skip extra check and if user asked for slash command actions
if (!!process.env.COMMAND_ACTION) {
    const { register, unregister } = require('./build/modules/discord/command/CommandRegister');
    if (process.env.COMMAND_ACTION === 'register') register();
    else if (process.env.COMMAND_ACTION === 'unregister') unregister();
    else {
        console.error(`\x1b[41mUnknwon command action:\x1b[0m ${process.env.COMMAND_ACTION}`);
        console.error('Please check documentation about command actions.');
        process.exit(1);
    }
    return;
}

// load additional modules which requires app build
const config = require('./build/modules/config/ConfigLoader').default;

// some call requires asynchronous call, warp code with async function
async function preCheck() {
    // pre-check: check if settings file exists
    if (!existsSync('./configs/general.json') || !existsSync('./configs/tts.json')) {
        console.error('\x1b[41mFailed to locate settings configuration!\x1b[0m');
        console.error('You can refer \x1b[33m"configs/general.json.example"\x1b[0m and \x1b[33m"configs/tts.json.example"\x1b[0m to create new one.');
        process.exit(1);
    }

    // pre-check: check if authorization method available for GCP-TTS (when uses it)
    if (config.tts.provider === "GoogleCloud")
    {
        const { getClient, verify } = require('./build/modules/tts/provider/googleCloud/CredentialsManager');

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

// pre-check done. configure app and start main application
preCheck().then(() => require('./build/main'));

