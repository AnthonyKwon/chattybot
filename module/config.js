const fs = require('fs');
 const path = require('path');

function initialize() {
    const files = fs.readdirSync(path.join(__dirname, '../configs'));
    const configArray = {};
    
    for (file of files) {
        /* Read file only with ".json" extension. */
        if (!file.endsWith('.json')) continue;

        const currFile = fs.readFileSync(path.join(__dirname, '../configs', file));
        Object.assign(configArray, JSON.parse(currFile));
    }
    return configArray;
}

module.exports = initialize();
