const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');

function initialize() {
    const files = fs.readdirSync(path.join(__dirname, '../../configs'));
    const configArray = {};

    for (let file of files) {
        /* Read file only with ".json/.json5" extension. */
        if ((!file.endsWith('.json') && !file.endsWith('.json5')) || file === 'gcp-credentials.json') continue;

        const currFile = fs.readFileSync(path.join(__dirname, '../../configs', file));
        Object.assign(configArray, JSON5.parse(currFile));
    }
    return configArray;
}

module.exports = initialize();
