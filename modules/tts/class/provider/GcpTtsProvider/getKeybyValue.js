// get object key from value
// https://stackoverflow.com/a/28191966
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

module.exports = getKeyByValue;