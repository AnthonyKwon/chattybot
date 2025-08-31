const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const JSON5 = require('json5');

function initialize() {
    const files = readdirSync(join(appRoot, 'configs'));
    const configArray = {};

    for (let file of files) {
        /* Read file only with ".json/.json5" extension. */
        if ((!file.endsWith('.json') && !file.endsWith('.json5')) || file === 'gcp-credentials.json') continue;

        const currFile = readFileSync(join(appRoot, 'configs', file));
        Object.assign(configArray, JSON5.parse(currFile.toString()));
    }
    return configArray;
}

module.exports = initialize();
