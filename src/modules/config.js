import fs from 'node:fs';
import path from 'node:path';

function initialize() {
    const files = fs.readdirSync(path.join(path.dirname(require.main.filename), '../configs'));
    const configArray = {};
    
    for (const file of files) {
        /* Read file only with ".json" extension. */
        if (!file.endsWith('.json')) continue;

        const currFile = fs.readFileSync(path.join(path.dirname(require.main.filename), '../configs', file));
        Object.assign(configArray, JSON.parse(currFile));
    }
    return configArray;
}

module.exports = initialize();
