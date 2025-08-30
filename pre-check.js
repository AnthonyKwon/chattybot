const { existsSync } = require('fs');

// pre-check: check if settings file exists
if (!existsSync('./configs/settings.json5')) {
    console.error('\x1b[41mFailed to locate settings configuration!\x1b[0m');
    console.error('You can refer \x1b[33m"configs/settings.json5.example"\x1b[0m to create new one.');
    process.exit(1);
}

const config = require('./src/modules/config.js');

// pre-check: check if gcp-credenctials.json exists when user uses GCP-TTS
if (config.ttsProvider === "GcpTts" && !existsSync('./configs/gcp-credentials.json')) {
    console.error('\x1b[41mFailed to locate Google Cloud Platform credentials!\x1b[0m');
    console.error('Download your Google Cloud Platform credentials, rename to \x1b[33m"gcp-credentials.json"\x1b[0m and put it into configs directory.');
    process.exit(1);
}

// pre-check done. start main application
require('./src/main')