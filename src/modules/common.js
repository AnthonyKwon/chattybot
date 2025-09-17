const { Readable } = require('stream');

/* replace all in string */
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

/*
 * Add padding zero
 * https://stackoverflow.com/a/9744576
*/
const paddy = (num, padlen, padchar) => {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

const datetimePretty = customDate => {
    const currDate = new Date();
    let dateString = String(currDate.getFullYear()).padStart(4, '0');
    dateString = `${dateString}/${String(currDate.getMonth() + 1).padStart(2, '0')}`;
    dateString = `${dateString}/${String(currDate.getDate()).padStart(2, '0')}`;
    dateString = `${dateString} ${String(currDate.getHours()).padStart(2, '0')}`;
    dateString = `${dateString}:${String(currDate.getMinutes()).padStart(2, '0')}`;
    dateString = `${dateString}:${String(currDate.getSeconds()).padStart(2, '0')}`;
    return dateString;
}

// check if application is running as development mode or doing slash-command related job
function isDevMode() {
    if (process.env.NODE_ENV == 'development' || process.env.DEV_MODE == 'true' || process.env.SLASH_ACTION)
        return true;
    else
        return false;
}

const parseTime = param => {
    let time = paddy(Math.floor(param) % 1000, 3);
    time = Math.floor(param / 1000) > 1 ?
        `${paddy((Math.floor(param / 1000)) % 60, 2)}.${time}` : `00.${time}`;
    time = Math.floor((param / (1000 * 60))) ?
        `${paddy(Math.floor((param / (1000 * 60))) % 60, 2)}:${time}` : `00:${time}`;
    time = Math.floor((param / (1000 * 60 * 60))) ?
        `${param / (1000 * 60 * 60)}:${time}` : `00:${time}`
    return time;
}

module.exports = {
    datetimePretty,
    isDevMode,
    parseTime,
    replaceAll
}
