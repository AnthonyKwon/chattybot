const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { Readable } = require('stream');

let ttsConnection = undefined;
const getTtsConnection = () => {
    return ttsConnection;
}
const setTtsConnection = args => {
    ttsConnection = args;
}

let ytConnection = undefined;
const getYtConnection = () => {
    return ytConnection;
}
const setYtConnection = args => {
    ytConnection = args;
}

const getUsername = message => {
    const username = message.client.guilds.cache.get(message.guild.id).member(message.author).displayName;
    return username.split('_').join(' ');
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

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replace) {
        return this.split(search).join(replace);
    }
}

/*
 * @param binary Buffer
 * returns readableInstanceStream Readable
 * https://stackoverflow.com/a/54136803
 */
const bufferToStream = (binary) => {
    const readableInstanceStream = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/verbose.log'), level: 'verbose' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
            format: winston.format.simple(),
        }))
}

module.exports = {
    bufferToStream,
    getTtsConnection,
    setTtsConnection,
    getYtConnection,
    setYtConnection,
    getUsername,
    logger,
    parseTime,
}
