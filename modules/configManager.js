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

const readJson = item => {
    const files = fs.readdirSync(path.join(__dirname, '../configs'));
    try {
        for (file of files) {
            /* Read file only with ".json" extension. */
            if (!file.endsWith('.json')) continue;

            const json_read = JSON.parse(fs.readFileSync(path.join(__dirname, '../configs', file)));
            if (json_read[item]) return json_read[item];
        }
    } catch(err) {
        console.error(`[configLoader] Failed to parse config: ${err.stack}`);
    }
}

module.exports = {
    read() {
        let returnArray = new Object();
        for (arg of arguments) {
            returnArray = addElement(returnArray, { [arg]: readJson(arg) });
        }
        return returnArray;
    }
}

