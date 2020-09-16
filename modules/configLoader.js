/* Dynamic Config Loader
 * Reads all config from "configs/*.json" */

const fs = require('fs');
const path = require('path');

/* Add element to Object.
 * https://stackoverflow.com/a/55850377 */
const addElement = (ElementList, element) => {
    let newList = Object.assign(ElementList, element);
    return newList;
}

const loadConfig = (target) => {
    const files = fs.readdirSync(path.join(__dirname, '../configs'));
    try {
        for (file of files) {
            /* Read file only with ".json" extension. */
            if (!file.endsWith('.json')) continue;

            const json_read = JSON.parse(fs.readFileSync(path.join(__dirname, '../configs', file)));
            if (json_read[target]) return json_read[target];
        }
    } catch(err) {
        console.error(`[configLoader] Failed to parse config: ${err.stack}`);
    }
}

module.exports = {
    load: target => {
        let returnArray = {};
        for (t of target) {
            returnArray = addElement(returnArray, { [t]: loadConfig(t) });
        }
        return returnArray;
    }
}

